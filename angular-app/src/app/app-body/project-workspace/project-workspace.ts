import { Component, Input, ChangeDetectorRef, NgZone, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Constants, CrmConfig, ProjectConfig } from '@shared/api';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { GeneralProjectSettings } from './general-project-settings/general-project-settings';
import { PostgresSettings } from './postgres-settings/postgres-settings';
import { PgAdminSettings } from './pgadmin-settings/pgadmin-settings';
import { RedisSettings } from './redis-settings/redis-settings';
import { RabbitMqSettings } from './rabbitmq-settings/rabbitmq-settings';
import { CrmSettings } from './crm-settings/crm-settings';
import { ProjectLogs } from './project-logs/project-logs';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-project-workspace',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatExpansionModule,
    GeneralProjectSettings,
    PostgresSettings,
    PgAdminSettings,
    RedisSettings,
    RabbitMqSettings,
    CrmSettings,
    ProjectLogs,
  ],
  templateUrl: './project-workspace.html',
  styleUrl: './project-workspace.css'
})
export class ProjectWorkspace implements OnDestroy {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Событие выхода из проекта
   */
  @Output() exitProject: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Поля для редактирования
   */
  projectName: string = '';

  /**
   * Путь к проекту
   */
  projectPath: string = '';

  /**
   * Активная секция
   */
  activeSection: string = '';

  /**
   * Выбранная конфигурация CRM
   */
  selectedCrmConfig: CrmConfig | null = null;

  /**
   * Логи проекта
   */
  projectLogs: string[] = [];

  /**
   * Константы
   */
  constants: Constants | null = null;
  
  /**
   * Буфер для логов
   */
  private logBuffer: string[] = [];
  
  /**
   * Таймер для обработки буфера логов
   */
  private logBufferTimer: any = null;
  
  /**
   * Флаг активности обработки логов
   */
  private isProcessingLogs = false;
  
