import * as path from 'path';
import * as os from 'os';
import { promises as fsPromises } from 'fs';
import { BaseContainerConfig, CrmConfig, KeycloakConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig, ValidateCrmResult, ValidateProjectResult } from '@shared/api';
import { FileSystemHelper } from './FileSystemHelper';
import { ConstantValues } from '../config/constants';

const CONTAINER_NAME_REGEX = /^[a-z][a-z0-9_]{0,62}$/;
const KEYCLOAK_CONTAINER_NAME_REGEX = /^[a-z][a-z0-9]{0,62}$/;
const PROJECT_NAME_REGEX = /^[a-z0-9][a-z0-9_-]{0,62}$/;
const USER_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
const PASSWORD_REGEX = /^[A-Za-z0-9!#%&()*+,\-./:<>?@\[\]^_{|}~]{1,128}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const IMAGE_NAME_REGEX = /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[A-Za-z0-9_][A-Za-z0-9._-]{0,127})?(?:@sha256:[a-f0-9]{64})?$/;

// Помощник для работы с CRM Docker Builder Validator
export class CrmDockerBuilderValidator {
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;
  
  /**
   * Конструктор
   */
  constructor() {
    this.fileSystemHelper = new FileSystemHelper();
  }

  /**
   * Проверяет, является ли значение допустимым портом
   * @param v - значение порта
   * @returns true, если порт допустим
   */
  private isValidPort(v: unknown): boolean {
    return Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 65535;
  }

  /**
   * Возвращает результат неуспешной валидации
   * @param message - сообщение об ошибке
   * @returns результат проверки
   */
  private fail(message: string): ValidateProjectResult {
    return { success: false, message };
  }

  /**
   * Возвращает результат успешной валидации
   * @returns результат проверки
   */
  private ok(): ValidateProjectResult {
    return { success: true, message: 'Все настройки корректны' };
  }

  /**
   * Возвращает список запрещённых корневых директорий для пути проекта
   * @returns массив абсолютных путей
   */
  private getForbiddenRoots(): string[] {
    if (process.platform === 'win32') {
      return [
        process.env.SystemRoot,
        process.env.ProgramFiles,
        process.env['ProgramFiles(x86)'],
        process.env.ProgramData,
        (process.env.SystemDrive ?? 'C:') + path.sep,
      ]
        .filter((root): root is string => Boolean(root))
        .map((root) => path.resolve(root));
    }
    return ['/', '/etc', '/usr', '/bin', '/sbin', '/var', '/System', '/Library', '/Applications', '/private'].map(
      (root) => path.resolve(root)
    );
  }

  /**
   * Проверяет, указывает ли путь на системную директорию
   * @param resolved - абсолютный путь к проекту
   * @returns true, если путь запрещён
   */
  private isSystemDirectory(resolved: string): boolean {
    const forbiddenRoots = this.getForbiddenRoots();
    return forbiddenRoots.some(
      (root) => this.fileSystemHelper.isPathInside(resolved, root)
    );
  }

  /**
   * Проверяет существование и тип директории проекта
   * @param resolved - абсолютный путь к проекту
   * @returns результат проверки
   */
  private async validateProjectDirectoryExists(resolved: string): Promise<ValidateProjectResult> {
    try {
      const stat = await fsPromises.stat(resolved);
      if (!stat.isDirectory()) {
        return this.fail('Папка проекта не существует');
      }
      return this.ok();
    } catch {
      return this.fail('Папка проекта не существует');
    }
  }

  /**
   * Проверяет путь к проекту
   * @param projectPath - путь к папке проекта
   * @returns результат проверки
   */
  public async validateProjectPath(projectPath: string): Promise<ValidateProjectResult> {
    if (typeof projectPath !== 'string' || !projectPath) {
      return this.fail('Путь к проекту не может быть пустым');
    }
    if (!path.isAbsolute(projectPath)) {
      return this.fail('Путь к проекту должен быть абсолютным');
    }
    if (projectPath.split(/[\\/]+/).includes('..')) {
      return this.fail('Путь к проекту не должен содержать ".."');
    }

    const resolved = path.resolve(projectPath);
    if (this.fileSystemHelper.isSamePath(resolved, os.homedir())) {
      return this.fail('Путь к проекту не может быть домашней директорией пользователя');
    }
    if (this.isSystemDirectory(resolved)) {
      return this.fail('Путь к проекту указывает на системную директорию');
    }

    return await this.validateProjectDirectoryExists(resolved);
  }

  /**
   * Проверяет базовые настройки контейнера
   * @param containerConfig - конфигурация контейнера
   * @param projectPath - путь к папке проекта
   * @returns результат проверки
   */
  private async validateBaseContainerSettings(
    containerConfig: BaseContainerConfig,
    projectPath: string
  ): Promise<ValidateProjectResult> {
    const { containerName, port, volumePath } = containerConfig;

    if (!containerName) {
      return this.fail('Название контейнера не может быть пустым');
    }
    if (!CONTAINER_NAME_REGEX.test(containerName)) {
      return this.fail(
        `Название контейнера "${containerName}" некорректно: допустимы только строчные латинские буквы, цифры и "_", первый символ — буква, не более 63 символов`
      );
    }
    if (!this.isValidPort(port)) {
      return this.fail('Порт должен быть целым числом от 1 до 65535');
    }
    if (!volumePath) {
      return this.fail('Путь к папке не может быть пустым');
    }
    if (!path.isAbsolute(volumePath) || !this.fileSystemHelper.isPathInside(volumePath, projectPath)) {
      return this.fail('Путь к папке должен быть абсолютным и находиться внутри папки проекта');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  public async validateGeneralProjectSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    if (!projectConfig.projectName) {
      return this.fail('Название проекта не может быть пустым');
    }
    if (!PROJECT_NAME_REGEX.test(projectConfig.projectName)) {
      return this.fail(
        `Название проекта "${projectConfig.projectName}" некорректно: допустимы строчные латинские буквы, цифры, "-" и "_", первый символ — буква или цифра`
      );
    }
    if (!projectConfig.containerRuntime || !['docker', 'podman'].includes(projectConfig.containerRuntime)) {
      return this.fail('Движок контейнеров должен быть docker или podman');
    }

    return await this.validateProjectPath(projectConfig.projectPath);
  }

  /**
   * Проверяет, существует ли конфигурация Postgres
   * @param projectConfig - конфигурация проекта
   * @param postgresConfig - конфигурация Postgres
   * @returns результат проверки
   */
  public async validatePostgresSettings(
    projectConfig: ProjectConfig,
    postgresConfig: PostgresConfig
  ): Promise<ValidateProjectResult> {
    const baseResult = await this.validateBaseContainerSettings(postgresConfig, projectConfig.projectPath);
    if (!baseResult.success) {
      return baseResult;
    }
    if (!postgresConfig.user || !USER_NAME_REGEX.test(postgresConfig.user)) {
      return this.fail('Имя пользователя некорректно: латинские буквы, цифры и "_", первый символ — буква или "_"');
    }
    if (!postgresConfig.password || !PASSWORD_REGEX.test(postgresConfig.password)) {
      return this.fail(
        'Пароль некорректен: 1–128 символов, только латинские буквы, цифры и символы !#%&()*+,-./:<>?@[]^_{|}~ (без пробелов, кавычек, ";", "=", "$", "\\", "`")'
      );
    }
    if (!IMAGE_NAME_REGEX.test(postgresConfig.dockerImageName)) {
      return this.fail('Имя Docker-образа некорректно');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация PgAdmin
   * @param projectConfig - конфигурация проекта
   * @param pgAdminConfig - конфигурация PgAdmin
   * @returns результат проверки
   */
  public async validatePgAdminSettings(
    projectConfig: ProjectConfig,
    pgAdminConfig: PgAdminConfig
  ): Promise<ValidateProjectResult> {
    const baseResult = await this.validateBaseContainerSettings(pgAdminConfig, projectConfig.projectPath);
    if (!baseResult.success) {
      return baseResult;
    }
    if (!pgAdminConfig.email || !EMAIL_REGEX.test(pgAdminConfig.email)) {
      return this.fail('Email некорректен');
    }
    if (!pgAdminConfig.password || !PASSWORD_REGEX.test(pgAdminConfig.password)) {
      return this.fail(
        'Пароль некорректен: 1–128 символов, только латинские буквы, цифры и символы !#%&()*+,-./:<>?@[]^_{|}~ (без пробелов, кавычек, ";", "=", "$", "\\", "`")'
      );
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация Redis
   * @param projectConfig - конфигурация проекта
   * @param redisConfig - конфигурация Redis
   * @returns результат проверки
   */
  public async validateRedisSettings(
    projectConfig: ProjectConfig,
    redisConfig: RedisConfig
  ): Promise<ValidateProjectResult> {
    const baseResult = await this.validateBaseContainerSettings(redisConfig, projectConfig.projectPath);
    if (!baseResult.success) {
      return baseResult;
    }
    if (!redisConfig.password || !PASSWORD_REGEX.test(redisConfig.password)) {
      return this.fail(
        'Пароль некорректен: 1–128 символов, только латинские буквы, цифры и символы !#%&()*+,-./:<>?@[]^_{|}~ (без пробелов, кавычек, ";", "=", "$", "\\", "`")'
      );
    }
    if (!Number.isInteger(redisConfig.dbCount) || redisConfig.dbCount < 1 || redisConfig.dbCount > 16384) {
      return this.fail('Количество баз данных должно быть целым числом от 1 до 16384');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация Rabbitmq
   * @param projectConfig - конфигурация проекта
   * @param rabbitmqConfig - конфигурация Rabbitmq
   * @returns результат проверки
   */
  public async validateRabbitmqSettings(
    projectConfig: ProjectConfig,
    rabbitmqConfig: RabbitmqConfig
  ): Promise<ValidateProjectResult> {
    const baseResult = await this.validateBaseContainerSettings(rabbitmqConfig, projectConfig.projectPath);
    if (!baseResult.success) {
      return baseResult;
    }
    if (!rabbitmqConfig.user || !USER_NAME_REGEX.test(rabbitmqConfig.user)) {
      return this.fail('Имя пользователя некорректно: латинские буквы, цифры и "_", первый символ — буква или "_"');
    }
    if (!rabbitmqConfig.password || !PASSWORD_REGEX.test(rabbitmqConfig.password)) {
      return this.fail(
        'Пароль некорректен: 1–128 символов, только латинские буквы, цифры и символы !#%&()*+,-./:<>?@[]^_{|}~ (без пробелов, кавычек, ";", "=", "$", "\\", "`")'
      );
    }
    if (!this.isValidPort(rabbitmqConfig.amqpPort)) {
      return this.fail('AMQP-порт должен быть целым числом от 1 до 65535');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация Keycloak
   * @param projectConfig - конфигурация проекта
   * @param keycloakConfig - конфигурация Keycloak
   * @returns результат проверки
   */
  public async validateKeycloakSettings(
    projectConfig: ProjectConfig,
    keycloakConfig: KeycloakConfig
  ): Promise<ValidateProjectResult> {
    const baseResult = await this.validateBaseContainerSettings(keycloakConfig, projectConfig.projectPath);
    if (!baseResult.success) {
      return baseResult;
    }
    if (!KEYCLOAK_CONTAINER_NAME_REGEX.test(keycloakConfig.containerName)) {
      return this.fail(
        `Название контейнера Keycloak "${keycloakConfig.containerName}" не должно содержать "_": это имя используется как адрес внутри сети, а Keycloak не принимает подчёркивание в hostname.`
      );
    }
    if (!keycloakConfig.user || !USER_NAME_REGEX.test(keycloakConfig.user)) {
      return this.fail('Имя пользователя некорректно: латинские буквы, цифры и "_", первый символ — буква или "_"');
    }
    if (!keycloakConfig.password || !PASSWORD_REGEX.test(keycloakConfig.password)) {
      return this.fail(
        'Пароль некорректен: 1–128 символов, только латинские буквы, цифры и символы !#%&()*+,-./:<>?@[]^_{|}~ (без пробелов, кавычек, ";", "=", "$", "\\", "`")'
      );
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация CRM
   * @param projectConfig - конфигурация проекта
   * @param crmConfig - конфигурация CRM
   * @returns результат проверки
   */
  public async validateCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<ValidateProjectResult> {
    const generalResult = await this.validateBaseContainerSettings(crmConfig, projectConfig.projectPath);
    if (!generalResult.success) {
      return generalResult;
    }
    if (!crmConfig.appPath) {
      return this.fail('Путь к папке приложения не может быть пустым');
    }
    if (!crmConfig.backupPath) {
      return this.fail('Путь к папке резервных копий не может быть пустым');
    }
    if (!Number.isInteger(crmConfig.redisDb) || crmConfig.redisDb < 0) {
      return this.fail('Номер базы данных Redis должен быть целым числом ≥ 0');
    }
    if (!ConstantValues.DB_TYPES.includes(crmConfig.dbType)) {
      return this.fail('Недопустимый тип базы данных');
    }
    if (!ConstantValues.NET_VERSIONS.includes(crmConfig.netVersion)) {
      return this.fail('Недопустимая версия .NET');
    }
    if (!ConstantValues.CRM_TYPES.includes(crmConfig.crmType)) {
      return this.fail('Недопустимый тип CRM');
    }

    const appPathResult = await this.validateAppPath(projectConfig.projectPath, crmConfig.appPath);
    if (!appPathResult.success) {
      return appPathResult;
    }

    const backupPathResult = await this.validateBackupPath(crmConfig.backupPath);
    if (!backupPathResult.success) {
      return backupPathResult;
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли файл резервных копий
   * @param crmConfig - конфигурация CRM
   * @returns результат проверки
   */
  public async validateAppPath(projectPath: string, appPath: string): Promise<ValidateProjectResult> {
    if (!appPath) {
      return this.fail('Путь к приложению не может быть пустым');
    }

    const appPathExists = await this.fileSystemHelper.pathExists(appPath);
    if (!appPathExists) {
      return this.fail('Папка приложения не существует');
    }

    if (!this.fileSystemHelper.isPathInside(appPath, path.join(projectPath, ConstantValues.FOLDER_NAMES.CRM_VOLUMES))) {
      return this.fail('Папка приложения должна находиться внутри папки проекта');
    }

    const files = await this.fileSystemHelper.getFilesInDirectory(appPath);
    if (files.length === 0) {
      return this.fail('Папка приложения пуста');
    }

    if (!files.includes('appsettings.json')) {
      return this.fail('Файл appsettings.json не найден');
    }

    if (!files.includes('ConnectionStrings.config')) {
      return this.fail('Файл ConnectionStrings.config не найден');
    }

    if (!files.includes('Terrasoft.WebHost.dll.config') && !files.includes('BPMSoft.WebHost.dll.config')) {
      return this.fail('Файл Terrasoft.WebHost.dll.config или BPMSoft.WebHost.dll.config не найден');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли файл резервных копий
   * @param backupPath - путь к файлу резервных копий
   * @returns результат проверки
   */
  public async validateBackupPath(backupPath: string): Promise<ValidateProjectResult> {
    const backupPathExists = await this.fileSystemHelper.pathExists(backupPath);
    if (!backupPathExists) {
      return this.fail('Файл резервных копий не существует');
    }

    if (backupPath && !backupPath.endsWith('.backup')) {
      return this.fail('Файл резервных копий должен иметь расширение .backup');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли конфигурация CRM
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  public async validateCrmSettings(projectConfig: ProjectConfig): Promise<ValidateCrmResult> {
    let result: ValidateCrmResult = {
      success: true,
      message: 'Все настройки корректны',
      crmConfig: null
    };
    if (!projectConfig.crmConfigs.length) {
      return {
        success: false,
        message: 'Конфигурация CRM не найдена',
        crmConfig: null
      };
    }

    for (const crmConfig of projectConfig.crmConfigs) {
      const redisDbResult = await this.validateRedisDb(projectConfig, crmConfig.redisDb);
      if (!redisDbResult.success) {
        result.success = false;
        result.message = redisDbResult.message;
        result.crmConfig = crmConfig;
      }

      const crmResult = await this.validateCrmSetting(projectConfig, crmConfig);
      if (!crmResult.success) {
        result.success = false;
        result.message = crmResult.message;
        result.crmConfig = crmConfig;
      }
    }

    return result;
  }

  /**
   * Проверяет, существует ли конфигурация проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  public async validateAll(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<ValidateProjectResult> {
    const generalProjectResult = await this.validateGeneralProjectSettings(projectConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек проекта: ${generalProjectResult.message}`);
    if (!generalProjectResult.success) {
      return generalProjectResult;
    }

    const postgresResult = await this.validatePostgresSettings(projectConfig, projectConfig.postgresConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек Postgres: ${postgresResult.message}`);
    if (!postgresResult.success) {
      return postgresResult;
    }

    const pgAdminResult = await this.validatePgAdminSettings(projectConfig, projectConfig.pgAdminConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек PgAdmin: ${pgAdminResult.message}`);
    if (!pgAdminResult.success) {
      return pgAdminResult;
    }

    const redisResult = await this.validateRedisSettings(projectConfig, projectConfig.redisConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек Redis: ${redisResult.message}`);
    if (!redisResult.success) {
      return redisResult;
    }

    const rabbitmqResult = await this.validateRabbitmqSettings(projectConfig, projectConfig.rabbitmqConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек Rabbitmq: ${rabbitmqResult.message}`);
    if (!rabbitmqResult.success) {
      return rabbitmqResult;
    }

    const keycloakResult = await this.validateKeycloakSettings(projectConfig, projectConfig.keycloakConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек Keycloak: ${keycloakResult.message}`);
    if (!keycloakResult.success) {
      return keycloakResult;
    }

    const crmResult = await this.validateCrmSettings(projectConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка настроек CRM: ${crmResult.message}`);
    if (!crmResult.success) {
      return crmResult;
    }

    const commonRedisDbResult = await this.validateCommonRedisDb(projectConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка одинаковых настроек Redis: ${commonRedisDbResult.message}`);
    if (!commonRedisDbResult.success) {
      return commonRedisDbResult;
    }

    const commoPortResult = await this.validateCommonPort(projectConfig);
    onLogCallback?.(`[CrmDockerBuilderValidator] Проверка одинаковых настроек портов: ${commoPortResult.message}`);
    if (!commoPortResult.success) {
      return commoPortResult;
    }

    onLogCallback?.(`[CrmDockerBuilderValidator] Все настройки корректны`);

    return this.ok();
  }

  /**
   * Проверяет, существует ли номер базы данных Redis
   * @param projectConfig - конфигурация проекта
   * @param redisDb - конфигурация Redis
   * @returns результат проверки
   */
  private async validateRedisDb(projectConfig: ProjectConfig, redisDb: number): Promise<ValidateProjectResult> {
    if (!Number.isInteger(redisDb) || redisDb < 0) {
      return this.fail('Номер базы данных Redis должен быть целым числом ≥ 0');
    }

    if (redisDb >= projectConfig.redisConfig.dbCount) {
      return this.fail('Номер базы данных должен быть меньше количества баз данных Redis');
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли одинаковые настройки номеров баз данных Redis
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  private async validateCommonRedisDb(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    const redisDbSet = new Set<number>();
    
    for (const crmConfig of projectConfig.crmConfigs) {
      if (redisDbSet.has(crmConfig.redisDb)) {
        return this.fail(`Номер базы данных Redis должен быть уникальным для CRM: ${crmConfig.containerName}`);
      }
      redisDbSet.add(crmConfig.redisDb);
    }

    return this.ok();
  }

  /**
   * Проверяет, существует ли одинаковые настройки портов
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  private async validateCommonPort(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    const portSet = new Set<number>();

    if (portSet.has(projectConfig.postgresConfig.port)) {
      return this.fail(`Порт должен быть уникальным для Postgres: ${projectConfig.postgresConfig.containerName}`);
    } 
    portSet.add(projectConfig.postgresConfig.port);

    if (portSet.has(projectConfig.pgAdminConfig.port)) {
      return this.fail(`Порт должен быть уникальным для PgAdmin: ${projectConfig.pgAdminConfig.containerName}`);
    }
    portSet.add(projectConfig.pgAdminConfig.port);

    if (portSet.has(projectConfig.redisConfig.port)) {
      return this.fail(`Порт должен быть уникальным для Redis: ${projectConfig.redisConfig.containerName}`);
    }
    portSet.add(projectConfig.redisConfig.port);

    if (portSet.has(projectConfig.rabbitmqConfig.port)) {
      return this.fail(`Порт должен быть уникальным для Rabbitmq: ${projectConfig.rabbitmqConfig.containerName}`);
    }
    portSet.add(projectConfig.rabbitmqConfig.port);

    if (portSet.has(projectConfig.keycloakConfig.port)) {
      return this.fail(`Порт должен быть уникальным для Keycloak: ${projectConfig.keycloakConfig.containerName}`);
    }
    portSet.add(projectConfig.keycloakConfig.port);
    
    for (const crmConfig of projectConfig.crmConfigs) {
      if (portSet.has(crmConfig.port)) {
        return this.fail(`Порт должен быть уникальным для CRM: ${crmConfig.containerName}`);
      }
      portSet.add(crmConfig.port);
    }

    return this.ok();
  }
}
