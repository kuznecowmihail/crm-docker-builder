import { ipcMain } from 'electron';
import { ProjectConfig } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';
import { CrmDockerBuilderHelper } from '../helpers/CrmDockerBuilderHelper';
import { FileSystemHelper } from '../helpers/FileSystemHelper';
import path from 'path';

// Сервис для работы с CRM Docker Builder
export class CrmDockerBuilderService implements IService {
  /**
   * Помощник для работы с CRM Docker Builder
   */
  private helper: CrmDockerBuilderHelper;
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;

  /**
   * Конструктор
   */
  constructor() {
    this.helper = new CrmDockerBuilderHelper();
    this.fileSystemHelper = new FileSystemHelper();
  }

  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
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