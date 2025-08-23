// Интерфейс для Electron API
export interface ElectronAPI {
  on(channel: string, callback: (event: any, ...args: any[]) => void): void;
  removeAllListeners(channel: string): void;
}
