import { ipcMain } from "electron";
import { IService } from "../interfaces/IService";
import { ConstantValues } from '../config/constants';
import { Constants } from "@shared/constants";

export class ConstService implements IService {
  public setupHandlers(): void {
    // Создание проекта
    ipcMain.handle(ConstantValues.IPC_CHANNELS.CONSTANTS_SYSTEM.GET_CONSTANTS, async (event) : Promise<Constants> => {
        return ConstantValues;
      });
  }
}