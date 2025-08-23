import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CrmConfig, ProjectConfig } from '@shared/api';
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
export class ProjectWorkspace {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;
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
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

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

    // Подписываемся на логи проекта
    this.electronService.subscribeToProjectLogs((log: string) => {
      console.log('[PROJECT LOG]', log);
      this.projectLogs = [...this.projectLogs, log];
    });
    const result = await this.electronService.buildProject(this.projectConfig);
    // Отписываемся от логов проекта
    this.electronService.unsubscribeFromProjectLogs();

    this.electronService.showNotification('Сборка проекта', result.message);
  }

  /**
   * Обработчик запуска проекта
   */
  async onRunProject() {
    console.log('Запуск проекта');
    if (!this.projectConfig) {
      return;
    }
    this.onClearLogs();
    this.onSectionSelect('logs');

    // Подписываемся на логи проекта
    this.electronService.subscribeToProjectLogs((log: string) => {
      console.log('[PROJECT LOG]', log);
      this.projectLogs = [...this.projectLogs, log];
    });
    const result = await this.electronService.runProject(this.projectConfig);
    // Отписываемся от логов проекта
    this.electronService.unsubscribeFromProjectLogs();

    this.electronService.showNotification('Запуск проекта', result.message);
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

    this.projectConfig?.crmConfigs.push({
      id: this.generateId(),
      containerName: 'crm-bpmsoft',
      port: 80,
      volumePath: `${this.projectConfig?.projectPath}/crm-bpmsoft`,
      appPath: `${this.projectConfig?.projectPath}/crm-bpmsoft`,
      backupPath: `${this.projectConfig?.projectPath}/crm-bpmsoft/db`,
      redisDb: 0,
      dbType: 'postgres',
      netVersion: '8.0',
      crmType: 'bpmsoft'
    });
  }

  /**
   * Обработчик очистки логов
   */
  onClearLogs() {
    this.projectLogs = [];
  }

  /**
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
