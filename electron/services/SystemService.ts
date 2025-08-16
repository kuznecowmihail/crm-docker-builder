import { app, ipcMain } from 'electron';
import { SystemInfo } from '../types/services';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class SystemService implements IService {
  public setupHandlers(): void {
    // Получение информации о системе
    ipcMain.handle(IPC_CHANNELS.SYSTEM.INFO, async () => {
      return {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.versions.node,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome
      };
    });

    // Получение версии приложения
    ipcMain.handle(IPC_CHANNELS.SYSTEM.VERSION, async () => {
      return app.getVersion();
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

  public getAppVersion(): string {
    return app.getVersion();
  }
}
