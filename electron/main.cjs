const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let pendingWindowState = null;

const appFolderName = "LevelUp";
const dataFileName = "levelup-data.json";
const defaultWindowWidth = 420;
const defaultWindowHeight = 680;
const defaultMinWidth = 360;
const defaultMinHeight = 520;

function getDataFilePath() {
  const userDataPath = app.getPath("userData");
  const levelUpFolder = path.join(userDataPath, appFolderName);

  if (!fs.existsSync(levelUpFolder)) {
    fs.mkdirSync(levelUpFolder, { recursive: true });
  }

  return path.join(levelUpFolder, dataFileName);
}

function getDefaultData() {
  return {
    user: {
      name: "Hunter",
      rank: "E",
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      streak: 0,
    },
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      autoRepeat: false,
      minimizeToTray: true,
    },
    questGroups: [],
    timer: {
      mode: "focus",
      isRunning: false,
      remainingSeconds: 1500,
      currentSession: 1,
      completedSessions: 0,
    },
    windowState: {
      width: defaultWindowWidth,
      height: defaultWindowHeight,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function normalizeData(data) {
  const defaultData = getDefaultData();

  return {
    ...defaultData,
    ...data,
    user: {
      ...defaultData.user,
      ...(data.user || {}),
    },
    settings: {
      ...defaultData.settings,
      ...(data.settings || {}),
    },
    questGroups: data.questGroups || defaultData.questGroups,
    timer: {
      ...defaultData.timer,
      ...(data.timer || {}),
    },
    windowState: {
      ...defaultData.windowState,
      ...(data.windowState || {}),
    },
    metadata: {
      ...defaultData.metadata,
      ...(data.metadata || {}),
    },
  };
}

function loadData() {
  const filePath = getDataFilePath();

  if (!fs.existsSync(filePath)) {
    const defaultData = getDefaultData();
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }

  const rawData = fs.readFileSync(filePath, "utf-8");

  try {
    return normalizeData(JSON.parse(rawData));
  } catch (error) {
    console.error("Failed to parse Level Up data file:", error);

    const defaultData = getDefaultData();
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");

    return defaultData;
  }
}

function saveData(data) {
  const filePath = getDataFilePath();

  const normalizedData = normalizeData(data);
  const dataToSave = {
    ...normalizedData,
    metadata: {
      ...(normalizedData.metadata || {}),
      updatedAt: new Date().toISOString(),
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), "utf-8");

  return dataToSave;
}

function captureWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized() || mainWindow.isMaximized()) return;

  const bounds = mainWindow.getBounds();

  pendingWindowState = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
}

function persistWindowState() {
  if (!pendingWindowState) return;

  const currentData = loadData();

  saveData({
    ...currentData,
    windowState: {
      ...currentData.windowState,
      ...pendingWindowState,
    },
  });
}

function createWindow() {
  const initialData = loadData();
  const initialWindowState = initialData.windowState || {};

  mainWindow = new BrowserWindow({
    width: initialWindowState.width || defaultWindowWidth,
    height: initialWindowState.height || defaultWindowHeight,
    x:
      typeof initialWindowState.x === "number"
        ? initialWindowState.x
        : undefined,
    y:
      typeof initialWindowState.y === "number"
        ? initialWindowState.y
        : undefined,
    minWidth: defaultMinWidth,
    minHeight: defaultMinHeight,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#050816",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  pendingWindowState = {
    x:
      typeof initialWindowState.x === "number"
        ? initialWindowState.x
        : undefined,
    y:
      typeof initialWindowState.y === "number"
        ? initialWindowState.y
        : undefined,
    width: initialWindowState.width || defaultWindowWidth,
    height: initialWindowState.height || defaultWindowHeight,
  };
  mainWindow.on("move", captureWindowState);
  mainWindow.on("resize", captureWindowState);
  mainWindow.on("close", persistWindowState);

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("levelup:load-data", () => {
    return loadData();
  });

  ipcMain.handle("levelup:save-data", (_event, data) => {
    return saveData(data);
  });

  ipcMain.handle("levelup:get-data-file-path", () => {
    return getDataFilePath();
  });

  ipcMain.handle("levelup:minimize-window", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle("levelup:close-window", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
