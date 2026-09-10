// Интерфейс для Electron API (только разрешённые события)
export interface ElectronAPI {
  /** Подписка на логи проекта. Возвращает функцию отписки. */
  onProjectLog(callback: (log: string) => void): () => void;
  /** Снять все подписки на логи проекта */
  removeProjectLogListeners(): void;
}
