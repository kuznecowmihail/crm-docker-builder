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
import { ProjectConfig, PgAdminConfig } from '@shared/api';

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
  containerName: string = 'pgadmin';
  port: number = 5050;
  volumePath: string = 'pgadmin-volumes';
  email: string = 'admin@example.com';
  password: string = 'puser';
  isEnabled: boolean = true;

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('PgAdminSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig?.pgAdminConfig) {
      const config = this.projectConfig.pgAdminConfig;
      this.containerName = config.containerName || 'pgadmin';
      this.port = config.port || 5050;
      this.volumePath = config.volumePath || 'pgadmin-volumes';
      this.email = config.email || 'admin@example.com';
      this.password = config.password || 'puser';
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
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
    } 
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('PgAdminSettings: Отмена изменений');

    if (this.projectConfig?.pgAdminConfig) {
      const config = this.projectConfig.pgAdminConfig;
      this.containerName = config.containerName || 'pgadmin';
      this.port = config.port || 5050;
      this.volumePath = config.volumePath || 'pgadmin-volumes';
      this.email = config.email || 'admin@example.com';
      this.password = config.password || 'puser';
    }
  }

  /**
   * Обработчик открытия pgAdmin
   */
  onOpenPgAdmin() {
    console.log('PgAdminSettings: Открытие pgAdmin...');
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

  /**
   * Обработчик генерации email
   */
  onGenerateEmail() {
    this.email = `admin@${this.containerName || 'pgadmin'}.local`;
  }
}
