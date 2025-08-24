import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import { ConstantValues } from '../config/constants';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  private createWindowConfig(): BrowserWindowConstructorOptions {
    return {
      ...ConstantValues.DEFAULT_WINDOW_CONFIG,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, ConstantValues.PATHS.preload),
      },
    };
  }

  public createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow(this.createWindowConfig());

    // В режиме разработки загружаем Angular dev server
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL(ConstantValues.DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      // В продакшене загружаем собранное Angular приложение
      const appPath = path.join(process.cwd(), ConstantValues.PATHS.productionApp);
      this.mainWindow.loadFile(appPath);
    }

    return this.mainWindow;
  }

  /**
   * Получить главное окно
   * @returns - главное окно
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Закрыть главное окно
   */
  public closeMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  /**
   * Получить все окна
   * @returns - все окна
   */
  public getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows();
  }

  /**
   * Проверить наличие окон
   * @returns - true, если есть окна
   */
  public hasWindows(): boolean {
    return this.getAllWindows().length > 0;
  }
}
