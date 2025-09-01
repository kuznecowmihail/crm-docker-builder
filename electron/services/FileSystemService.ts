import { ipcMain } from 'electron';
import { ConstantValues } from '../config/constants';
import { IService } from '../interfaces/IService';
import { FileSystemHelper } from '../helpers/FileSystemHelper';

// Сервис для работы с файловой системой
export class FileSystemService implements IService {
  /**
   * Помощник для работы с файловой системой
   */
  private helper: FileSystemHelper;
  
  /**
   * Конструктор
   */
  constructor() {
    this.helper = new FileSystemHelper();
  }

  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    // Чтение файла
    ipcMain.handle(ConstantValues.IPC_CHANNELS.FILE_SYSTEM.READ_FILE, async (event, filePath: string) => {
      return await this.helper.readFile(filePath);
    });

    // Запись файла
    ipcMain.handle(ConstantValues.IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, async (event, filePath: string, content: string) => {
      return await this.helper.writeFile(filePath, content);
    });

    // Проверка существования файла
    ipcMain.handle(ConstantValues.IPC_CHANNELS.FILE_SYSTEM.FILE_EXISTS, async (event, filePath: string) => {
      return await this.helper.fileExists(filePath);
    });

    // Создание папки
    ipcMain.handle(ConstantValues.IPC_CHANNELS.FILE_SYSTEM.CREATE_DIR, async (event, dirPath: string) => {
      return await this.helper.createDirectory(dirPath);
    });
  }
}
