import { ipcMain } from 'electron';
import { CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';
import { ProjectHelper } from '../helpers/ProjectHelper';

// Сервис для работы с проектом
export class ProjectService implements IService {
  private helper: ProjectHelper;

  /**
   * Конструктор
   */
  constructor() {
    this.helper = new ProjectHelper();
  }

  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.CREATE_PROJECT, async (event, path: string) => {
      return await this.helper.createProject(path);
    });

    // Открытие проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.OPEN_PROJECT, async (event, path: string) => {
      return await this.helper.openProject(path);
    });

    // Сохранение настроек проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveGeneralProjectSettings(projectConfig);
    });
    
    // Сохранение настроек Postgres
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.helper.savePostgresSettings(projectConfig, postgresConfig);
    });
    
    // Сохранение настроек PgAdmin
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.helper.savePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    // Сохранение настроек Redis
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.helper.saveRedisSettings(projectConfig, redisConfig);
    });
    
    // Сохранение настроек Rabbitmq
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_RABBITMQ_SETTINGS, async (event, projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => {
      return await this.helper.saveRabbitmqSettings(projectConfig, rabbitmqConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.helper.saveCrmSetting(projectConfig, crmConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.PROJECT_SYSTEM.SAVE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveCrmSettings(projectConfig);
    });
  }
}