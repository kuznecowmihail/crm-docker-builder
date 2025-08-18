import { app, ipcMain } from 'electron';
import { SystemInfo } from '../types/api';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class SystemService implements IService {
  public setupHandlers(): void {
    // Получение информации о системе
    ipcMain.handle(IPC_CHANNELS.SYSTEM.INFO, async () => {
      return this.getSystemInfo();
    });

    // Получение версии приложения
    ipcMain.handle(IPC_CHANNELS.SYSTEM.VERSION, async () => {
      return this.getAppVersion();
    });

    // Получение заголовка приложения
    ipcMain.handle(IPC_CHANNELS.SYSTEM.TITLE, async () => {
      return this.getAppTitle();
    });
  }

  public getSystemInfo(): SystemInfo {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome
    };
  }

  public getAppTitle(): string {
    return app.getName();
  }

  public getAppVersion(): string {
    return app.getVersion();
  }
}