  /**
   * Максимальный размер буфера логов
   */
  private readonly MAX_BUFFER_SIZE = 1000;

  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   * @param cdr - сервис для принудительной детекции изменений
   * @param ngZone - сервис для работы с зоной Angular
   */
  constructor(
    private electronService: ElectronService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.electronService.getConstants().then((constants) => {
      this.constants = constants;
    });
  }

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('ProjectWorkspace: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || '';
      this.projectPath = this.projectConfig.projectPath || '';
    }
    // Инициализируем массив логов
    this.projectLogs = [];
  }

  /**
   * Обрабатывает буфер логов
   */
  private processLogBuffer(): void {
    if (this.logBuffer.length === 0 || this.isProcessingLogs) {
      return;
    }

    this.isProcessingLogs = true;
    
    // Используем requestAnimationFrame для более плавного обновления UI
    requestAnimationFrame(() => {
      // Используем NgZone для корректной обработки изменений
      this.ngZone.run(() => {
        // Добавляем все логи из буфера разом
        this.projectLogs = [...this.projectLogs, ...this.logBuffer];
        
        // Очищаем буфер
        this.logBuffer = [];
        
        // Принудительно запускаем детекцию изменений
        this.cdr.detectChanges();
        
        this.isProcessingLogs = false;
      });
    });
  }

  /**
   * Добавляет лог в буфер
   */
  private addLogToBuffer(log: string): void {
    this.logBuffer.push(log);
    
    // Если буфер превышает максимальный размер, обрабатываем его немедленно
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.processLogBuffer();
      return;
    }
    
    // Если буфер пустой, запускаем таймер
    if (this.logBuffer.length === 1) {
      this.scheduleLogProcessing();
    }
  }

  /**
   * Планирует обработку логов
   */
  private scheduleLogProcessing(): void {
    // Очищаем предыдущий таймер
    if (this.logBufferTimer) {
      clearTimeout(this.logBufferTimer);
    }
    
    // Устанавливаем новый таймер (обрабатываем каждые 50ms)
    this.logBufferTimer = setTimeout(() => {
      this.processLogBuffer();
    }, 50);
  }

  /**
   * Обработчик сборки проекта
   */
  async onBuildProject() {
    console.log('Сборка проекта');
    
    if (!this.projectConfig) {
      return;
    }
    const generalProjectSettingsResult = await this.electronService.validateGeneralProjectSettings(this.projectConfig);

    if (!generalProjectSettingsResult.success) {
      this.onSectionSelect('general');
      this.electronService.showNotification('Сборка проекта', generalProjectSettingsResult.message);
      return;
    }

    const postgresSettingsResult = await this.electronService.validatePostgresSettings(this.projectConfig, this.projectConfig.postgresConfig);
    if (!postgresSettingsResult.success) {
      this.onSectionSelect('postgres');
      this.electronService.showNotification('Сборка проекта', postgresSettingsResult.message);
      return;
    }

    const pgAdminSettingsResult = await this.electronService.validatePgAdminSettings(this.projectConfig, this.projectConfig.pgAdminConfig);
    if (!pgAdminSettingsResult.success) {
      this.onSectionSelect('pgadmin');
      this.electronService.showNotification('Сборка проекта', pgAdminSettingsResult.message);
      return;
    }

    const redisSettingsResult = await this.electronService.validateRedisSettings(this.projectConfig, this.projectConfig.redisConfig);
    if (!redisSettingsResult.success) {
      this.onSectionSelect('redis');
      this.electronService.showNotification('Сборка проекта', redisSettingsResult.message);
      return;
    }

    const crmSettingsResult = await this.electronService.validateCrmSettings(this.projectConfig);
    if (!crmSettingsResult.success) {
      this.onSectionSelect('crm', crmSettingsResult.crmConfig || undefined);
      this.electronService.showNotification('Сборка проекта', crmSettingsResult.message);
      return;
    }
    
    this.onClearLogs();
    this.onSectionSelect('logs');

    setTimeout(async () => {
      if (!this.projectConfig) {
        return;
      }

      // Подписываемся на логи проекта
      this.electronService.subscribeToProjectLogs((log: string) => {
        console.log('[PROJECT LOG]', log);
        // Добавляем лог в буфер вместо прямого обновления
        this.addLogToBuffer(log);
      });
      const result = await this.electronService.buildProject(this.projectConfig);
      // Отписываемся от логов проекта
      this.electronService.unsubscribeFromProjectLogs();
      
      // Обрабатываем оставшиеся логи в буфере
      this.processLogBuffer();
  
      this.electronService.showNotification('Сборка проекта', result.message);
  
      this.projectConfig.buildOn = new Date();
      this.projectConfig.modifiedOn = new Date();
      this.electronService.saveGeneralProjectSettings(this.projectConfig);
    });
  }

  /**
   * Обработчик запуска проекта
   */
  async onRunProject() {
    if (!this.projectConfig?.buildOn) {
      this.electronService.showNotification('Запуск проекта', 'Проект не был собран');
      return;
    }
    if (this.projectConfig.buildOn && this.projectConfig.runOn && new Date(this.projectConfig.buildOn) < new Date(this.projectConfig.runOn)) {
      this.electronService.showNotification('Запуск проекта', 'Проект был запущен позже, чем собран');
      return;
    }
    console.log('Запуск проекта');
    if (!this.projectConfig) {
      return;
    }
    
    this.onClearLogs();
    this.onSectionSelect('logs');

    setTimeout(async () => {
      if (!this.projectConfig) {
        return;
      }

      // Подписываемся на логи проекта
      this.electronService.subscribeToProjectLogs((log: string) => {
        console.log('[PROJECT LOG]', log);
        // Добавляем лог в буфер вместо прямого обновления
        this.addLogToBuffer(log);
      });
      const result = await this.electronService.runProject(this.projectConfig);
      // Отписываемся от логов проекта
      this.electronService.unsubscribeFromProjectLogs();
      
      // Обрабатываем оставшиеся логи в буфере
      this.processLogBuffer();
  
      this.electronService.showNotification('Запуск проекта', result.message);
  
      this.projectConfig.runOn = new Date();
      this.projectConfig.modifiedOn = new Date();
      this.electronService.saveGeneralProjectSettings(this.projectConfig);
    });
  }

  /**
   * Обработчик выбора секции
   */
  onSectionSelect(section: string, crmConfig?: CrmConfig) {
    console.log('Выбрана секция:', section, 'CRM конфигурация:', crmConfig);
    this.activeSection = '';
    this.selectedCrmConfig = null;
    this.activeSection = section;
    if (section === 'crm' && crmConfig) {
      this.selectedCrmConfig = crmConfig;
    } else {
      this.selectedCrmConfig = null;
    }
  }

  /**
   * Обработчик добавления CRM
   */
  onCrmAdd() {
    console.log('Добавление CRM');

    if (this.constants) { 
      let crmConfig: CrmConfig = {
        id: this.generateId(),
        containerName: this.constants?.DEFAULT_CRM_CONFIG.containerName || '',
        port: this.constants?.DEFAULT_CRM_CONFIG.port || 0,
        redisDb: this.constants?.DEFAULT_CRM_CONFIG.redisDb || 0,
        dbType: this.constants?.DEFAULT_CRM_CONFIG.dbType || '',
        netVersion: this.constants?.DEFAULT_CRM_CONFIG.netVersion || '',
        crmType: this.constants?.DEFAULT_CRM_CONFIG.crmType || '',
        volumePath: '',
        appPath: '',
        backupPath: ''
      };

      if (this.projectConfig) {
        this.projectConfig.crmConfigs.push(crmConfig);
      }
    }
  }

  /**
   * Обработчик очистки логов
   */
  onClearLogs() {
    this.projectLogs = [];
    // Очищаем буфер и таймер
    this.logBuffer = [];
    if (this.logBufferTimer) {
      clearTimeout(this.logBufferTimer);
      this.logBufferTimer = null;
    }
    this.isProcessingLogs = false;
  }

  /**
   * Обработчик уничтожения компонента
   */
  ngOnDestroy(): void {
    // Очищаем таймер при уничтожении компонента
    if (this.logBufferTimer) {
      clearTimeout(this.logBufferTimer);
    }
    // Отписываемся от логов проекта
    this.electronService.unsubscribeFromProjectLogs();
  }

  /**
   * Обработчик выхода из проекта
   */
  onExitProject() {
    this.projectConfig = null;
    this.exitProject.emit();
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
