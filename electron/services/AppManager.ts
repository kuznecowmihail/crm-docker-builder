import { app } from 'electron';
import { WindowManager } from './WindowManager';
import { SystemService } from './SystemService';
import { DialogService } from './DialogService';
import { NotificationService } from './NotificationService';
import { FileSystemService } from './FileSystemService';

export class AppManager {
  private windowManager: WindowManager;
  private systemService: SystemService;
  private dialogService: DialogService;
  private notificationService: NotificationService;
  private fileSystemService: FileSystemService;

  constructor() {
    this.windowManager = new WindowManager();
    this.systemService = new SystemService();
    this.dialogService = new DialogService();
    this.notificationService = new NotificationService();
    this.fileSystemService = new FileSystemService();
  }

  public initialize(): void {
    this.setupAppEventHandlers();
    this.setupIpcHandlers();
  }

  private setupAppEventHandlers(): void {
    // Создаем окно когда приложение готово
    app.whenReady().then(() => {
      this.windowManager.createMainWindow();
    });

    // Закрываем приложение когда все окна закрыты (кроме macOS)
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Создаем новое окно при активации приложения (macOS)
    app.on('activate', () => {
      if (!this.windowManager.hasWindows()) {
        this.windowManager.createMainWindow();
      }
    });
  }

  private setupIpcHandlers(): void {
    this.systemService.setupHandlers();
    this.dialogService.setupHandlers();
    this.notificationService.setupHandlers();
    this.fileSystemService.setupHandlers();
  }

  // Геттеры для доступа к сервисам
  public getWindowManager(): WindowManager {
    return this.windowManager;
  }

  public getSystemService(): SystemService {
    return this.systemService;
  }

  public getDialogService(): DialogService {
    return this.dialogService;
  }

  public getNotificationService(): NotificationService {
    return this.notificationService;
  }

  public getFileSystemService(): FileSystemService {
    return this.fileSystemService;
  }
}
