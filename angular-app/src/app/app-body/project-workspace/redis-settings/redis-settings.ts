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
import { ProjectConfig, RedisConfig } from '@shared/api';

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
  port: number = 6379;
  volumePath: string = '';
  password: string = '';
  dbCount: number = 16;
  isEnabled: boolean = true;
  persistenceEnabled: boolean = true;
  maxMemory: string = '256mb';
  maxMemoryValue: number = 256;

  /**
   * Конструктор
   */
  constructor() {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('RedisSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.redisConfig) {
      const config = this.projectConfig.redisConfig;
      this.containerName = config.containerName || '';
      this.port = config.port || 6379;
      this.volumePath = config.volumePath || '';
      this.password = config.password || '';
      this.dbCount = config.dbCount || 16;
    }
    
    // Инициализация значения слайдера
    this.maxMemoryValue = 256;
    this.maxMemory = '256mb';
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
    console.log('RedisSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      volumePath: this.volumePath,
      password: this.password,
      dbCount: this.dbCount,
      isEnabled: this.isEnabled,
      persistenceEnabled: this.persistenceEnabled,
      maxMemory: this.maxMemory
    });
    // Здесь будет логика сохранения
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('RedisSettings: Отмена изменений');
    if (this.projectConfig?.redisConfig) {
      const config = this.projectConfig.redisConfig;
      this.containerName = config.containerName || '';
      this.port = config.port || 6379;
      this.volumePath = config.volumePath || '';
      this.password = config.password || '';
      this.dbCount = config.dbCount || 16;
    }
    
    // Сброс значений памяти
    this.maxMemoryValue = 256;
    this.maxMemory = '256mb';
    this.persistenceEnabled = true;
  }

  /**
   * Обработчик тестирования соединения
   */
  onTestConnection() {
    console.log('RedisSettings: Тестирование соединения...');
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

  /**
   * Обработчик очистки кэша
   */
  onClearCache() {
    console.log('RedisSettings: Очистка кэша...');
    // Здесь будет логика очистки кэша
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
