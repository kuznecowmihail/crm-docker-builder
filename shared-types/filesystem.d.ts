// Типы для файловой системы

// API для работы с файловой системой
export interface FileSystemAPI {
  // Чтение файла
  readFile: (filePath: string) => Promise<string>;
  
  // Запись файла
  writeFile: (filePath: string, content: string) => Promise<void>;
  
  // Проверка существования файла
  fileExists: (filePath: string) => Promise<boolean>;
  
  // Создание папки
  createDirectory: (dirPath: string) => Promise<void>;
}

// Типы для файловой системы
export interface FileSystemError {
  message: string;
  code?: string;
}
