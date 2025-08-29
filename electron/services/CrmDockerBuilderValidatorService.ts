import { ipcMain } from 'electron';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';
import { CrmDockerBuilderValidator } from '../helpers/CrmDockerBuilderValidator';
import { CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';

export class CrmDockerBuilderValidatorService implements IService {
  private validator: CrmDockerBuilderValidator;

  constructor() {
    this.validator = new CrmDockerBuilderValidator();
  }

  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.validator.validateGeneralProjectSettings(projectConfig);
    });

    // Проверка настроек Postgres
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.validator.validatePostgresSettings(projectConfig, postgresConfig);
    });
    
    // Проверка настроек PgAdmin
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.validator.validatePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    // Проверка настроек Redis
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.validator.validateRedisSettings(projectConfig, redisConfig);
    });

    // Проверка настроек Rabbitmq
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_RABBITMQ_SETTINGS, async (event, projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => {
      return await this.validator.validateRabbitmqSettings(projectConfig, rabbitmqConfig);
    });

    // Проверка настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.validator.validateCrmSettings(projectConfig);
    });

    // Проверка настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.validator.validateCrmSetting(projectConfig, crmConfig);
    });

    // Проверка пути к папке приложения
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_APP_PATH, async (event, projectPath: string, appPath: string) => {
      return await this.validator.validateAppPath(projectPath, appPath);
    });

    // Проверка пути к файлу резервных копий
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_BACKUP_PATH, async (event, backupPath: string) => {
      return await this.validator.validateBackupPath(backupPath);
    });

    // Проверка всех настроек
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_VALIDATOR_SYSTEM.VALIDATE_ALL, async (event, projectConfig: ProjectConfig) => {
      return await this.validator.validateAll(projectConfig);
    });
  }
}
