import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-crm-settings',
  standalone: true,
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
export class CrmSettings implements OnChanges {
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
  appPath: string = '';
  backupPath: string = '';
  redisDb: number = 0;
  dbType: string = 'postgres';
  netVersion: string = '8.0';
  crmType: string = 'bpmsoft';
  isEnabled: boolean = true;
  
  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Обработчик изменений входных параметров
   */
  ngOnChanges(changes: SimpleChanges) {
    console.log('CrmSettings: Изменения входных параметров:', changes);
    
    if (changes['crmConfig'] && this.crmConfig) {
      this.updateFormValues();
    }
  }

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('CrmSettings: Инициализация с конфигурацией:', this.crmConfig);
    if (this.crmConfig) {
      this.updateFormValues();
    }
  }

  /**
   * Обновление значений формы из конфигурации
   */
  private updateFormValues() {
    if (this.crmConfig) {
      this.containerName = this.crmConfig.containerName || '';
      this.port = this.crmConfig.port || 80;
      this.appPath = this.crmConfig.appPath || '';
      this.backupPath = this.crmConfig.backupPath || '';
      this.redisDb = this.crmConfig.redisDb || 0;
      this.dbType = this.crmConfig.dbType || 'postgres';
      this.netVersion = this.crmConfig.netVersion || '8.0';
      this.crmType = this.crmConfig.crmType || 'bpmsoft';
    }
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('CrmSettings: Изменение названия контейнера:', this.containerName);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('CrmSettings: Изменение порта:', this.port);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения пути к приложению
   */
  onAppPathChange() {
    console.log('CrmSettings: Изменение пути к приложению:', this.appPath);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения пути к резервной копии
   */
  onBackupPathChange() {
    console.log('CrmSettings: Изменение пути к резервной копии:', this.backupPath);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения типа CRM
   */
  onCrmTypeChange() {
    console.log('CrmSettings: Изменение типа CRM:', this.crmType);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения типа базы данных
   */
  onDbTypeChange() {
    console.log('CrmSettings: Изменение типа базы данных:', this.dbType);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения версии .NET
   */
  onNetVersionChange() {
    console.log('CrmSettings: Изменение версии .NET:', this.netVersion);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик изменения номера базы данных Redis
   */
  onRedisDbChange() {
    console.log('CrmSettings: Изменение номера базы данных Redis:', this.redisDb);
    if (this.crmConfig) {
      this.crmConfig.isSave = false;
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('CrmSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      appPath: this.appPath,
      backupPath: this.backupPath,
      redisDb: this.redisDb,
      dbType: this.dbType,
      netVersion: this.netVersion,
      crmType: this.crmType,
      isEnabled: this.isEnabled
    });
    
    if (this.crmConfig && this.projectConfig) {
      this.crmConfig.containerName = this.containerName;
      this.crmConfig.port = this.port;
      this.crmConfig.appPath = this.appPath;
      this.crmConfig.backupPath = this.backupPath;
      this.crmConfig.redisDb = this.redisDb;

      const result = await this.electronService.saveCrmSetting(this.projectConfig, this.crmConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);

      this.crmConfig.isSave = result.success;
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('CrmSettings: Отмена изменений');

    if (this.crmConfig) {
      this.updateFormValues();
      this.crmConfig.isSave = true;
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
