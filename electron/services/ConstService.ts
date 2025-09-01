import { ipcMain } from "electron";
import { IService } from "../interfaces/IService";
import { ConstantValues } from '../config/constants';
import { Constants } from "@shared/constants";

// Сервис для работы с константами
export class ConstService implements IService {
  /**
   * Настройка обработчиков
   */
  public setupHandlers(): void {
    // Получение констант
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CONSTANTS_SYSTEM.GET_CONSTANTS, async (event) : Promise<Constants> => {
        return ConstantValues;
      });
  }
}