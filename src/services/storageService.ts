import type { AppData } from "../types/appData";

export async function loadAppData(): Promise<AppData> {
  return window.levelUpAPI.loadData();
}

export async function saveAppData(data: AppData): Promise<AppData> {
  return window.levelUpAPI.saveData(data);
}

export async function getAppDataFilePath(): Promise<string> {
  return window.levelUpAPI.getDataFilePath();
}
