import { ipcMain } from 'electron';
import { CrmConfig, PgAdminConfig, PostgresConfig, ProjectConfig, RabbitmqConfig, RedisConfig } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';
import { CrmDockerBuilderHelper } from '../helpers/CrmDockerBuilderHelper';
import { FileSystemHelper } from '../helpers/FileSystemHelper';
import path from 'path';

export class CrmDockerBuilderService implements IService {
  private helper: CrmDockerBuilderHelper;
  private fileSystemHelper: FileSystemHelper;

  constructor() {
    this.helper = new CrmDockerBuilderHelper();
    this.fileSystemHelper = new FileSystemHelper();
  }

  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.CREATE_PROJECT, async (event, path: string) => {
      return await this.helper.createProject(path);
    });

    // Открытие проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.OPEN_PROJECT, async (event, path: string) => {
      return await this.helper.openProject(path);
    });

    // Сохранение настроек проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_GENERAL_PROJECT_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveGeneralProjectSettings(projectConfig);
    });
    
    // Сохранение настроек Postgres
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_POSTGRES_SETTINGS, async (event, projectConfig: ProjectConfig, postgresConfig: PostgresConfig) => {
      return await this.helper.savePostgresSettings(projectConfig, postgresConfig);
    });
    
    // Сохранение настроек PgAdmin
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_PGADMIN_SETTINGS, async (event, projectConfig: ProjectConfig, pgAdminConfig: PgAdminConfig) => {
      return await this.helper.savePgAdminSettings(projectConfig, pgAdminConfig);
    });
    
    // Сохранение настроек Redis
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_REDIS_SETTINGS, async (event, projectConfig: ProjectConfig, redisConfig: RedisConfig) => {
      return await this.helper.saveRedisSettings(projectConfig, redisConfig);
    });
    
    // Сохранение настроек Rabbitmq
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_RABBITMQ_SETTINGS, async (event, projectConfig: ProjectConfig, rabbitmqConfig: RabbitmqConfig) => {
      return await this.helper.saveRabbitmqSettings(projectConfig, rabbitmqConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTING, async (event, projectConfig: ProjectConfig, crmConfig: CrmConfig) => {
      return await this.helper.saveCrmSetting(projectConfig, crmConfig);
    });
    
    // Сохранение настроек CRM
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.SAVE_CRM_SETTINGS, async (event, projectConfig: ProjectConfig) => {
      return await this.helper.saveCrmSettings(projectConfig);
    });

    // Сборка проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.BUILD_PROJECT, async (event: Electron.IpcMainInvokeEvent, projectConfig: ProjectConfig) => {
      let logText = '';
      const logName = `build-project-${projectConfig.projectName}-${new Date().toISOString().replace(':', '.').replace('T', '_')}.log`;
      const logPath = path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.LOG_FILES, logName);
      await this.fileSystemHelper.ensureDirectoryExists(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.LOG_FILES));
      await this.fileSystemHelper.writeFile(logPath, logText);
      
      // Создаем колбэк для отправки логов в Angular
      const onLogCallback = (log: string) => {
        event.sender.send('project-log', log);
        console.log(`[CrmDockerBuilderService] ${log.trim()}`);
        
        logText += `${new Date().toISOString()} ${log.trim()}\n`;
      };
      const result = await this.helper.buildProject(projectConfig, onLogCallback);
      await this.fileSystemHelper.writeFile(logPath, logText);
      
      return result;
    });

    // Запуск проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.RUN_PROJECT, async (event: Electron.IpcMainInvokeEvent, projectConfig: ProjectConfig) => {
      let logText = '';
      const logName = `run-project-${projectConfig.projectName}-${new Date().toISOString().replace(':', '.').replace('T', '_')}.log`;
      const logPath = path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.LOG_FILES, logName);
      await this.fileSystemHelper.ensureDirectoryExists(path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.LOG_FILES));
      await this.fileSystemHelper.writeFile(logPath, logText);

      // Создаем колбэк для отправки логов в Angular
      const onLogCallback = (log: string) => {
        event.sender.send('project-log', log);
        console.log(`[CrmDockerBuilderService] ${log.trim()}`);
        
        logText += `${log.trim()}\n`;
      };
      const result = await this.helper.runProject(projectConfig, onLogCallback);
      await this.fileSystemHelper.writeFile(logPath, logText);
      
      return result;
    });
  }
}