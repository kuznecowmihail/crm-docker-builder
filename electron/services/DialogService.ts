import { dialog, ipcMain } from 'electron';
import { OpenDialogOptions, SaveDialogOptions } from '../types/services';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class DialogService implements IService {
  public setupHandlers(): void {
    // Диалог открытия файла
    ipcMain.handle(IPC_CHANNELS.DIALOG.OPEN_FILE, async (event, options) => {
      const result = await dialog.showOpenDialog(options);
      return result.filePaths;
    });

    // Диалог сохранения файла
    ipcMain.handle(IPC_CHANNELS.DIALOG.SAVE_FILE, async (event, options) => {
      const result = await dialog.showSaveDialog(options);
      return result.filePath;
    });
  }

  public async openFileDialog(options: OpenDialogOptions): Promise<string[]> {
    const result = await dialog.showOpenDialog(options);
    return result.filePaths;
  }

  public async saveFileDialog(options: SaveDialogOptions): Promise<string | undefined> {
    const result = await dialog.showSaveDialog(options);
    return result.filePath;
  }
}
