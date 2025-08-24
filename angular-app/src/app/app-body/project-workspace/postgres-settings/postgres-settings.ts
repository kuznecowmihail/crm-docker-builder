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
  selector: 'app-postgres-settings',
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
  templateUrl: './postgres-settings.html',
  styleUrl: './postgres-settings.css'
})
export class PostgresSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования PostgreSQL
   */
  containerName: string = '';
  port: number = 5432;
  volumePath: string = '';
  user: string = '';
  password: string = '';
  isEnabled: boolean = true;
  
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
    console.log('PostgresSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.postgresConfig) {
      const config = this.projectConfig.postgresConfig;
      this.containerName = config.containerName || this.constants?.DEFAULT_POSTGRES_CONFIG.containerName || '';
      this.port = config.port || this.constants?.DEFAULT_POSTGRES_CONFIG.port || 0;
      this.volumePath = config.volumePath || '';
      this.user = config.user || this.constants?.DEFAULT_POSTGRES_CONFIG.user || '';
      this.password = config.password || this.constants?.DEFAULT_POSTGRES_CONFIG.password || '';
    }

    this.electronService.getConstants().then((constants) => {
      this.constants = constants;

      if (!this.projectConfig?.postgresConfig) {
        const config = this.constants?.DEFAULT_POSTGRES_CONFIG;
        this.containerName = config.containerName;
        this.port = config.port;
        this.user = config.user;
        this.password = config.password;
      }
    });
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('PostgresSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('PostgresSettings: Изменение порта:', this.port);
  }

  /**
   * Обработчик изменения пользователя
   */
  onUserChange() {
    console.log('PostgresSettings: Изменение пользователя:', this.user);
  }

  /**
   * Обработчик изменения пароля
   */
  onPasswordChange() {
    console.log('PostgresSettings: Изменение пароля:', this.password);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('PostgresSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      user: this.user,
      password: this.password
    });

    if (this.projectConfig?.postgresConfig) {
      this.projectConfig.postgresConfig.containerName = this.containerName;
      this.projectConfig.postgresConfig.port = this.port;
      this.projectConfig.postgresConfig.user = this.user;
      this.projectConfig.postgresConfig.password = this.password;

      const result = await this.electronService.savePostgresSettings(this.projectConfig, this.projectConfig.postgresConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('PostgresSettings: Отмена изменений');

    if (this.projectConfig?.postgresConfig) {
      const config = this.projectConfig.postgresConfig;
      this.containerName = config.containerName || this.constants?.DEFAULT_POSTGRES_CONFIG.containerName || '';
      this.port = config.port || this.constants?.DEFAULT_POSTGRES_CONFIG.port || 0;
      this.user = config.user || this.constants?.DEFAULT_POSTGRES_CONFIG.user || '';
      this.password = config.password || this.constants?.DEFAULT_POSTGRES_CONFIG.password || '';
    }
  }

  /**
   * Обработчик тестирования соединения
   */
  onTestConnection() {
    console.log('PostgresSettings: Тестирование соединения...');
    // Здесь будет логика тестирования соединения
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
}
