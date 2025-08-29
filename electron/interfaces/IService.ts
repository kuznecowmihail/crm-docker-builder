// Базовый интерфейс для всех сервисов
export interface IService {
  setupHandlers(): void;
}

// Интерфейс для сервисов с инициализацией
export interface IInitializableService extends IService {
  initialize(): void;
}

// Интерфейс для сервисов с очисткой ресурсов
export interface IDisposableService extends IService {
  dispose(): void;
}
