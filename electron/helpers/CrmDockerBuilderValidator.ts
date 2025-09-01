import * as path from 'path';
import { BaseContainerConfig, CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig, ValidateCrmResult, ValidateProjectResult } from '@shared/api';
import { FileSystemHelper } from './FileSystemHelper';
import { ConstantValues } from '../config/constants';

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
   * Проверяет, существует ли конфигурация контейнера
   * @param containerConfig - конфигурация контейнера
   * @returns результат проверки
   */
  private async validateBaseContainerSettings(containerConfig: BaseContainerConfig): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    // Проверяем, существует ли название контейнера
    if (!containerConfig.containerName) {
      result.success = false;
      result.message = 'Название контейнера Postgres не может быть пустым';
    }
    // Проверяем, существует ли порт
    if (!containerConfig.port) {
      result.success = false;
      result.message = 'Порт не может быть пустым';
    }
    // Проверяем, существует ли путь к папке
    if (!containerConfig.volumePath) {
      result.success = false;
      result.message = 'Путь к папке не может быть пустым';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация проекта
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  public async validateGeneralProjectSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    // Проверяем, существует ли название проекта
    if (!projectConfig.projectName) {
      result.success = false;
      result.message = 'Название проекта не может быть пустым';
    }

    // Проверяем, существует ли путь к проекту
    if (!projectConfig.projectPath) {
      result.success = false;
      result.message = 'Путь к проекту не может быть пустым';
    }

    // Проверяем, существует ли папка
    const pathExists = await this.fileSystemHelper.pathExists(projectConfig.projectPath);
    if (!pathExists) {
      result.success = false;
      result.message = 'Папка не существует';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация Postgres
   * @param projectConfig - конфигурация проекта
   * @param postgresConfig - конфигурация Postgres
   * @returns результат проверки
   */
  public async validatePostgresSettings(projectConfig: ProjectConfig, postgresConfig: PostgresConfig): Promise<ValidateProjectResult> {
    let result = await this.validateBaseContainerSettings(postgresConfig);
    // Проверяем, существует ли имя пользователя
    if (!projectConfig.postgresConfig.user) {
      result.success = false;
      result.message = 'Имя пользователя не может быть пустым';
    }
    // Проверяем, существует ли пароль
    if (!projectConfig.postgresConfig.password) {
      result.success = false;
      result.message = 'Пароль не может быть пустым';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация PgAdmin
   * @param projectConfig - конфигурация проекта
   * @param pgAdminConfig - конфигурация PgAdmin
   * @returns результат проверки
   */
  public async validatePgAdminSettings(projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig): Promise<ValidateProjectResult> {
    let result = await this.validateBaseContainerSettings(pgAdminConfig);
    // Проверяем, существует ли email
    if (!projectConfig.pgAdminConfig.email) {
      result.success = false;
      result.message = 'Email не может быть пустым';
    }
    // Проверяем, существует ли пароль
    if (!projectConfig.pgAdminConfig.password) {
      result.success = false;
      result.message = 'Пароль не может быть пустым';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация Redis
   * @param projectConfig - конфигурация проекта
   * @param redisConfig - конфигурация Redis
   * @returns результат проверки
   */
  public async validateRedisSettings(projectConfig: ProjectConfig, redisConfig: RedisConfig): Promise<ValidateProjectResult> {
    let result = await this.validateBaseContainerSettings(redisConfig);
    // Проверяем, существует ли пароль
    if (!projectConfig.redisConfig.password) {
      result.success = false;
      result.message = 'Пароль не может быть пустым';
    }
    // Проверяем, существует ли количество баз данных
    if (!projectConfig.redisConfig.dbCount) {
      result.success = false;
      result.message = 'Количество баз данных не может быть пустым';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация Rabbitmq
   * @param projectConfig - конфигурация проекта
   * @param rabbitmqConfig - конфигурация Rabbitmq
   * @returns результат проверки
   */
  public async validateRabbitmqSettings(projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig): Promise<ValidateProjectResult> {
    let result = await this.validateBaseContainerSettings(rabbitmqConfig);
    // Проверяем, существует ли пароль
    if (!projectConfig.rabbitmqConfig.user) {
      result.success = false;
      result.message = 'Имя пользователя не может быть пустым';
    }
    // Проверяем, существует ли пароль
    if (!projectConfig.rabbitmqConfig.password) {
      result.success = false;
      result.message = 'Пароль пользователя не может быть пустым';
    }
    return result;
  }

  /**
   * Проверяет, существует ли конфигурация CRM
   * @param projectConfig - конфигурация проекта
   * @param crmConfig - конфигурация CRM
   * @returns результат проверки
   */
  public async validateCrmSetting(projectConfig: ProjectConfig, crmConfig: CrmConfig): Promise<ValidateProjectResult> {
    let generalResult = await this.validateBaseContainerSettings(crmConfig);
    if (!generalResult.success) {
      return generalResult;
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.appPath) {
      return {
        success: false,
        message: 'Путь к папке приложения не может быть пустым'
      };
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.backupPath) {
      return {
        success: false,
        message: 'Путь к папке резервных копий не может быть пустым'
      };
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.redisDb) {
      return {
        success: false,
        message: 'Номер базы данных не может быть пустым'
      };
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.dbType) {
      return {
        success: false,
        message: 'Тип базы данных не может быть пустым'
      };
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.netVersion) {
      return {
        success: false,
        message: 'Версия .NET не может быть пустой'
      };
    }
    // Проверяем, существует ли путь к папке
    if (!crmConfig.crmType) {
      return {
        success: false,
        message: 'Тип CRM не может быть пустым'
      };
    }

    // Проверяем, существует ли путь к папке
    const appPathResult = await this.validateAppPath(projectConfig.projectPath, crmConfig.appPath);
    if (!appPathResult.success) {
      return {
        success: false,
        message: appPathResult.message
      };
    }

    // Проверяем, существует ли файл резервных копий
    const backupPathResult = await this.validateBackupPath(crmConfig.backupPath);
    if (!backupPathResult.success) {
      return {
        success: false,
        message: backupPathResult.message
      };
    }

    return {
      success: true,
      message: 'Все настройки корректны'
    };
  }

  /**
   * Проверяет, существует ли файл резервных копий
   * @param crmConfig - конфигурация CRM
   * @returns результат проверки
   */
  public async validateAppPath(projectPath: string, appPath: string): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };

    // Проверяем, что appPath не пустой
    if (!appPath) {
      result.success = false;
      result.message = 'Путь к приложению не может быть пустым';
      return result;
    }

    // Проверяем, существует ли папка приложения
    const appPathExists = await this.fileSystemHelper.pathExists(appPath);
    if (!appPathExists) {
      result.success = false;
      result.message = 'Папка приложения не существует';
      return result;
    }

    // Проверяем, что appPath находится внутри projectPath
    if (!this.fileSystemHelper.isPathInside(appPath, path.join(projectPath, ConstantValues.FOLDER_NAMES.CRM_VOLUMES))) {
      result.success = false;
      result.message = 'Папка приложения должна находиться внутри папки проекта';
      return result;
    }

    // Проверяем, существует ли файлы в папке
    const files = await this.fileSystemHelper.getFilesInDirectory(appPath);
    if (files.length === 0) {
      result.success = false;
      result.message = 'Папка приложения пуста';
      return result;
    }

    if (!files.includes('appsettings.json')) {
      result.success = false;
      result.message = 'Файл appsettings.json не найден';
      return result;
    }

    if (!files.includes('ConnectionStrings.config')) {
      result.success = false;
      result.message = 'Файл ConnectionStrings.config не найден';
      return result;
    }

    if (!files.includes('Terrasoft.WebHost.dll.config') && !files.includes('BPMSoft.WebHost.dll.config')) {
      result.success = false;
      result.message = 'Файл Terrasoft.WebHost.dll.config или BPMSoft.WebHost.dll.config не найден';
      return result;
    }

    return result;
  }

  /**
   * Проверяет, существует ли файл резервных копий
   * @param backupPath - путь к файлу резервных копий
   * @returns результат проверки
   */
  public async validateBackupPath(backupPath: string): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    // Проверяем, существует ли файл резервных копий
    const backupPathExists = await this.fileSystemHelper.pathExists(backupPath);
    if (!backupPathExists) {
      result.success = false;
      result.message = 'Файл резервных копий не существует';
    }

    // Проверяем, существует ли файл резервных копий
    if (backupPath && !backupPath.endsWith('.backup')) {
      result.success = false;
      result.message = 'Файл резервных копий должен иметь расширение .backup';
    }
    return result;
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
      result.success = false;
      result.message = 'Конфигурация CRM не найдена';

      return result;
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

    return {
      success: true,
      message: 'Все настройки корректны'
    };
  }

  /**
   * Проверяет, существует ли номер базы данных Redis
   * @param projectConfig - конфигурация проекта
   * @param redisDb - конфигурация Redis
   * @returns результат проверки
   */
  private async validateRedisDb(projectConfig: ProjectConfig, redisDb: number): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    
    if (!redisDb) {
      result.success = false;
      result.message = 'Номер базы данных не может быть пустым';
    }

    if (redisDb > projectConfig.redisConfig.dbCount) {
      result.success = false;
      result.message = 'Номер базы данных не может быть больше количества баз данных';
    }

    return result;
  }

  /**
   * Проверяет, существует ли одинаковые настройки номеров баз данных Redis
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  private async validateCommonRedisDb(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    const redisDbSet = new Set<number>();
    
    for (const crmConfig of projectConfig.crmConfigs) {
      if (redisDbSet.has(crmConfig.redisDb)) {
        result.success = false;
        result.message = `Номер базы данных Redis должен быть уникальным для CRM: ${crmConfig.containerName}`;
        
        return result;
      }
      redisDbSet.add(crmConfig.redisDb);
    }

    return result;
  }

  /**
   * Проверяет, существует ли одинаковые настройки портов
   * @param projectConfig - конфигурация проекта
   * @returns результат проверки
   */
  private async validateCommonPort(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    const portSet = new Set<number>();

    if (portSet.has(projectConfig.postgresConfig.port)) {
      result.success = false;
      result.message = `Порт должен быть уникальным для Postgres: ${projectConfig.postgresConfig.containerName}`;
      return result;
    } 
    portSet.add(projectConfig.postgresConfig.port);

    if (portSet.has(projectConfig.pgAdminConfig.port)) {
      result.success = false;
      result.message = `Порт должен быть уникальным для PgAdmin: ${projectConfig.pgAdminConfig.containerName}`;
      return result;
    }
    portSet.add(projectConfig.pgAdminConfig.port);

    if (portSet.has(projectConfig.redisConfig.port)) {
      result.success = false;
      result.message = `Порт должен быть уникальным для Redis: ${projectConfig.redisConfig.containerName}`;
      return result;
    }
    portSet.add(projectConfig.redisConfig.port);

    
    if (portSet.has(projectConfig.rabbitmqConfig.port)) {
      result.success = false;
      result.message = `Порт должен быть уникальным для Rabbitmq: ${projectConfig.rabbitmqConfig.containerName}`;
      return result;
    }
    portSet.add(projectConfig.rabbitmqConfig.port);
    
    for (const crmConfig of projectConfig.crmConfigs) {
      if (portSet.has(crmConfig.port)) {
        result.success = false;
        result.message = `Порт должен быть уникальным для CRM: ${crmConfig.containerName}`;
        
        return result;
      }
      portSet.add(crmConfig.port);
    }

    return result;
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
