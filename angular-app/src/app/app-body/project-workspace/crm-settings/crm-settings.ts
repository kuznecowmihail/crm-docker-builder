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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectConfig, CrmConfig, Constants } from '@shared/api';
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
    MatCheckboxModule,
    MatTooltipModule
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
  
  /**
   * Флаг проекта в режиме редактирования
   */
  isEditing: boolean = false;

  /**
   * Константы
   */
  constants: Constants | null = null;

  /**
   * Состояние ошибки для поля резервной копии
   */
  backupPathError: boolean = false;

  /**
   * Состояние ошибки для поля пути к приложению
   */
  appPathError: boolean = false;
  
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
      this.backupPathError = false;
      this.appPathError = false;
    }

    this.isEditing = !Boolean(this.crmConfig?.runOn);

    this.electronService.getConstants().then((constants) => {
      this.constants = constants;

      if (!this.crmConfig) {
        const config = this.constants?.DEFAULT_CRM_CONFIG;
        this.containerName = config.containerName;
        this.port = config.port;
        this.redisDb = config.redisDb;
        this.dbType = config.dbType;
        this.netVersion = config.netVersion;
        this.crmType = config.crmType;
      }
    });
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('CrmSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('CrmSettings: Изменение порта:', this.port);
  }

  /**
   * Извлекает название папки из пути
   * @param path - путь к папке
   * @returns название папки
   */
  private getFolderNameFromPath(path: string): string {
    const pathParts = path.split(/[/\\]/);
    return pathParts[pathParts.length - 1];
  }

  /**
   * Обработчик изменения пути к приложению
   */
  async onAppPathChange() {
    console.log('CrmSettings: Изменение пути к приложению:', this.appPath);
    if (this.crmConfig && this.projectConfig) {
      const appPathResult = await this.electronService.validateAppPath(this.projectConfig.projectPath, this.appPath);
      if (!appPathResult.success) {
        this.appPathError = true;
        await this.electronService.showNotification('Выберите папку приложения CRM', appPathResult.message);
      } else {
        this.appPathError = false;
      }
    }
    // Устанавливаем название контейнера как название папки из appPath
    if (this.crmConfig && this.appPath) {
      const folderName = this.getFolderNameFromPath(this.appPath);
      this.crmConfig.containerName = folderName;
      this.containerName = folderName;
    }
  }

  /**
   * Обработчик изменения пути к резервной копии
   */
  async onBackupPathChange() {
    console.log('CrmSettings: Изменение пути к резервной копии:', this.backupPath);

    if (this.crmConfig) {
      const backupPathResult = await this.electronService.validateBackupPath(this.backupPath);
      if (!backupPathResult.success) {
        this.backupPathError = true;
        await this.electronService.showNotification('Выберите файл для резервных копий', backupPathResult.message);
      } else {
        this.backupPathError = false;
      }
    }
  }

  /**
   * Обработчик изменения типа CRM
   */
  onCrmTypeChange() {
    console.log('CrmSettings: Изменение типа CRM:', this.crmType);
  }

  /**
   * Обработчик изменения типа базы данных
   */
  onDbTypeChange() {
    console.log('CrmSettings: Изменение типа базы данных:', this.dbType);
  }

  /**
   * Обработчик изменения версии .NET
   */
  onNetVersionChange() {
    console.log('CrmSettings: Изменение версии .NET:', this.netVersion);
  }

  /**
   * Обработчик изменения номера базы данных Redis
   */
  onRedisDbChange() {
    console.log('CrmSettings: Изменение номера базы данных Redis:', this.redisDb);
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
      crmType: this.crmType
    });
    
    if (this.crmConfig && this.projectConfig) {
      this.crmConfig.containerName = this.containerName;
      this.crmConfig.port = this.port;
      this.crmConfig.appPath = this.appPath;
      this.crmConfig.volumePath = this.appPath;
      this.crmConfig.backupPath = this.backupPath;
      this.crmConfig.redisDb = this.redisDb;

      const result = await this.electronService.saveCrmSetting(this.projectConfig, this.crmConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('CrmSettings: Отмена изменений');
    this.updateFormValues();
  }

  /**
   * Обработчик выбора папки приложения
   */
  async onSelectAppPath() {
    console.log('CrmSettings: Выбор папки приложения...');
    
    try {
      const selectedPath = await this.electronService.openFolderDialog({
        title: 'Выберите папку приложения CRM',
        defaultPath: this.projectConfig?.projectPath || ''
      });
      
      if (selectedPath) {
        this.appPath = selectedPath;
      }
      this.onAppPathChange();
    } catch (error) {
      console.error('Ошибка при выборе папки приложения:', error);
      this.appPathError = true;
      this.appPath = '';
      await this.electronService.showNotification('Выберите папку приложения CRM', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Обработчик выбора папки для резервных копий
   */
  async onSelectBackupPath() {
    console.log('CrmSettings: Выбор папки для резервных копий...');
    
    try {
      const selectedPath = await this.electronService.openFileDialog({
        title: 'Выберите файл для резервных копий',
        defaultPath: this.projectConfig?.projectPath || ''
      });
      
      console.log('CrmSettings: Выбранный файл:', selectedPath);
      
      if (selectedPath && selectedPath.length > 0) {
        this.backupPath = selectedPath[0];
      }
      this.onBackupPathChange();
    } catch (error) {
      console.error('Ошибка при выборе папки для резервных копий:', error);
      this.backupPathError = true;
      this.backupPath = '';
      await this.electronService.showNotification('Выберите файл для резервных копий', error instanceof Error ? error.message : String(error));
    }
  }
}