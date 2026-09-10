import * as fs from 'fs/promises';
import * as path from 'path';

// Помощник для работы с файловой системой
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
      const directory = path.dirname(filePath);
      await this.ensureDirectoryExists(directory);
      
      await fs.writeFile(filePath, this.normalizeLineEndings(content), 'utf-8');
    } catch (error) {
      throw new Error(`Ошибка записи файла: ${error}`);
    }
  }

  /**
   * Записывает в файл с правильной кодировкой для Windows
   * @param filePath - путь к файлу
   * @param content - содержимое файла
   * @param encoding - кодировка (по умолчанию utf-8)
   */
  public async writeFileWithEncoding(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
    try {
      const directory = path.dirname(filePath);
      await this.ensureDirectoryExists(directory);
      
      // Для PowerShell скриптов на Windows добавляем BOM
      if (path.extname(filePath).toLowerCase() === '.ps1' && process.platform === 'win32') {
        const fileBuffer = this.addBOMForPowerShell(content);
        await fs.writeFile(filePath, fileBuffer);
      } else {
        await fs.writeFile(filePath, this.normalizeLineEndings(content), encoding);
      }
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
      const normalizedInnerPath = this.normalizeForCompare(innerPath);
      const normalizedOuterPath = this.normalizeForCompare(outerPath);
      
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
   * @param onLogCallback - колбэк для отслеживания прогресса (опционально)
   */
  public async copyFile(sourcePath: string, destinationPath: string, onLogCallback?: (message: string) => void): Promise<void> {
    try {
      onLogCallback?.(`[FileSystemHelper] 🚀 Начинаем копирование файла: ${sourcePath} -> ${destinationPath}`);
      await fs.copyFile(sourcePath, destinationPath);
      onLogCallback?.(`[FileSystemHelper] ✅ Файл успешно скопирован: ${sourcePath} -> ${destinationPath}`);
    } catch (error) {
      const errorMessage = `[FileSystemHelper] ❌ Ошибка копирования файла: ${error}`;
      onLogCallback?.(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Копирует папку рекурсивно
   * @param sourcePath - путь к исходной папке
   * @param destinationPath - путь к конечной папке
   * @param onLogCallback - колбэк для отслеживания прогресса (опционально)
   */
  public async copyDirectory(sourcePath: string, destinationPath: string, onLogCallback?: (message: string) => void): Promise<void> {
    try {
      onLogCallback?.(`[FileSystemHelper] 🚀 Начинаем копирование папки: ${sourcePath} -> ${destinationPath}`);
      
      // Проверяем, существует ли исходная папка
      if (!await this.pathExists(sourcePath)) {
        throw new Error(`[FileSystemHelper] Исходная папка не существует: ${sourcePath}`);
      }

      // Создаем целевую папку, если она не существует
      await this.createDirectory(destinationPath);
      onLogCallback?.(`[FileSystemHelper] 📁 Создана целевая папка: ${destinationPath}`);

      // Получаем все элементы в исходной папке
      const items = await fs.readdir(sourcePath);
      
      for (const item of items) {
        const sourceItemPath = path.join(sourcePath, item);
        const destinationItemPath = path.join(destinationPath, item);
        
        const stats = await fs.stat(sourceItemPath);
        
        if (stats.isDirectory()) {
          // Если это папка - рекурсивно копируем её
          onLogCallback?.(`[FileSystemHelper] 📂 Копируем папку: ${item}`);
          await this.copyDirectory(sourceItemPath, destinationItemPath, onLogCallback);
        } else {
          // Если это файл - копируем его
          onLogCallback?.(`[FileSystemHelper] 📄 Копируем файл: ${item}`);
          await fs.copyFile(sourceItemPath, destinationItemPath);
        }
      }
      
      onLogCallback?.(`[FileSystemHelper] ✅ Папка успешно скопирована: ${sourcePath} -> ${destinationPath}`);
      
    } catch (error) {
      const errorMessage = `[FileSystemHelper] ❌ Ошибка копирования папки ${sourcePath}: ${error}`;
      onLogCallback?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Приводит переводы строк к LF (генерируемые sh/yml/Dockerfile должны быть без CR)
   * @param content - текст
   * @returns текст с LF
   */
  private normalizeLineEndings(content: string): string {
    return content.replace(/\r\n?/g, '\n');
  }

  /**
   * Нормализует путь для сравнения (на Windows — без учёта регистра)
   * @param targetPath - путь
   * @returns нормализованный абсолютный путь
   */
  private normalizeForCompare(targetPath: string): string {
    const resolved = path.resolve(targetPath);
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  }

  /**
   * Проверяет, указывают ли два пути на один каталог/файл
   * @param firstPath - первый путь
   * @param secondPath - второй путь
   * @returns true, если пути совпадают
   */
  public isSamePath(firstPath: string, secondPath: string): boolean {
    return this.normalizeForCompare(firstPath) === this.normalizeForCompare(secondPath);
  }

  /**
   * Добавляет BOM для PowerShell скриптов на Windows
   * @param content - содержимое файла
   * @returns буфер с BOM
   */
  private addBOMForPowerShell(content: string): Buffer {
    const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);
    const contentBuffer = Buffer.from(content, 'utf-8');
    return Buffer.concat([BOM, contentBuffer]);
  }
}
