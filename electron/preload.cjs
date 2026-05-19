const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("levelUpAPI", {
  loadData: () => ipcRenderer.invoke("levelup:load-data"),
  saveData: (data) => ipcRenderer.invoke("levelup:save-data", data),
  getDataFilePath: () => ipcRenderer.invoke("levelup:get-data-file-path"),
  minimizeWindow: () => ipcRenderer.invoke("levelup:minimize-window"),
  closeWindow: () => ipcRenderer.invoke("levelup:close-window"),
  setAlwaysOnTop: (value) => ipcRenderer.invoke("levelup:set-always-on-top", value),
  setOpacity: (value) => ipcRenderer.invoke("levelup:set-opacity", value),
  setStartWithWindows: (value) => ipcRenderer.invoke("levelup:set-start-with-windows", value),
  quitApp: () => ipcRenderer.invoke("levelup:quit-app"),
});
