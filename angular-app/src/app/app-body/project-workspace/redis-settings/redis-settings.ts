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
import { MatSliderModule } from '@angular/material/slider';
import { Constants, ProjectConfig } from '@shared/api';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-redis-settings',
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
    MatSliderModule
  ],
  templateUrl: './redis-settings.html',
  styleUrl: './redis-settings.css'
})
export class RedisSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования Redis
   */
  containerName: string = '';
  port: number = 0;
  volumePath: string = '';
  password: string = '';
  dbCount: number = 0;
  
  /**
   * Флаг проекта в режиме редактирования
   */
  isEditing: boolean = false;

  /**
   * Максимальная память
   */
  maxMemory: string = '256mb';

  /**
   * Значение максимальной памяти
   */
  maxMemoryValue: number = 256;

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
    console.log('RedisSettings: Инициализация с конфигурацией:', this.projectConfig);
    
    if (this.projectConfig?.redisConfig) {
      const config = this.projectConfig.redisConfig;
      this.containerName = config.containerName || '';
      this.port = config.port || 6380;
      this.volumePath = config.volumePath || '';
      this.password = config.password || '';
      this.dbCount = config.dbCount || 16;
      this.isEditing = !Boolean(this.projectConfig.runOn);
    }

    this.electronService.getConstants().then((constants) => {
      this.constants = constants;

      if (!this.projectConfig?.redisConfig) {
        const config = this.constants?.DEFAULT_REDIS_CONFIG;
        this.containerName = config.containerName;
        this.port = config.port;
        this.password = config.password;
        this.dbCount = config.dbCount;
      }
    });
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('RedisSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта
   */
  onPortChange() {
    console.log('RedisSettings: Изменение порта:', this.port);
  }

  /**
   * Обработчик изменения пароля
   */
  onPasswordChange() {
    console.log('RedisSettings: Изменение пароля:', this.password);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('RedisSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      password: this.password,
      dbCount: this.dbCount,
      maxMemory: this.maxMemory
    });

    if (this.projectConfig?.redisConfig) {
      this.projectConfig.redisConfig.containerName = this.containerName;
      this.projectConfig.redisConfig.port = this.port;
      this.projectConfig.redisConfig.password = this.password;
      this.projectConfig.redisConfig.dbCount = this.dbCount;

      const result = await this.electronService.saveRedisSettings(this.projectConfig, this.projectConfig.redisConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('RedisSettings: Отмена изменений');
    if (this.projectConfig?.redisConfig) {
      const config = this.projectConfig.redisConfig;
      this.containerName = config.containerName || this.constants?.DEFAULT_REDIS_CONFIG.containerName || '';
      this.port = config.port || this.constants?.DEFAULT_REDIS_CONFIG.port || 0;
      this.volumePath = config.volumePath || '';
      this.password = config.password || this.constants?.DEFAULT_REDIS_CONFIG.password || '';
      this.dbCount = config.dbCount || this.constants?.DEFAULT_REDIS_CONFIG.dbCount || 0;
    }
    
    // Сброс значений памяти
    this.maxMemoryValue = 256;
    this.maxMemory = '256mb';
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
   * Обработчик изменения максимальной памяти
   */
  onMemoryChange(event: any) {
    const value = this.maxMemoryValue || 256;
    this.maxMemoryValue = value;
    if (value < 1024) {
      this.maxMemory = `${value}mb`;
    } else {
      this.maxMemory = `${(value / 1024).toFixed(1)}gb`;
    }
  }
}
