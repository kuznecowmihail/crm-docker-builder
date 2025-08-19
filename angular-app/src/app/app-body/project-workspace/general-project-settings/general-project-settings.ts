import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProjectConfig } from '@shared/api';

@Component({
  selector: 'app-general-project-settings',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './general-project-settings.html',
  styleUrl: './general-project-settings.css'
})
export class GeneralProjectSettings {
  /**
   * Конфигурация проекта
   */
  @Input() projectConfig: ProjectConfig | null = null;

  /**
   * Поля для редактирования
   */
  projectName: string = '';

  /**
   * Обработчик инициализации компоненты
   */
  ngOnInit() {
    console.log('GeneralProjectSettings: Инициализация с конфигурацией:', this.projectConfig);
    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || '';
    }
  }

  /**
   * Обработчик сохранения изменений
   */
  onSaveChanges() {
    console.log('GeneralProjectSettings: Сохранение изменений:', {
      projectName: this.projectName,
    });

    if (this.projectConfig) {
      this.projectConfig.projectName = this.projectName;
    }
  }

  /**
   * Обработчик отмены изменений
   */
  onCancelChanges() {
    console.log('GeneralProjectSettings: Отмена изменений');

    if (this.projectConfig) {
      this.projectName = this.projectConfig.projectName || '';
    }
  }
}
