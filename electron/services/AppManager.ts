import { app } from 'electron';
import { WindowManager } from './WindowManager';
import { SystemService } from './SystemService';
import { DialogService } from './DialogService';
import { NotificationService } from './NotificationService';
import { FileSystemService } from './FileSystemService';
import { CrmDockerBuilderService } from './CrmDockerBuilderService';
import { CrmDockerBuilderValidatorService } from './CrmDockerBuilderValidatorService';
import { ConstService } from './ConstService';

export class AppManager {
  /**
   * Окно
   */
  private windowManager: WindowManager;
  /**
   * Система
   */
  private systemService: SystemService;
  /**
   * Диалог
   */
  private dialogService: DialogService;
  /**
   * Уведомление
   */
  private notificationService: NotificationService;
  /**
   * Файловая система
   */
  private fileSystemService: FileSystemService;
  /**
   * CRM Docker Builder
   */
  private crmDockerBuilderService: CrmDockerBuilderService;
  /**
   * CRM Docker Builder Validator
   */
  private crmDockerBuilderValidatorService: CrmDockerBuilderValidatorService;
  /**
   * Константы
   */
  private constService: ConstService;

  /**
   * Конструктор
   */
  constructor() {
    this.windowManager = new WindowManager();
    this.systemService = new SystemService();
    this.dialogService = new DialogService();
    this.notificationService = new NotificationService();
    this.fileSystemService = new FileSystemService();
    this.crmDockerBuilderService = new CrmDockerBuilderService();
    this.crmDockerBuilderValidatorService = new CrmDockerBuilderValidatorService();
    this.constService = new ConstService();
  }

  /**
   * Инициализация приложения
   */
  public initialize(): void {
    this.setupAppEventHandlers();
    this.setupIpcHandlers();
  }

  /**
   * Настройка обработчиков событий приложения
   */
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

  /**
   * Настройка IPC обработчиков
   */
  private setupIpcHandlers(): void {
    this.systemService.setupHandlers();
    this.dialogService.setupHandlers();
    this.notificationService.setupHandlers();
    this.fileSystemService.setupHandlers();
    this.crmDockerBuilderService.setupHandlers();
    this.crmDockerBuilderValidatorService.setupHandlers();
    this.constService.setupHandlers();
  }
}
