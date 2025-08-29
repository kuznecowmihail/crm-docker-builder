import { dialog, ipcMain } from 'electron';
import { OpenDialogOptions } from '@shared/api';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';

export class DialogService implements IService {
  public setupHandlers(): void {
    // Диалог открытия папки
    ipcMain.handle(ConstantValues.IPC_CHANNELS.DIALOG.OPEN_FOLDER, async (event, options: OpenDialogOptions) => {
      return await this.openFolderDialog(options);
    });

    // Диалог открытия файла
    ipcMain.handle(ConstantValues.IPC_CHANNELS.DIALOG.OPEN_FILE, async (event, options) => {
      return await this.openFileDialog(options);
    });
  }

  public async openFileDialog(options: OpenDialogOptions): Promise<string[]> {
    const result = await dialog.showOpenDialog(options);
    return result.filePaths;
  }

  public async openFolderDialog(options?: OpenDialogOptions): Promise<string | undefined> {
    const result = await dialog.showOpenDialog({
      ...options,
      properties: ['openDirectory']
    });
    return result.filePaths[0]; // Возвращаем путь к первой выбранной папке
  }
}
