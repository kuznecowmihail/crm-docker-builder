import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-logs.html',
  styleUrls: ['./project-logs.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLogs implements OnChanges, AfterViewChecked, OnDestroy {
  /**
   * Массив логов проекта
   */
  @Input() logs: string[] = [];

  /**
   * Ссылка на элемент с логами
   */
  @ViewChild('logsContainer', { static: false }) logsContainer!: ElementRef;

  /**
   * Флаг для отслеживания новых логов
   */
  private shouldScrollToBottom = false;

  /**
   * Предыдущее количество логов
   */
  private previousLogsCount = 0;

  /**
   * Таймер для debouncing обновлений логов
   */
  private logUpdateTimer: any = null;

  /**
   * Флаг для отслеживания изменений
   */
  private hasChanges = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  /**
   * Максимальное количество отображаемых логов
   */
  @Input() maxLogs: number = 100;

  /**
   * Событие для очистки логов
   */
  @Output() clearLogsEvent = new EventEmitter<void>();

  /**
   * Отфильтрованные логи для отображения
   */
  displayLogs: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['logs']) {
      // Используем NgZone для корректной обработки изменений
      this.ngZone.run(() => {
        this.updateDisplayLogs();
        // Проверяем, появились ли новые логи
        if (this.logs.length > this.previousLogsCount) {
          this.shouldScrollToBottom = true;
          this.previousLogsCount = this.logs.length;
          this.hasChanges = true;

          // Очищаем предыдущий таймер
          if (this.logUpdateTimer) {
            clearTimeout(this.logUpdateTimer);
          }

          // Устанавливаем новый таймер для debouncing (50ms)
          this.logUpdateTimer = setTimeout(() => {
            if (this.hasChanges) {
              this.cdr.detectChanges();
              this.hasChanges = false;
            }
          }, 50);
        }
      });
    }
  }

  ngAfterViewChecked(): void {
    // Скроллим вниз, если появились новые логи
    if (this.shouldScrollToBottom && this.logsContainer) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Обновляет отображаемые логи
   */
  private updateDisplayLogs(): void {
    if (this.logs.length <= this.maxLogs) {
      this.displayLogs = [...this.logs];
    } else {
      // Показываем последние maxLogs логов
      this.displayLogs = this.logs.slice(-this.maxLogs);
    }

    // Очищаем предыдущий таймер
    if (this.logUpdateTimer) {
      clearTimeout(this.logUpdateTimer);
    }

    // Устанавливаем новый таймер для debouncing
    this.logUpdateTimer = setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

  /**
   * Обработчик уничтожения компонента
   */
  ngOnDestroy(): void {
    // Очищаем таймер при уничтожении компонента
    if (this.logUpdateTimer) {
      clearTimeout(this.logUpdateTimer);
    }
  }

  /**
   * Очищает все логи
   */
  clearLogs(): void {
    // Эмитим событие для родительского компонента
    this.clearLogsEvent.emit();
    this.displayLogs = [];
  }

  /**
   * Определяет тип лога для стилизации
   */
  getLogType(log: string): 'info' | 'success' | 'warning' | 'error' {
    const logLower = log.toLowerCase();
    if (logLower.includes('✅') || logLower.includes('успешно')) {
      return 'success';
    } else if (logLower.includes('❌') || logLower.includes('ошибка') || logLower.includes('error')) {
      return 'error';
    } else if (logLower.includes('⚠️') || logLower.includes('warning')) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  /**
   * Форматирует время для лога
   */
  getLogTime(): string {
    return new Date().toLocaleTimeString('ru-RU');
  }

  /**
   * TrackBy функция для оптимизации ngFor
   */
  trackByLog(index: number, log: string): string {
    return `${index}-${log}`;
  }

  /**
   * Скроллит к нижней части контейнера с логами
   */
  scrollToBottom(): void {
    try {
      const element = this.logsContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (error) {
      console.warn('Ошибка при скролле к нижней части логов:', error);
    }
  }
}
