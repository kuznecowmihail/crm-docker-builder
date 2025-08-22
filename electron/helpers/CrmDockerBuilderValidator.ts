import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseContainerConfig, CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig, ValidateCrmResult, ValidateProjectResult } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';
import { FileSystemHelper } from './FileSystemHelper';
export class CrmDockerBuilderValidator {
  private fileSystemHelper: FileSystemHelper;

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
      message: ''
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

    // Проверяем, существует ли путь к папке
    const pathExists = await this.fileSystemHelper.pathExists(containerConfig.volumePath);
    if (!pathExists) {
      result.success = false;
      result.message = 'Папка не существует';
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
      message: ''
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

    // Проверяем, что appPath находится внутри projectPath
    if (!this.fileSystemHelper.isPathInside(appPath, path.join(projectPath, 'crm-volumes'))) {
      result.success = false;
      result.message = 'Папка приложения должна находиться внутри папки проекта';
      return result;
    }

    // Проверяем, существует ли папка приложения
    const appPathExists = await this.fileSystemHelper.pathExists(appPath);
    if (!appPathExists) {
      result.success = false;
      result.message = 'Папка приложения не существует';
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
    }

    for (const crmConfig of projectConfig.crmConfigs) {
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
  public async validateAll(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    const generalProjectResult = await this.validateGeneralProjectSettings(projectConfig);
    if (!generalProjectResult.success) {
      return generalProjectResult;
    }

    const postgresResult = await this.validatePostgresSettings(projectConfig, projectConfig.postgresConfig);
    if (!postgresResult.success) {
      return postgresResult;
    }

    const pgAdminResult = await this.validatePgAdminSettings(projectConfig, projectConfig.pgAdminConfig);
    if (!pgAdminResult.success) {
      return pgAdminResult;
    }

    const redisResult = await this.validateRedisSettings(projectConfig, projectConfig.redisConfig);
    if (!redisResult.success) {
      return redisResult;
    }

    const rabbitmqResult = await this.validateRabbitmqSettings(projectConfig, projectConfig.rabbitmqConfig);
    if (!rabbitmqResult.success) {
      return rabbitmqResult;
    }

    const crmResult = await this.validateCrmSettings(projectConfig);
    if (!crmResult.success) {
      return crmResult;
    }

    return {
      success: true,
      message: 'Все настройки корректны'
    };
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
