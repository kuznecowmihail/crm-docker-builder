import { dialog, ipcMain } from 'electron';
import { OpenDialogOptions } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';

// Сервис для работы с диалогами
export class DialogService implements IService {
  private static readonly ALLOWED_PROPERTIES = new Set([
    'openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles',
    'createDirectory', 'promptToCreate', 'dontAddToRecent',
  ]);

  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    ipcMain.handle(ConstantValues.IPC_CHANNELS.DIALOG.OPEN_FOLDER, async (event, options: OpenDialogOptions) => {
      return await this.openFolderDialog(options);
    });
    ipcMain.handle(ConstantValues.IPC_CHANNELS.DIALOG.OPEN_FILE, async (event, options) => {
      return await this.openFileDialog(options);
    });
  }

  public async openFileDialog(options: OpenDialogOptions): Promise<string[]> {
    const result = await dialog.showOpenDialog(this.sanitizeOptions(options));
    return result.filePaths;
  }

  public async openFolderDialog(options?: OpenDialogOptions): Promise<string | undefined> {
    const result = await dialog.showOpenDialog({
      ...this.sanitizeOptions(options),
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  }

  /**
   * Фильтрует массив filters диалога
   */
  private sanitizeFilters(filters: unknown): OpenDialogOptions['filters'] | undefined {
    if (!Array.isArray(filters)) return undefined;
    const valid = filters.filter(
      (f): f is { name: string; extensions: string[] } =>
        typeof f === 'object' && f !== null &&
        typeof (f as { name: unknown }).name === 'string' &&
        Array.isArray((f as { extensions: unknown }).extensions) &&
        (f as { extensions: unknown[] }).extensions.every(e => typeof e === 'string')
    );
    return valid.length > 0 ? valid : undefined;
  }

  /**
   * Фильтрует массив properties диалога
   */
  private sanitizeProperties(properties: unknown): OpenDialogOptions['properties'] | undefined {
    if (!Array.isArray(properties)) return undefined;
    const valid = properties.filter(
      (p): p is NonNullable<OpenDialogOptions['properties']>[number] =>
        typeof p === 'string' && DialogService.ALLOWED_PROPERTIES.has(p)
    );
    return valid.length > 0 ? valid : undefined;
  }

  /**
   * Возвращает только разрешённые поля опций диалога
   */
  private sanitizeOptions(options?: OpenDialogOptions): OpenDialogOptions {
    if (!options) return {};
    const result: OpenDialogOptions = {};
    if (typeof options.title === 'string') result.title = options.title;
    if (typeof options.defaultPath === 'string') result.defaultPath = options.defaultPath;
    if (typeof options.buttonLabel === 'string') result.buttonLabel = options.buttonLabel;
    if (typeof options.message === 'string') result.message = options.message;
    const filters = this.sanitizeFilters(options.filters);
    if (filters) result.filters = filters;
    const properties = this.sanitizeProperties(options.properties);
    if (properties) result.properties = properties;
    return result;
  }
}
