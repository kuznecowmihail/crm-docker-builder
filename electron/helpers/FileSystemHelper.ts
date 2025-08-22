import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystemHelper {
  /**
   * Читает файл
   * @param filePath - путь к файлу
   * @returns содержимое файла
   */
  public async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Ошибка чтения файла: ${error}`);
    }
  }

  /**
   * Записывает в файл
   * @param filePath - путь к файлу
   * @param content - содержимое файла
   */
  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Ошибка записи файла: ${error}`);
    }
  }

  /**
   * Проверяет, существует ли файл
   * @param filePath - путь к файлу
   * @returns true, если файл существует, false в противном случае
   */
  public async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Создает директорию
   * @param dirPath - путь к директории
   */
  public async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Ошибка создания папки: ${error}`);
    }
  }

  /**
   * Проверяет, существует ли путь
   * @param path - путь
   * @returns true, если путь существует, false в противном случае
   */
  public async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает файлы в папке
   * @param path - путь к папке
   * @returns файлы в папке
   */
  public async getFilesInDirectory(path: string): Promise<string[]> {
    try {
      const files = await fs.readdir(path);
      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Проверяет, пустая ли папка
   * @param path - путь к папке
   * @returns true, если папка пустая, false в противном случае
   */
  public async isDirectoryEmpty(path: string): Promise<boolean> {
    try {
      const files = await fs.readdir(path);
      return files.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Проверяет, находится ли один путь внутри другого
   * @param innerPath - внутренний путь
   * @param outerPath - внешний путь
   * @returns true, если innerPath находится внутри outerPath
   */
  public isPathInside(innerPath: string, outerPath: string): boolean {
    try {
      const normalizedInnerPath = path.resolve(innerPath);
      const normalizedOuterPath = path.resolve(outerPath);
      
      return normalizedInnerPath.startsWith(normalizedOuterPath + path.sep) || 
             normalizedInnerPath === normalizedOuterPath;
    } catch (error) {
      return false;
    }
  }

  /**
   * Создает папку, если она не существует
   * @param directoryPath - путь к папке
   */
  public async ensureDirectoryExists(directoryPath: string): Promise<void> {
    try {
      await fs.mkdir(directoryPath, { recursive: true });
      console.log(`Папка создана/проверена: ${directoryPath}`);
    } catch (error) {
      console.error(`Ошибка при создании папки ${directoryPath}:`, error);
      throw error;
    }
  }

  /**
   * Копирует файл
   * @param sourcePath - путь к исходному файлу
   * @param destinationPath - путь к конечному файлу
   */
  public async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      await fs.copyFile(sourcePath, destinationPath);
    } catch (error) {
      console.error(`Ошибка копирования файла: ${error}`);
      throw new Error(`Ошибка копирования файла: ${error}`);
    }
  }
}
