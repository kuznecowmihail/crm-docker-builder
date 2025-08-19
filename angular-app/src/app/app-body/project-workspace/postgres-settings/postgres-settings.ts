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
import { ProjectConfig, PostgresConfig } from '@shared/api';

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
  containerName: string = 'postgres';
  port: number = 5432;
  volumePath: string = 'postgres-volumes';
  user: string = 'puser';
  password: string = 'puser';
  isEnabled: boolean = true;

  /**
   * Конструктор
   */
  constructor() {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('PostgresSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.postgresConfig) {
      const config = this.projectConfig.postgresConfig;
      this.containerName = config.containerName || 'postgres';
      this.port = config.port || 5432;
      this.volumePath = config.volumePath || 'postgres-volumes';
      this.user = config.user || 'puser';
      this.password = config.password || 'puser';
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
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
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('PostgresSettings: Отмена изменений');

    if (this.projectConfig?.postgresConfig) {
      const config = this.projectConfig.postgresConfig;
      this.containerName = config.containerName || 'postgres';
      this.port = config.port || 5432;
      this.user = config.user || 'puser';
      this.password = config.password || 'puser';
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
