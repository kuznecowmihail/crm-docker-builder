import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import { IPC_CHANNELS } from '../config/constants';
import { IService } from '../interfaces/IService';

export class FileSystemService implements IService {
  public setupHandlers(): void {
    // Чтение файла
    ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_FILE, async (event, filePath: string) => {
      try {
        return await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        throw new Error(`Ошибка чтения файла: ${error}`);
      }
    });

    // Запись файла
    ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, async (event, filePath: string, content: string) => {
      try {
        await fs.writeFile(filePath, content, 'utf-8');
      } catch (error) {
        throw new Error(`Ошибка записи файла: ${error}`);
      }
    });

    // Проверка существования файла
    ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.FILE_EXISTS, async (event, filePath: string) => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    });

    // Создание папки
    ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.CREATE_DIR, async (event, dirPath: string) => {
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (error) {
        throw new Error(`Ошибка создания папки: ${error}`);
      }
    });
  }

  public async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Ошибка чтения файла: ${error}`);
    }
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Ошибка записи файла: ${error}`);
    }
  }

  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Ошибка создания папки: ${error}`);
    }
  }
}
