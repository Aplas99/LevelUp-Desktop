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
      setAlwaysOnTop: (value: boolean) => Promise<void>;
      setOpacity: (value: number) => Promise<void>;
      setStartWithWindows: (value: boolean) => Promise<void>;
      quitApp: () => Promise<void>;
    };
  }
}
