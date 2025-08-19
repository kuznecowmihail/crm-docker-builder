import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ProjectConfig } from '@shared/api';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { GeneralProjectSettings } from './general-project-settings/general-project-settings';
import { PostgresSettings } from './postgres-settings/postgres-settings';
import { PgAdminSettings } from './pgadmin-settings/pgadmin-settings';
import { RedisSettings } from './redis-settings/redis-settings';

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
  onSectionSelect(section: string) {
    console.log('Выбрана секция:', section);
    this.activeSection = section;
  }

  /**
   * Обработчик добавления CRM
   */
  onCrmAdd() {
    console.log('Добавление CRM');

    this.projectConfig?.crmConfigs.push({
      containerName: 'crm-bpmsoft',
      port: 8080,
      volumePath: `${this.projectConfig?.projectName}/crm-bpmsoft`,
      appPath: `${this.projectConfig?.projectName}/crm-bpmsoft`,
      backupPath: `${this.projectConfig?.projectName}/crm-bpmsoft/db`,
      redisDb: 0,
      dbType: 'postgres',
      netVersion: '8',
      crmType: 'bpmsoft'
    });

    debugger
  }
}
