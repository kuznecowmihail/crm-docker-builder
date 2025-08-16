import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import { DEFAULT_WINDOW_CONFIG, DEV_SERVER_URL, PATHS } from '../config/constants';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  private createWindowConfig(): BrowserWindowConstructorOptions {
    return {
      ...DEFAULT_WINDOW_CONFIG,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, PATHS.preload),
      },
    };
  }

  public createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow(this.createWindowConfig());

    // В режиме разработки загружаем Angular dev server
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL(DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      // В продакшене загружаем собранное Angular приложение
      const appPath = path.join(process.cwd(), PATHS.productionApp);
      this.mainWindow.loadFile(appPath);
    }

    return this.mainWindow;
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public closeMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  public getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows();
  }

  public hasWindows(): boolean {
    return this.getAllWindows().length > 0;
  }
}
