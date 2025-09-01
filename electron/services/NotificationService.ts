import { Notification, ipcMain } from 'electron';
import { NotificationOptions } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';

// Сервис для работы с уведомлениями
export class NotificationService implements IService {
  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    // Показать уведомление
    ipcMain.handle(ConstantValues.IPC_CHANNELS.NOTIFICATION.SHOW, async (event, title: string, body: string) => {
      return await this.showNotification(title, body);
    });
  }

  /**
   * Показать уведомление
   * @param title - заголовок уведомления
   * @param body - текст уведомления
   * @param options - опции уведомления
   */
  public showNotification(title: string, body: string, options?: Partial<NotificationOptions>): void {
    if (this.isSupported()) {
      const notification = new Notification({
        title,
        body,
        ...options
      });
      notification.show();
    }
  }

  /**
   * Проверить поддержку уведомлений
   * @returns - true, если уведомления поддерживаются
   */
  public isSupported(): boolean {
    return Notification.isSupported();
  }
}
