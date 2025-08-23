import { ipcMain } from 'electron';
import { CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';
import { CrmDockerBuilderHelper } from '../helpers/CrmDockerBuilderHelper';

export class CrmDockerBuilderService implements IService {
  private helper: CrmDockerBuilderHelper;

  constructor() {
    this.helper = new CrmDockerBuilderHelper();
  }

  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, async (event, path: string) => {
      return await this.helper.createProject(path);
    });

    // Открытие проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.OPEN_PROJECT, async (event, path: string) => {
      return await this.helper.openProject(path);
    });

    // Сохранение настроек проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveGeneralProjectSettings(projectConfig);
    });
    
    // Сохранение настроек Postgres
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.helper.savePostgresSettings(projectConfig, postgresConfig);
    });
    
    // Сохранение настроек PgAdmin
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.helper.savePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    // Сохранение настроек Redis
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.helper.saveRedisSettings(projectConfig, redisConfig);
    });
    
    // Сохранение настроек Rabbitmq
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_RABBITMQ_SETTINGS, async (event, projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => {
      return await this.helper.saveRabbitmqSettings(projectConfig, rabbitmqConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.helper.saveCrmSetting(projectConfig, crmConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveCrmSettings(projectConfig);
    });

    // Сборка проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.BUILD_PROJECT, async (event: Electron.IpcMainInvokeEvent, projectConfig: ProjectConfig) => {
      // Создаем колбэк для отправки логов в Angular
      const onLogCallback = (log: string) => {
        event.sender.send('project-log', log);
        console.log(`[CrmDockerBuilderService] ${log.trim()}`);
      };
      
      return await this.helper.buildProject(projectConfig, onLogCallback);
    });

    // Запуск проекта
    ipcMain.handle(IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.RUN_PROJECT, async (event: Electron.IpcMainInvokeEvent, projectConfig: ProjectConfig) => {
      // Создаем колбэк для отправки логов в Angular
      const onLogCallback = (log: string) => {
        event.sender.send('project-log', log);
        console.log(`[CrmDockerBuilderService] ${log.trim()}`);
      };
      
      return await this.helper.runProject(projectConfig, onLogCallback);
    });
  }
}