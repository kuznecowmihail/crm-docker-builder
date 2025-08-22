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
import { ProjectConfig } from '@shared/api';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-rabbitmq-settings',
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
  templateUrl: './rabbitmq-settings.html',
  styleUrl: './rabbitmq-settings.css'
})
export class RabbitMqSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования RabbitMQ
   */
  containerName: string = 'rabbitmq';
  port: number = 15673;
  amqpPort: number = 5673;
  volumePath: string = 'rabbitmq-volumes';
  username: string = 'rmuser';
  password: string = 'rmpassword';
  isEnabled: boolean = true;
  
  /**
   * Конструктор
   * @param electronService - сервис для работы с Electron
   */
  constructor(private electronService: ElectronService) {}

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('RabbitMqSettings: Инициализация с конфигурацией:', this.projectConfig);
    // Инициализация с дефолтными значениями, так как RabbitMQ конфигурация может отсутствовать
    this.containerName = this.projectConfig?.rabbitmqConfig?.containerName || 'rabbitmq';
    this.port = this.projectConfig?.rabbitmqConfig?.port || 15673;
    this.amqpPort = this.projectConfig?.rabbitmqConfig?.amqpPort || 5673;
    this.volumePath = this.projectConfig?.rabbitmqConfig?.volumePath || 'rabbitmq-volumes';
    this.username = this.projectConfig?.rabbitmqConfig?.user || 'rmuser';
    this.password = this.projectConfig?.rabbitmqConfig?.password || 'rmpassword';
  }

  /**
   * Обработчик изменения названия контейнера
   */
  onContainerNameChange() {
    console.log('RabbitMqSettings: Изменение названия контейнера:', this.containerName);
  }

  /**
   * Обработчик изменения порта управления
   */
  onManagementPortChange() {
    console.log('RabbitMqSettings: Изменение порта управления:', this.port);
  }

  /**
   * Обработчик изменения AMQP порта
   */
  onAmqpPortChange() {
    console.log('RabbitMqSettings: Изменение AMQP порта:', this.amqpPort);
  }

  /**
   * Обработчик изменения имени пользователя
   */
  onUsernameChange() {
    console.log('RabbitMqSettings: Изменение имени пользователя:', this.username);
  }

  /**
   * Обработчик изменения пароля
   */
  onPasswordChange() {
    console.log('RabbitMqSettings: Изменение пароля:', this.password);
  }

  /**
   * Обработчик сохранения изменений
   */
  async onSaveChanges() {
    console.log('RabbitMqSettings: Сохранение изменений:', {
      containerName: this.containerName,
      port: this.port,
      amqpPort: this.amqpPort,
      username: this.username,
      password: this.password
    });
    
    if (this.projectConfig) {
      // Здесь нужно будет добавить RabbitMQ конфигурацию в ProjectConfig
      // Пока просто показываем уведомление
      this.projectConfig.rabbitmqConfig.containerName = this.containerName || 'rabbitmq';
      this.projectConfig.rabbitmqConfig.port = this.port;
      this.projectConfig.rabbitmqConfig.amqpPort = this.amqpPort;
      this.projectConfig.rabbitmqConfig.user = this.username;
      this.projectConfig.rabbitmqConfig.password = this.password;

      const result = await this.electronService.saveRabbitmqSettings(this.projectConfig, this.projectConfig.rabbitmqConfig);
      console.log('result', result);

      await this.electronService.showNotification('Сохранить проект', result.message);
    } 
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('RabbitMqSettings: Отмена изменений');
    
    // Возвращаем дефолтные значения
    this.containerName = this.projectConfig?.rabbitmqConfig?.containerName || 'rabbitmq';
    this.port = this.projectConfig?.rabbitmqConfig?.port || 15673;
    this.amqpPort = this.projectConfig?.rabbitmqConfig?.amqpPort || 5673;
    this.volumePath = this.projectConfig?.rabbitmqConfig?.volumePath || 'rabbitmq-volumes';
    this.username = this.projectConfig?.rabbitmqConfig?.user || 'rmuser';
    this.password = this.projectConfig?.rabbitmqConfig?.password || 'rmpassword';
  }

  /**
   * Обработчик открытия RabbitMQ Management
   */
  onOpenRabbitMqManagement() {
    console.log('RabbitMqSettings: Открытие RabbitMQ Management...');
    const url = `http://localhost:${this.port}`;
    window.open(url, '_blank');
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
