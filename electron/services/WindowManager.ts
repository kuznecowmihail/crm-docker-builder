import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ConstantValues } from '../config/constants';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  private getIconPath(): string | undefined {
    console.log('🔍 Поиск иконки приложения...');

    const iconPath = path.join(process.cwd(), 'electron', 'assets', 'icons', 'icon-512x512.png');
    
    if (fs.existsSync(iconPath)) {
      console.log(`✅ Иконка найдена: ${iconPath}`);
      return iconPath;
    }

    console.warn('❌ Иконка не найдена, будет использована дефолтная иконка');
    return undefined;
  }

  private createWindowConfig(): BrowserWindowConstructorOptions {
    const iconPath = this.getIconPath();
    
    const config: BrowserWindowConstructorOptions = {
      ...ConstantValues.DEFAULT_WINDOW_CONFIG,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, ConstantValues.PATHS.preload),
      },
    };

    // Добавляем иконку только если она найдена
    if (iconPath) {
      config.icon = iconPath;
    }

    return config;
  }

  public createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow(this.createWindowConfig());

    // Дополнительно устанавливаем иконку для окна
    const iconPath = this.getIconPath();
    if (iconPath) {
      console.log(`🎨 Устанавливаем иконку для окна: ${iconPath}`);
      this.mainWindow.setIcon(iconPath);
    }

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
