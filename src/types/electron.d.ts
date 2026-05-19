import type { AppData } from "./appData";

export {};

declare global {
  interface Window {
    levelUpAPI: {
      loadData: () => Promise<AppData>;
      saveData: (data: AppData) => Promise<AppData>;
      getDataFilePath: () => Promise<string>;
      minimizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
    };
  }
}
