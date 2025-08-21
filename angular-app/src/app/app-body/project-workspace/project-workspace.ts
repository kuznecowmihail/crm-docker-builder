import { Component, Input } from '@angular/core';
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
import { CrmSettings } from './crm-settings/crm-settings';

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
    CrmSettings,
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
   * Конструктор
   */
  constructor() {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('ProjectWorkspace: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || '';
      this.projectPath = this.projectConfig.projectPath || '';
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
    console.log('Сохранение изменений:', {
      projectName: this.projectName,
      projectPath: this.projectPath
    });
    // Здесь будет логика сохранения
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
   * Генерирует уникальный идентификатор
   * @returns уникальный идентификатор
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
