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
import { Constants, ProjectConfig } from '@shared/api';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-pgadmin-settings',
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
  templateUrl: './pgadmin-settings.html',
  styleUrl: './pgadmin-settings.css'
})
export class PgAdminSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования pgAdmin
   */
  containerName: string = '';
  port: number = 0;
  volumePath: string = '';
  email: string = '';
  password: string = '';

  /**
   * Флаг проекта в режиме редактирования
   */
  isEditing: boolean = false;

  /**
   * Константы
   */
  constants: Constants | null = null;
  
  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('PgAdminSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.pgAdminConfig) {
      const config = this.projectConfig.pgAdminConfig;
      this.containerName = config.containerName || this.constants?.DEFAULT_PGADMIN_CONFIG.containerName || '';
      this.port = config.port || this.constants?.DEFAULT_PGADMIN_CONFIG.port || 0;
      this.volumePath = config.volumePath || '';
      this.email = config.email || this.constants?.DEFAULT_PGADMIN_CONFIG.email || '';
      this.password = config.password || this.constants?.DEFAULT_PGADMIN_CONFIG.password || '';
      this.isEditing = !Boolean(this.projectConfig.runOn);
    }

    this.electronService.getConstants().then((constants) => {
      this.constants = constants;

      if (!this.projectConfig?.pgAdminConfig) {
        const config = this.constants?.DEFAULT_PGADMIN_CONFIG;
        this.containerName = config.containerName;
        this.port = config.port;
        this.email = config.email;
        this.password = config.password;
      }
    });
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('PgAdminSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('PgAdminSettings: Изменение порта:', this.port);
  }

  /**
   * Обработчик изменения email
   */
  onEmailChange() {
    console.log('PgAdminSettings: Изменение email:', this.email);
  }

  /**
   * Обработчик изменения пароля
   */
  onPasswordChange() {
    console.log('PgAdminSettings: Изменение пароля:', this.password);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('PgAdminSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      email: this.email,
      password: this.password
    });
    
    if (this.projectConfig?.pgAdminConfig) {
      this.projectConfig.pgAdminConfig.containerName = this.containerName;
      this.projectConfig.pgAdminConfig.port = this.port;
      this.projectConfig.pgAdminConfig.email = this.email;
      this.projectConfig.pgAdminConfig.password = this.password;

      const result = await this.electronService.savePgAdminSettings(this.projectConfig, this.projectConfig.pgAdminConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    } 
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('PgAdminSettings: Отмена изменений');

    if (this.projectConfig?.pgAdminConfig) {
      const config = this.projectConfig.pgAdminConfig;
      this.containerName = config.containerName || this.constants?.DEFAULT_PGADMIN_CONFIG.containerName || '';
      this.port = config.port || this.constants?.DEFAULT_PGADMIN_CONFIG.port || 0;
      this.volumePath = config.volumePath || '';
      this.email = config.email || this.constants?.DEFAULT_PGADMIN_CONFIG.email || '';
      this.password = config.password || this.constants?.DEFAULT_PGADMIN_CONFIG.password || '';
    }
  }

  /**
   * Обработчик генерации пароля
   */
  onGeneratePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.password = result;
  }

  /**
   * Обработчик генерации email
   */
  onGenerateEmail() {
    this.email = `admin@${this.containerName || 'pgadmin'}.local`;
  }
}
