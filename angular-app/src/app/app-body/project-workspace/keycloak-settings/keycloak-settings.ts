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
  selector: 'app-keycloak-settings',
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
  templateUrl: './keycloak-settings.html',
  styleUrl: './keycloak-settings.css'
})
export class KeycloakSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования Keycloak
   */
  containerName: string = '';
  port: number = 0;
  volumePath: string = '';
  username: string = '';
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
    console.log('KeycloakSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.keycloakConfig) { 
      const config = this.projectConfig.keycloakConfig;
      this.containerName = config.containerName || '';
      this.port = config.port || 0;
      this.volumePath = config.volumePath || '';
      this.username = config.user || '';
      this.password = config.password || '';
      this.isEditing = !Boolean(this.projectConfig.runOn);
    }

    this.electronService.getConstants().then((constants) => {
      this.constants = constants;

      if (!this.projectConfig?.keycloakConfig) {
        const config = this.constants?.DEFAULT_KEYCLOAK_CONFIG;
        this.containerName = config.containerName;
        this.port = config.port;
        this.username = config.user;
        this.password = config.password;
      }
    });
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('KeycloakSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('KeycloakSettings: Изменение порта:', this.port);
  }

  /**
   * Обработчик изменения имени пользователя
   */
  onUsernameChange() {
    console.log('KeycloakSettings: Изменение имени пользователя:', this.username);
  }

  /**
   * Обработчик изменения пароля
   */
  onPasswordChange() {
    console.log('KeycloakSettings: Изменение пароля:', this.password);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('KeycloakSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      username: this.username,
      password: this.password
    });
    
    if (this.projectConfig) {
      this.projectConfig.keycloakConfig.containerName = this.containerName || 'keycloak';
      this.projectConfig.keycloakConfig.port = this.port;
      this.projectConfig.keycloakConfig.user = this.username;
      this.projectConfig.keycloakConfig.password = this.password;

      const result = await this.electronService.saveKeycloakSettings(this.projectConfig, this.projectConfig.keycloakConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    } 
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('KeycloakSettings: Отмена изменений');
    
    this.containerName = this.projectConfig?.keycloakConfig?.containerName || this.constants?.DEFAULT_KEYCLOAK_CONFIG.containerName || '';
    this.port = this.projectConfig?.keycloakConfig?.port || this.constants?.DEFAULT_KEYCLOAK_CONFIG.port || 0;
    this.volumePath = this.projectConfig?.keycloakConfig?.volumePath || '';
    this.username = this.projectConfig?.keycloakConfig?.user || this.constants?.DEFAULT_KEYCLOAK_CONFIG.user || '';
    this.password = this.projectConfig?.keycloakConfig?.password || this.constants?.DEFAULT_KEYCLOAK_CONFIG.password || '';
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
