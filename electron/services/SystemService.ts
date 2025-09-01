import { app, ipcMain } from 'electron';
import { SystemInfo } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';

// Сервис для работы с системой
export class SystemService implements IService {
  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    // Получение информации о системе
    ipcMain.handle(ConstantValues.IPC_CHANNELS.SYSTEM.INFO, async () => {
      return this.getSystemInfo();
    });

    // Получение версии приложения
    ipcMain.handle(ConstantValues.IPC_CHANNELS.SYSTEM.VERSION, async () => {
      return this.getAppVersion();
    });

    // Получение заголовка приложения
    ipcMain.handle(ConstantValues.IPC_CHANNELS.SYSTEM.TITLE, async () => {
      return this.getAppTitle();
    });
  }

  /**
   * Получить информацию о системе
   * @returns - информация о системе
   */
  public getSystemInfo(): SystemInfo {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome
    };
  }

  /**
   * Получить заголовок приложения
   * @returns - заголовок приложения
   */
  public getAppTitle(): string {
    return app.getName();
  }

  /**
   * Получить версию приложения
   * @returns - версия приложения
   */
  public getAppVersion(): string {
    return app.getVersion();
  }
}
