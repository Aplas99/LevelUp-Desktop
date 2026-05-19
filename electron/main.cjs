const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

let mainWindow;
let tray = null;
let pendingWindowState = null;
let isQuitting = false;

const appFolderName = "LevelUp";
const dataFileName = "levelup-data.json";
const defaultWindowWidth = 420;
const defaultWindowHeight = 680;
const defaultMinWidth = 360;
const defaultMinHeight = 520;

// ---------------------------------------------------------------------------
// PNG icon helper — creates a solid-color 16x16 PNG without external files
// ---------------------------------------------------------------------------
function createSolidColorPNG(width, height, r, g, b) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[i] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (const byte of buf) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const t = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const raw = Buffer.alloc((1 + width * 3) * height);
  for (let y = 0; y < height; y++) {
    const base = y * (1 + width * 3);
    for (let x = 0; x < width; x++) {
      raw[base + 1 + x * 3] = r;
      raw[base + 1 + x * 3 + 1] = g;
      raw[base + 1 + x * 3 + 2] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------
function getDataFilePath() {
  const userDataPath = app.getPath("userData");
  const levelUpFolder = path.join(userDataPath, appFolderName);
  if (!fs.existsSync(levelUpFolder)) fs.mkdirSync(levelUpFolder, { recursive: true });
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
      lastActiveDate: null,
    },
    settings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      autoRepeat: false,
      minimizeToTray: true,
      alwaysOnTop: false,
      startWithWindows: false,
      opacity: 100,
    },
    questGroups: [],
    timer: {
      mode: "focus",
      isRunning: false,
      remainingSeconds: 1500,
      currentSession: 1,
      completedSessions: 0,
    },
    windowState: { width: defaultWindowWidth, height: defaultWindowHeight },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

function normalizeData(data) {
  const def = getDefaultData();
  return {
    ...def,
    ...data,
    user: { ...def.user, ...(data.user || {}) },
    settings: { ...def.settings, ...(data.settings || {}) },
    questGroups: data.questGroups || def.questGroups,
    timer: { ...def.timer, ...(data.timer || {}) },
    windowState: { ...def.windowState, ...(data.windowState || {}) },
    metadata: { ...def.metadata, ...(data.metadata || {}) },
  };
}

function loadData() {
  const filePath = getDataFilePath();
  if (!fs.existsSync(filePath)) {
    const d = getDefaultData();
    fs.writeFileSync(filePath, JSON.stringify(d, null, 2), "utf-8");
    return d;
  }
  try {
    return normalizeData(JSON.parse(fs.readFileSync(filePath, "utf-8")));
  } catch {
    const d = getDefaultData();
    fs.writeFileSync(filePath, JSON.stringify(d, null, 2), "utf-8");
    return d;
  }
}

function saveData(data) {
  const filePath = getDataFilePath();
  const normalized = normalizeData(data);
  const toSave = { ...normalized, metadata: { ...(normalized.metadata || {}), updatedAt: new Date().toISOString() } };
  fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2), "utf-8");
  return toSave;
}

// ---------------------------------------------------------------------------
// Window state persistence
// ---------------------------------------------------------------------------
function captureWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized() || mainWindow.isMaximized()) return;
  const b = mainWindow.getBounds();
  pendingWindowState = { x: b.x, y: b.y, width: b.width, height: b.height };
}

function persistWindowState() {
  if (!pendingWindowState) return;
  const cur = loadData();
  saveData({ ...cur, windowState: { ...cur.windowState, ...pendingWindowState } });
}

// ---------------------------------------------------------------------------
// Tray
// ---------------------------------------------------------------------------
function createTray() {
  const iconBuffer = createSolidColorPNG(16, 16, 0x22, 0xd3, 0xee); // cyan-400
  const icon = nativeImage.createFromBuffer(iconBuffer);
  tray = new Tray(icon);
  tray.setToolTip("Level Up");

  const menu = Menu.buildFromTemplate([
    {
      label: "Show Level Up",
      click: () => {
        if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        persistWindowState();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(menu);
  tray.on("click", () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });
}

// ---------------------------------------------------------------------------
// Window creation
// ---------------------------------------------------------------------------
function createWindow() {
  const initialData = loadData();
  const ws = initialData.windowState || {};
  const settings = initialData.settings || {};

  mainWindow = new BrowserWindow({
    width: ws.width || defaultWindowWidth,
    height: ws.height || defaultWindowHeight,
    x: typeof ws.x === "number" ? ws.x : undefined,
    y: typeof ws.y === "number" ? ws.y : undefined,
    minWidth: defaultMinWidth,
    minHeight: defaultMinHeight,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#050816",
    opacity: typeof settings.opacity === "number" ? settings.opacity / 100 : 1,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (settings.alwaysOnTop) mainWindow.setAlwaysOnTop(true);

  pendingWindowState = {
    x: typeof ws.x === "number" ? ws.x : undefined,
    y: typeof ws.y === "number" ? ws.y : undefined,
    width: ws.width || defaultWindowWidth,
    height: ws.height || defaultWindowHeight,
  };

  mainWindow.on("move", captureWindowState);
  mainWindow.on("resize", captureWindowState);

  mainWindow.on("close", (event) => {
    if (isQuitting) return;
    captureWindowState();
    const cur = loadData();
    if (cur.settings.minimizeToTray && tray) {
      event.preventDefault();
      mainWindow.hide();
    } else {
      persistWindowState();
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------
app.whenReady().then(() => {
  // Data IPC
  ipcMain.handle("levelup:load-data", () => loadData());
  ipcMain.handle("levelup:save-data", (_e, data) => saveData(data));
  ipcMain.handle("levelup:get-data-file-path", () => getDataFilePath());

  // Window IPC
  ipcMain.handle("levelup:minimize-window", () => mainWindow?.minimize());
  ipcMain.handle("levelup:close-window", () => {
    if (!mainWindow) return;
    const cur = loadData();
    if (cur.settings.minimizeToTray && tray) {
      mainWindow.hide();
    } else {
      isQuitting = true;
      persistWindowState();
      mainWindow.close();
    }
  });
  ipcMain.handle("levelup:quit-app", () => {
    isQuitting = true;
    persistWindowState();
    app.quit();
  });

  // Shell settings IPC
  ipcMain.handle("levelup:set-always-on-top", (_e, value) => {
    mainWindow?.setAlwaysOnTop(value);
  });
  ipcMain.handle("levelup:set-opacity", (_e, value) => {
    if (mainWindow) mainWindow.setOpacity(Math.max(0.1, Math.min(1, value / 100)));
  });
  ipcMain.handle("levelup:set-start-with-windows", (_e, value) => {
    app.setLoginItemSettings({ openAtLogin: value });
  });

  createTray();
  createWindow();
});

app.on("before-quit", () => {
  isQuitting = true;
  persistWindowState();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
