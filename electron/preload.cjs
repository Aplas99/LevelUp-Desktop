const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("levelUpAPI", {
  loadData: () => ipcRenderer.invoke("levelup:load-data"),
  saveData: (data) => ipcRenderer.invoke("levelup:save-data", data),
  getDataFilePath: () => ipcRenderer.invoke("levelup:get-data-file-path"),
  minimizeWindow: () => ipcRenderer.invoke("levelup:minimize-window"),
  closeWindow: () => ipcRenderer.invoke("levelup:close-window"),
});
