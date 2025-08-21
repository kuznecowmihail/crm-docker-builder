import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BaseContainerConfig, CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RedisConfig, ValidateProjectResult } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class CrmDockerBuilderValidatorService implements IService {
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.validateGeneralProjectSettings(projectConfig);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.validatePostgresSettings(projectConfig, postgresConfig);
    });
    
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.validatePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.validateRedisSettings(projectConfig, redisConfig);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.validateCrmSettings(projectConfig);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.validateCrmSetting(projectConfig, crmConfig);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_APP_PATH, async (event, projectPath: string, appPath: string) => {
      return await this.validateAppPath(projectPath, appPath);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_BACKUP_PATH, async (event, backupPath: string) => {
      return await this.validateBackupPath(backupPath);
    });

    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_ALL, async (event, projectConfig: ProjectConfig) => {
      return await this.validateAll(projectConfig);
    });
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
    const pathExists = await this.pathExists(containerConfig.volumePath);
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
    const pathExists = await this.pathExists(projectConfig.projectPath);
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
    if (!this.isPathInside(appPath, projectPath)) {
      result.success = false;
      result.message = 'Папка приложения должна находиться внутри папки проекта';
      return result;
    }

    // Проверяем, существует ли папка приложения
    const appPathExists = await this.pathExists(appPath);
    if (!appPathExists) {
      result.success = false;
      result.message = 'Папка приложения не существует';
      return result;
    }

    // Проверяем, существует ли файлы в папке
    const files = await this.getFilesInDirectory(appPath);
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
    const backupPathExists = await this.pathExists(backupPath);
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
  public async validateCrmSettings(projectConfig: ProjectConfig): Promise<ValidateProjectResult> {
    let result: ValidateProjectResult = {
      success: true,
      message: 'Все настройки корректны'
    };
    if (!projectConfig.crmConfigs.length) {
      result.success = false;
      result.message = 'Конфигурация CRM не найдена';
    }

    projectConfig.crmConfigs.forEach(async (crmConfig) => {
      result = await this.validateCrmSetting(projectConfig, crmConfig);
    });
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
   * Проверяет, существует ли путь
   * @param path - путь
   * @returns true, если путь существует, false в противном случае
   */
  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает файлы в папке
   * @param path - путь к папке
   * @returns файлы в папке
   */
  private async getFilesInDirectory(path: string): Promise<string[]> {
    try {
      const files = await fs.readdir(path);
      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Проверяет, пустая ли папка
   * @param path - путь к папке
   * @returns true, если папка пустая, false в противном случае
   */
  private async isDirectoryEmpty(path: string): Promise<boolean> {
    try {
      const files = await fs.readdir(path);
      return files.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Проверяет, находится ли один путь внутри другого
   * @param innerPath - внутренний путь
   * @param outerPath - внешний путь
   * @returns true, если innerPath находится внутри outerPath
   */
  private isPathInside(innerPath: string, outerPath: string): boolean {
    try {
      const normalizedInnerPath = path.resolve(innerPath);
      const normalizedOuterPath = path.resolve(outerPath);
      
      return normalizedInnerPath.startsWith(normalizedOuterPath + path.sep) || 
             normalizedInnerPath === normalizedOuterPath;
    } catch (error) {
      return false;
    }
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
