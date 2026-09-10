import { ipcMain } from 'electron';
import { ProjectConfig, InitProjectResult } from '@shared/api';
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
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.BUILD_PROJECT,
      (event, projectConfig: ProjectConfig) =>
        this.runWithLog('build', event, projectConfig, cb => this.helper.buildProject(projectConfig, cb))
    );
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CRM_DOCKER_BUILDER_SYSTEM.RUN_PROJECT,
      (event, projectConfig: ProjectConfig) =>
        this.runWithLog('run', event, projectConfig, cb => this.helper.runProject(projectConfig, cb))
    );
  }

  /**
   * Подготавливает файл лога с проверкой пути проекта
   */
  private async prepareLogFile(kind: 'build' | 'run', projectConfig: ProjectConfig): Promise<string | null> {
    if (
      !projectConfig ||
      typeof projectConfig.projectPath !== 'string' ||
      !path.isAbsolute(projectConfig.projectPath) ||
      !(await this.fileSystemHelper.pathExists(projectConfig.projectPath))
    ) {
      return null;
    }
    const safeName = String(projectConfig.projectName ?? 'project')
      .replace(/[^a-z0-9_-]/gi, '_')
      .slice(0, 63);
    const timestamp = new Date().toISOString().replace(/:/g, '_').replace('T', '_').replace(/\./g, '_');
    const logName = `${kind}-project-${safeName}-${timestamp}.log`;
    const logDir = path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.LOG_FILES);
    const logPath = path.join(logDir, logName);
    await this.fileSystemHelper.ensureDirectoryExists(logDir);
    await this.fileSystemHelper.writeFile(logPath, '');
    return logPath;
  }

  /**
   * Выполняет действие с записью логов в файл
   */
  private async runWithLog(
    kind: 'build' | 'run',
    event: Electron.IpcMainInvokeEvent,
    projectConfig: ProjectConfig,
    action: (cb: (log: string) => void) => Promise<InitProjectResult>
  ): Promise<InitProjectResult> {
    const logPath = await this.prepareLogFile(kind, projectConfig);
    if (!logPath) {
      return { success: false, projectConfig: null, message: 'Некорректный путь к проекту' };
    }
    let logText = '';
    const onLogCallback = (log: string) => {
      event.sender.send('project-log', log);
      console.log(`[CrmDockerBuilderService] ${log.trim()}`);
      logText += `${new Date().toISOString()} ${log.trim()}\n`;
    };
    const result = await action(onLogCallback);
    await this.fileSystemHelper.writeFile(logPath, logText);
    return result;
  }
}
