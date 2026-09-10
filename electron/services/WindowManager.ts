import { BrowserWindow, type BrowserWindowConstructorOptions } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { ConstantValues } from '../config/constants';
import { getAppIconPath, getAppRootPath, getProductionIndexPath } from '../helpers/AssetPathHelper';

// Сервис для работы с окнами
export class WindowManager {
  /**
   * Главное окно
   */
  private mainWindow: BrowserWindow | null = null;

  /**
   * Получить путь к иконке приложения
   * @returns - путь к иконке приложения
   */
  private getIconPath(): string | undefined {
    console.log('🔍 Поиск иконки приложения...');

    const iconPath = getAppIconPath();

    if (iconPath) {
      console.log(`✅ Иконка найдена: ${iconPath}`);
      return iconPath;
    }

    console.warn('❌ Иконка не найдена, будет использована дефолтная иконка');
    return undefined;
  }

  /**
   * Создать конфигурацию окна
   * @returns - конфигурация окна
   */
  private createWindowConfig(): BrowserWindowConstructorOptions {
    const iconPath = this.getIconPath();
    
    const config: BrowserWindowConstructorOptions = {
      ...ConstantValues.DEFAULT_WINDOW_CONFIG,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, ConstantValues.PATHS.preload),
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        navigateOnDragDrop: false,
      },
    };

    // Добавляем иконку только если она найдена
    if (iconPath) {
      config.icon = iconPath;
    }

    return config;
  }

  /**
   * Экранирует спецсимволы HTML для безопасного вывода в data-странице
   * @param value - исходная строка
   * @returns - экранированная строка
   */
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Проверяет, разрешена ли навигация по указанному URL
   * @param url - URL для проверки
   * @returns - true, если навигация разрешена
   */
  private isAllowedNavigation(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'file:') {
        return true;
      }
      if (
        process.env.NODE_ENV === 'development' &&
        parsed.origin === new URL(ConstantValues.DEV_SERVER_URL).origin
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Блокирует небезопасную навигацию и открытие новых окон
   * @param window - окно BrowserWindow
   */
  private hardenWebContents(window: BrowserWindow): void {
    const { webContents } = window;
    webContents.setWindowOpenHandler(({ url }) => {
      console.warn(`🚫 Заблокировано открытие окна: ${url}`);
      return { action: 'deny' };
    });
    webContents.on('will-navigate', (event, url) => {
      if (!this.isAllowedNavigation(url)) {
        console.warn(`🚫 Заблокирована навигация: ${url}`);
        event.preventDefault();
      }
    });
    webContents.on('will-attach-webview', (event) => event.preventDefault());
  }

  /**
   * Генерирует HTML fallback-страницы при ошибке загрузки приложения
   * @param appPath - путь к index.html
   * @returns - HTML-разметка страницы ошибки
   */
  private buildErrorPageHtml(appPath: string): string {
    const escapedAppPath = this.escapeHtml(appPath);
    const escapedAppRoot = this.escapeHtml(getAppRootPath());
    const escapedDirname = this.escapeHtml(__dirname);
    const escapedResourcesPath = this.escapeHtml(process.resourcesPath || 'undefined');
    const escapedNodeEnv = this.escapeHtml(process.env.NODE_ENV || 'undefined');

    return `<html>
      <head><title>Ошибка загрузки</title></head>
      <body>
        <p>Не удалось найти файл: <code>${escapedAppPath}</code></p>
        <p><strong>Отладочная информация:</strong></p>
        <ul>
          <li>app root: ${escapedAppRoot}</li>
          <li>__dirname: ${escapedDirname}</li>
          <li>process.resourcesPath: ${escapedResourcesPath}</li>
          <li>NODE_ENV: ${escapedNodeEnv}</li>
        </ul>
        <p>Убедитесь, что Angular приложение было собрано корректно.</p>
      </body>
    </html>`;
  }

  /**
   * Создать главное окно
   * @returns - главное окно
   */
  public createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow(this.createWindowConfig());
    this.hardenWebContents(this.mainWindow);

    // Дополнительно устанавливаем иконку для окна
    const iconPath = this.getIconPath();
    if (iconPath) {
      console.log(`🎨 Устанавливаем иконку для окна: ${iconPath}`);
      this.mainWindow.setIcon(iconPath);
    }

    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log('process.resourcesPath', process.resourcesPath);

    // В режиме разработки загружаем Angular dev server
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL(ConstantValues.DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      const appPath = getProductionIndexPath();
      console.log('📁 Загружаем Angular приложение:', appPath);

      if (fs.existsSync(appPath)) {
        console.log('✅ Файл index.html найден');
        this.mainWindow.loadFile(appPath);
      } else {
        console.error('❌ Файл index.html не найден:', appPath);
        console.log(`🔍 appPath: ${appPath}, process.resourcesPath: ${process.resourcesPath}`);
        this.mainWindow.loadURL(`data:text/html,${this.buildErrorPageHtml(appPath)}`);
      }
    }

    // Добавляем обработчики событий для диагностики
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ Ошибка загрузки страницы:', {
        errorCode,
        errorDescription,
        validatedURL
      });
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Страница загружена успешно');
    });

    this.mainWindow.webContents.on('dom-ready', () => {
      console.log('✅ DOM готов');
    });

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
