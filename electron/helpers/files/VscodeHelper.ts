import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";
import { spawn } from 'child_process';
import { FileSystemHelper } from "../FileSystemHelper";
import { ConstantValues } from "../../config/constants";
import * as path from 'path';
import * as https from 'https';
import * as os from 'os';
import * as fs from 'fs/promises';

export class VscodeHelper {
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;

  /**
   * URL для скачивания vsdbg файлов для Windows
   */
  private readonly winUrl = 'https://aka.ms/getvsdbgps1';

  /**
   * URL для скачивания vsdbg файлов для Linux
   */
  private readonly linuxUrl = 'https://aka.ms/getvsdbgsh';

  /**
   * Конструктор
   */
  constructor() {
    this.fileSystemHelper = new FileSystemHelper();
  }

  /**
   * Скачивает vsdbg файлы с логированием в реальном времени
   * @param projectConfig Конфигурация проекта
   * @param onLogCallback Колбэк для получения логов в реальном времени
   */
  public async buildVsdbgFilesWithLogs(projectConfig: ProjectConfig, onLogCallback?: (log: string) => void): Promise<void> {
    try {
      const platform = process.platform;
      const arch = process.arch;

      let vsdbgArch: string;
      if (arch === 'x64') {
        vsdbgArch = 'linux-x64';
      } else if (arch === 'arm64') {
        vsdbgArch = 'linux-arm64';
      } else {
        onLogCallback?.(`[VscodeFilesHelper] ❌ Неподдерживаемая архитектура: ${arch}`);
        throw new Error(`Неподдерживаемая архитектура: ${arch}`);
      }

      if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
        onLogCallback?.(`[VscodeFilesHelper] ❌ Неподдерживаемая платформа: ${platform}`);
        throw new Error(`Неподдерживаемая платформа: ${platform}`);
      }
      onLogCallback?.(`[VscodeFilesHelper] 🚀 Начинаем скачивание vsdbg...`);
      onLogCallback?.(`[VscodeFilesHelper] Платформа: ${platform}, Архитектура: ${arch}, Архитектура vsdbg: ${vsdbgArch}`);

      const vsdbgPath = path.join(projectConfig.projectPath, ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG);
      const scriptUrl = platform === 'win32' ? this.winUrl : this.linuxUrl;
      const ext = platform === 'win32' ? 'ps1' : 'sh';
      const scriptPath = path.join(os.tmpdir(), `crm-docker-builder-getvsdbg-${process.pid}-${Date.now()}.${ext}`);

      await this.downloadToFile(scriptUrl, scriptPath, onLogCallback);

      let file: string;
      let args: string[];
      if (platform === 'win32') {
        file = 'powershell.exe';
        args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Version', 'latest', '-RuntimeID', vsdbgArch, '-InstallPath', vsdbgPath];
      } else {
        file = 'bash';
        args = [scriptPath, '-r', vsdbgArch, '-v', 'latest', '-l', vsdbgPath];
      }

      onLogCallback?.(`[VscodeFilesHelper] Команда: ${file} ${JSON.stringify(args)}`);
      onLogCallback?.(`[VscodeFilesHelper] Путь к vsdbg: ${vsdbgPath}`);

      try {
        await this.executeCommandWithLogs(file, args, onLogCallback);
        onLogCallback?.(`[VscodeFilesHelper] ✅ vsdbg для ${vsdbgArch} успешно скачан`);
      } finally {
        await fs.rm(scriptPath, { force: true });
      }
    } catch (error) {
      onLogCallback?.(`[VscodeFilesHelper] ⚠️ Ошибка при скачивании vsdbg файлов: ${error}`);
    }
  }

  /**
   * Создает файл .vscode/launch.json
   * @param crmConfig - конфигурация CRM
   * @returns - содержимое файла .vscode/launch.json
   */
  public async buildVsCodeFiles(crmConfig: CrmConfig, onLog?: (log: string) => void): Promise<void> {
      try {
        onLog?.(`[VscodeFilesHelper] 🚀 Начинаем создание файлов .vscode/launch.json, .vscode/settings.json и .vscode/tasks.json`);
        
        await this.fileSystemHelper.ensureDirectoryExists(path.join(crmConfig.appPath, '.vscode'));

        onLog?.(`[VscodeFilesHelper] Создаем файлы .vscode/launch.json, .vscode/settings.json и .vscode/tasks.json`);
        const launchContent = this.generateVsCodeLaunchJsonContent(crmConfig);
        const settingsContent = this.generateVsCodeSettingsJsonContent(crmConfig);
        const tasksContent = this.generateVsCodeTasksJsonContent(crmConfig);

        onLog?.(`[VscodeFilesHelper] Записываем файлы .vscode/launch.json, .vscode/settings.json и .vscode/tasks.json`);
        await this.fileSystemHelper.writeFile(path.join(crmConfig.appPath, '.vscode', 'launch.json'), launchContent);
        await this.fileSystemHelper.writeFile(path.join(crmConfig.appPath, '.vscode', 'settings.json'), settingsContent);
        await this.fileSystemHelper.writeFile(path.join(crmConfig.appPath, '.vscode', 'tasks.json'), tasksContent);

        onLog?.(`[VscodeFilesHelper] ✅ Файлы .vscode/launch.json, .vscode/settings.json и .vscode/tasks.json успешно созданы`);
      } catch (error) {
        onLog?.(`[VscodeFilesHelper] ❌ Ошибка при создании файла .vscode/launch.json: ${error}`);

        throw error;
      }
  }

  /**
   * Скачивает файл по https-ссылке
   * @param url URL для скачивания
   * @param destPath Путь для сохранения файла
   * @param onLog Колбэк для логирования
   * @param redirectsLeft Оставшееся число редиректов
   */
  private async downloadToFile(url: string, destPath: string, onLog?: (log: string) => void, redirectsLeft = 5): Promise<void> {
    if (new URL(url).protocol !== 'https:') {
      return Promise.reject(new Error('Разрешены только https-ссылки: ' + url));
    }
    return new Promise((resolve, reject) => {
      const req = https.get(url, { headers: { 'User-Agent': 'crm-docker-builder' } }, (res) => {
        this.handleDownloadResponse(res, url, destPath, onLog, redirectsLeft, resolve, reject);
      });
      req.setTimeout(60000, () => req.destroy(new Error('Таймаут скачивания')));
      req.on('error', reject);
    });
  }

  /**
   * Обрабатывает HTTP-ответ при скачивании файла
   */
  private handleDownloadResponse(
    res: import('http').IncomingMessage,
    url: string,
    destPath: string,
    onLog: ((log: string) => void) | undefined,
    redirectsLeft: number,
    resolve: () => void,
    reject: (err: Error) => void
  ): void {
    const status = res.statusCode ?? 0;
    if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
      res.resume();
      if (redirectsLeft <= 0) {
        reject(new Error('Превышено число редиректов'));
        return;
      }
      void this.downloadToFile(new URL(res.headers.location, url).toString(), destPath, onLog, redirectsLeft - 1)
        .then(resolve)
        .catch(reject);
      return;
    }
    if (status !== 200) {
      reject(new Error(`HTTP ${status} при скачивании ${url}`));
      return;
    }
    const chunks: Buffer[] = [];
    res.on('data', (chunk: Buffer) => chunks.push(chunk));
    res.on('end', () => {
      void (async () => {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(destPath, buffer);
        onLog?.(`[VscodeFilesHelper] Скрипт установки сохранён: ${destPath} (${buffer.length} байт)`);
        resolve();
      })().catch(reject);
    });
    res.on('error', reject);
  }

  /**
   * Выполняет команду с логированием в реальном времени
   * @param file Исполняемый файл
   * @param args Аргументы команды
   * @param onLogCallback Колбэк для получения логов
   */
  private async executeCommandWithLogs(file: string, args: string[], onLogCallback?: (log: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(file, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });

      childProcess.stdout.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          onLogCallback?.(`[VscodeFilesHelper] ${log}`);
        }
      });

      childProcess.stderr.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          onLogCallback?.(`[VscodeFilesHelper] ${log}`);
        }
      });

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`code: ${code}`));
        }
      });

      childProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Генерирует содержимое файла .vscode/launch.json
   * @param crmConfig - конфигурация CRM
   * @returns - содержимое файла .vscode/launch.json
   */
  private generateVsCodeLaunchJsonContent(crmConfig: CrmConfig): string {
    const runtimeExecutable = process.platform === 'win32' ? 'powershell' : '/bin/bash';
    const appHandlerFile = process.platform === 'win32' ? ConstantValues.FILE_NAMES.APP_HANDLER_PS : ConstantValues.FILE_NAMES.APP_HANDLER;
    const workspaceConsoleHandlerFile = process.platform === 'win32' ? ConstantValues.FILE_NAMES.WORKSPACE_CONSOLE_HANDLER_PS : ConstantValues.FILE_NAMES.WORKSPACE_CONSOLE_HANDLER;

    return JSON.stringify({
      "version": "0.2.0",
      "configurations": [
        {
          "name": "🚀 Start All Containers",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${appHandlerFile}`, "start"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "⏹️ Stop Container",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${appHandlerFile}`, "stop"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "⏹️ Stop All Containers",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${appHandlerFile}`, "stopall"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Restart Container",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${appHandlerFile}`, "restart"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔥 Redis Flush Db",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${appHandlerFile}`, "redisflushdb"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Load Packages To FileSystem",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "LoadPackagesToFileSystem"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Load Packages To DB",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "LoadPackagesToDB"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Build Workspace",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "BuildWorkspace"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Rebuild Workspace",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "RebuildWorkspace"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Build Configuration",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "BuildConfiguration"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🔄 Regenerate Schema Sources",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": runtimeExecutable,
          "args": [`\${workspaceFolder}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.PROJ_FILES}/${workspaceConsoleHandlerFile}`, "RegenerateSchemaSources"],
          "console": "integratedTerminal",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
          }
        },
        {
          "name": "🌐 Open in Chrome",
          "request": "launch",
          "type": "chrome",
          "url": `http://localhost:${crmConfig.port}`,
          "webRoot": "${workspaceRoot}",
          "userDataDir": false
        },
        {
          "name": "🐳 .NET Docker Attach",
          "type": "coreclr",
          "request": "attach",
          "processId": "${command:pickRemoteProcess}",
          "pipeTransport": {
            "pipeProgram": "docker",
            "pipeArgs": ["exec", "-i", crmConfig.containerName],
            "debuggerPath": `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG}/vsdbg`,
            "pipeCwd": "${workspaceRoot}",
            "quoteArgs": false
          },
          "sourceFileMap": {
            [ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP]: "${workspaceRoot}"
          },
          "justMyCode": false,
          "requireExactSource": true,
          "suppressJITOptimizations": true
        },
        {
          "name": "🐳 .NET Docker Attach (Auto)",
          "type": "coreclr",
          "request": "attach",
          "processId": "1",
          "pipeTransport": {
            "pipeProgram": "docker",
            "pipeArgs": ["exec", "-i", crmConfig.containerName],
            "debuggerPath": `${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP}/${ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.VSDBG}/vsdbg`,
            "pipeCwd": "${workspaceRoot}",
            "quoteArgs": false
          },
          "sourceFileMap": {
            [ConstantValues.FOLDER_NAMES.CRM_PATHS_DOCKER.APP]: "${workspaceRoot}"
          },
          "justMyCode": false,
          "requireExactSource": true,
          "suppressJITOptimizations": true
        }
      ]
    }, null, 2);
  }

  /**
   * Генерирует содержимое файла .vscode/settings.json
   * @param crmConfig - конфигурация CRM
   * @returns - содержимое файла .vscode/settings.json
   */
  private generateVsCodeSettingsJsonContent(crmConfig: CrmConfig): string {
    let crmPrefix = crmConfig.crmType === 'bpmsoft' ? 'BPMSoft' : 'Terrasoft';
    return JSON.stringify({
        "dotnet.defaultSolution": `${crmPrefix}.Configuration/${crmPrefix}.Configuration.Dev.sln`,
        "cSpell.words": [
          "accountingreports"
        ]
      }, null, 2);
  }

  /**
   * Генерирует содержимое файла .vscode/tasks.json
   * @param crmConfig - конфигурация CRM
   * @returns - содержимое файла .vscode/tasks.json
   */
  private generateVsCodeTasksJsonContent(crmConfig: CrmConfig): string {
      return JSON.stringify({
        "version": "2.0.0",
        "tasks": []
      }, null, 2);
  }
}