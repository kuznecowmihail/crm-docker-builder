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

    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log('process.resourcesPath', process.resourcesPath);

    // В режиме разработки загружаем Angular dev server
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL(ConstantValues.DEV_SERVER_URL);
      this.mainWindow.webContents.openDevTools();
    } else {
      // В продакшене загружаем собранное Angular приложение
      let appPath: string;
      const defaultAppPath = path.join(process.cwd(), ConstantValues.PATHS.productionApp);
      const resourcesAppPath = path.join(process.resourcesPath, 'app', 'angular-app', 'dist', 'angular-app', 'browser', 'index.html');
      console.log('defaultAppPath', defaultAppPath);
      console.log('resourcesAppPath', resourcesAppPath);
      
      // Проверяем, запущено ли приложение из упакованного exe
      if (process.env.NODE_ENV === 'production' || (process.resourcesPath && fs.existsSync(resourcesAppPath))) {
        // В упакованном приложении используем ресурсы
        appPath = resourcesAppPath;
        console.log('📦 Упакованное приложение, путь к ресурсам:', process.resourcesPath);
      } else {
        // В режиме разработки используем обычный путь
        appPath = defaultAppPath;
      }
      
      console.log('📁 Загружаем Angular приложение:', appPath);
      
      // Проверяем существование файла
      if (fs.existsSync(appPath)) {
        console.log('✅ Файл index.html найден');
        
        // Используем file:// протокол для загрузки локального файла
        const fileUrl = `file://${appPath.replace(/\\/g, '/')}`;
        console.log('🔗 URL для загрузки:', fileUrl);
        
        this.mainWindow.loadURL(fileUrl);
      } else {
        console.error('❌ Файл index.html не найден:', appPath);
        
        // Попробуем альтернативные пути
        const alternativePaths = [
          path.join(process.cwd(), 'angular-app', 'dist', 'angular-app', 'browser', 'index.html'),
          path.join(__dirname, '..', 'angular-app', 'dist', 'angular-app', 'browser', 'index.html'),
          path.join(process.resourcesPath || '', 'app', 'angular-app', 'dist', 'angular-app', 'browser', 'index.html')
        ];
        
        console.log('🔍 Проверяем альтернативные пути:');
        for (const altPath of alternativePaths) {
          console.log(`  - ${altPath}: ${fs.existsSync(altPath) ? '✅' : '❌'}`);
        }
        
        // Показываем ошибку пользователю с дополнительной информацией
        this.mainWindow.loadURL(`data:text/html,
          <html>
            <head><title>Ошибка загрузки</title></head>
            <body">
              <p>Не удалось найти файл: <code>${appPath}</code></p>
              <p><strong>Отладочная информация:</strong></p>
              <ul>
                <li>process.cwd(): ${process.cwd()}</li>
                <li>__dirname: ${__dirname}</li>
                <li>process.resourcesPath: ${process.resourcesPath || 'undefined'}</li>
                <li>NODE_ENV: ${process.env.NODE_ENV || 'undefined'}</li>
              </ul>
              <p>Убедитесь, что Angular приложение было собрано корректно.</p>
            </body>
          </html>
        `);
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
