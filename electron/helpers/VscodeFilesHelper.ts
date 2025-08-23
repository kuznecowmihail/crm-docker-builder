import { CrmConfig, ProjectConfig } from "@shared/crm-docker-builder";
import { spawn } from 'child_process';
import path from "path";
import { FileSystemHelper } from "./FileSystemHelper";

export class VscodeFilesHelper {
  /**
   * Помощник для работы с файловой системой
   */
  private fileSystemHelper: FileSystemHelper;

  /**
   * URL для скачивания vsdbg файлов для Windows
   */
  private winUrl: string = 'https://aka.ms/getvsdbgps1';

  /**
   * URL для скачивания vsdbg файлов для Linux
   */
  private linuxUrl: string = 'https://aka.ms/getvsdbgsh';

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

      let vsdbgArch = 'linux-x64'

      if (arch === 'x64') {
        vsdbgArch = 'linux-x64';
      } else if (arch === 'arm64') {
        vsdbgArch = 'linux-arm64';
      } else {
        onLogCallback?.(`[VscodeFilesHelper] ❌ Неподдерживаемая архитектура: ${arch}`);
        throw new Error(`Неподдерживаемая архитектура: ${arch}`);
      }

      if (platform !== 'win32' && arch !== 'arm64') {
        onLogCallback?.(`[VscodeFilesHelper] ❌ Неподдерживаемая платформа: ${platform}`);
        throw new Error(`Неподдерживаемая платформа: ${platform}`);
      }
      onLogCallback?.(`[VscodeFilesHelper] 🚀 Начинаем скачивание vsdbg...`);
      onLogCallback?.(`[VscodeFilesHelper] Платформа: ${platform}, Архитектура: ${arch}, Архитектура vsdbg: ${vsdbgArch}`);

      let command = '';
      const vsdbgPath = path.join(projectConfig.projectPath, 'vsdbg');

      if (platform === 'win32') {
        // Windows - используем PowerShell
        command = `powershell -NoProfile -ExecutionPolicy RemoteSigned -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -useb '${this.winUrl}'))) -Version latest -RuntimeID ${vsdbgArch} -InstallPath ${vsdbgPath}"`;
      } else if (platform === 'darwin' || platform === 'linux') {
        // macOS или Linux - используем curl
        command = `curl -sSL ${this.linuxUrl} | bash /dev/stdin -r ${vsdbgArch} -v latest -l ${vsdbgPath}`;
      }
      onLogCallback?.(`[VscodeFilesHelper] Команда: ${command}`);
      onLogCallback?.(`[VscodeFilesHelper] Путь к vsdbg: ${vsdbgPath}`);
      await this.executeCommandWithLogs(command, onLogCallback, vsdbgArch);
      
      onLogCallback?.(`[VscodeFilesHelper] ✅ vsdbg для ${vsdbgArch} успешно скачан`);
      
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
   * Выполняет команду с логированием в реальном времени
   * @param command Команда для выполнения
   * @param onLogCallback Колбэк для получения логов
   * @param archType Тип архитектуры для логирования
   */
  private async executeCommandWithLogs(command: string, onLogCallback?: (log: string) => void, archType?: string): Promise<void> {
    return new Promise((resolve, reject) => {

      const process = spawn(command, [], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      process.stdout.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          onLogCallback?.(`[VscodeFilesHelper] ${log}`);
        }
      });

      process.stderr.on('data', (data) => {
        const log = data.toString().trim();
        if (log) {
          onLogCallback?.(`[VscodeFilesHelper] ${log}`);
        }
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`code: ${code}`));
        }
      });

      process.on('error', (error) => {
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
    return JSON.stringify({
      "version": "0.2.0",
      "configurations": [
        {
          "name": "🚀 Start All Containers",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh"],
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
          "name": "📊 Show Status",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "status"],
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
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "stop"],
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
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "stopall"],
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
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "restart"],
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
          "name": "🔄 Restart All Containers",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "restartall"],
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
          "name": "📋 Show Logs",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "logs"],
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
          "name": "❓ Show Help",
          "type": "node",
          "request": "launch",
          "runtimeExecutable": "/bin/bash",
          "args": ["${workspaceFolder}/_start_docker.sh", "help"],
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
            "debuggerPath": "/app/vsdbg/vsdbg",
            "pipeCwd": "${workspaceRoot}",
            "quoteArgs": false
          },
          "sourceFileMap": {
            "/app": "${workspaceRoot}"
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
            "debuggerPath": "/app/vsdbg/vsdbg",
            "pipeCwd": "${workspaceRoot}",
            "quoteArgs": false
          },
          "sourceFileMap": {
            "/app": "${workspaceRoot}"
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
      return JSON.stringify({
        "dotnet.defaultSolution": "BPMSoft.Configuration/BPMSoft.Configuration.Dev.sln",
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