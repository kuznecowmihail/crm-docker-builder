import { Notification, ipcMain } from 'electron';
import { NotificationOptions } from '../types/services';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class NotificationService implements IService {
  public setupHandlers(): void {
    // Показать уведомление
    ipcMain.handle(IPC_CHANNELS.NOTIFICATION.SHOW, async (event, title: string, body: string) => {
      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body
        });
        notification.show();
      }
    });
  }

  public showNotification(title: string, body: string, options?: Partial<NotificationOptions>): void {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        ...options
      });
      notification.show();
    }
  }

  public isSupported(): boolean {
    return Notification.isSupported();
  }
}
