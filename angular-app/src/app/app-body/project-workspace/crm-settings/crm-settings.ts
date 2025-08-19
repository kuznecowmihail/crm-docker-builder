import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProjectConfig, CrmConfig } from '@shared/api';

@Component({
  selector: 'app-crm-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './crm-settings.html',
  styleUrl: './crm-settings.css'
})
export class CrmSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Конфигурация CRM для редактирования
   */
  @Input() crmConfig: CrmConfig | null = null;

  /**
   * Поля для редактирования
   */
  containerName: string = '';
  port: number = 80;
  volumePath: string = '';
  appPath: string = '';
  backupPath: string = '';
  redisDb: number = 0;
  dbType: string = 'postgres';
  netVersion: string = '4.8';
  crmType: string = 'creatio';
  isEnabled: boolean = true;

  /**
   * Конструктор
   */
  constructor() {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('CrmSettings: Инициализация с конфигурацией:', this.crmConfig);
    if (this.crmConfig) {
      this.containerName = this.crmConfig.containerName || '';
      this.port = this.crmConfig.port || 80;
      this.volumePath = this.crmConfig.volumePath || '';
      this.appPath = this.crmConfig.appPath || '';
      this.backupPath = this.crmConfig.backupPath || '';
      this.redisDb = this.crmConfig.redisDb || 0;
      this.dbType = this.crmConfig.dbType || 'postgres';
      this.netVersion = this.crmConfig.netVersion || '4.8';
      this.crmType = this.crmConfig.crmType || 'creatio';
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
    console.log('CrmSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      volumePath: this.volumePath,
      appPath: this.appPath,
      backupPath: this.backupPath,
      redisDb: this.redisDb,
      dbType: this.dbType,
      netVersion: this.netVersion,
      crmType: this.crmType,
      isEnabled: this.isEnabled
    });
    // Здесь будет логика сохранения
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('CrmSettings: Отмена изменений');
    if (this.crmConfig) {
      this.containerName = this.crmConfig.containerName || '';
      this.port = this.crmConfig.port || 80;
      this.volumePath = this.crmConfig.volumePath || '';
      this.appPath = this.crmConfig.appPath || '';
      this.backupPath = this.crmConfig.backupPath || '';
      this.redisDb = this.crmConfig.redisDb || 0;
      this.dbType = this.crmConfig.dbType || 'postgres';
      this.netVersion = this.crmConfig.netVersion || '4.8';
      this.crmType = this.crmConfig.crmType || 'creatio';
    }
  }

  /**
   * Обработчик тестирования соединения
   */
  onTestConnection() {
    console.log('CrmSettings: Тестирование соединения...');
    // Здесь будет логика тестирования соединения
  }

  /**
   * Обработчик запуска CRM
   */
  onStartCrm() {
    console.log('CrmSettings: Запуск CRM...');
    // Здесь будет логика запуска CRM
  }

  /**
   * Обработчик остановки CRM
   */
  onStopCrm() {
    console.log('CrmSettings: Остановка CRM...');
    // Здесь будет логика остановки CRM
  }
}
