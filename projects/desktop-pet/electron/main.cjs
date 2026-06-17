const { app, BrowserWindow, Menu, Tray, ipcMain, screen, nativeImage } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");

const isDev = !app.isPackaged;
const appRoot = path.join(__dirname, "..");
const devServerUrl = "http://127.0.0.1:5173";
const previewCapturePath = process.env.PET_PREVIEW_CAPTURE_PATH;
const useDevServer = isDev && !previewCapturePath;
const previewRuntimeDir = previewCapturePath
  ? path.join(os.tmpdir(), `desktop-pet-preview-${process.pid}-${Date.now()}`)
  : undefined;

if (previewCapturePath) {
  fs.mkdirSync(path.join(previewRuntimeDir, "userData"), { recursive: true });
  fs.mkdirSync(path.join(previewRuntimeDir, "sessionData"), { recursive: true });
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-gpu-compositing");
  app.commandLine.appendSwitch("disable-gpu-sandbox");
  app.commandLine.appendSwitch("disable-accelerated-2d-canvas");
  app.commandLine.appendSwitch("enable-unsafe-swiftshader");
  app.commandLine.appendSwitch("ignore-gpu-blocklist");
  app.setPath("userData", path.join(previewRuntimeDir, "userData"));
  app.setPath("sessionData", path.join(previewRuntimeDir, "sessionData"));
}

let petWindow;
let settingsWindow;
let tray;
let petWindowIgnoresMouse = false;
let settingsWindowCloseAfterFlush = false;
let settingsWindowFlushInProgress = false;
let nextSettingsFlushRequestId = 1;

const defaultPetBounds = {
  width: 280,
  height: 280
};

function readPetManifest() {
  const fallbackManifest = {
    defaultPetId: "line-dog",
    supportedPetIds: ["line-dog"]
  };

  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(appRoot, "pet-manifest.json"), "utf8"));
    if (
      typeof manifest.defaultPetId === "string" &&
      Array.isArray(manifest.supportedPetIds) &&
      manifest.supportedPetIds.every((petId) => typeof petId === "string") &&
      manifest.supportedPetIds.includes(manifest.defaultPetId)
    ) {
      return manifest;
    }
  } catch {
    // Fall back to the first MVP pet if a packaged manifest is missing or malformed.
  }

  return fallbackManifest;
}

const petManifest = readPetManifest();
const defaultPetId = petManifest.defaultPetId;
const supportedPetIds = new Set(petManifest.supportedPetIds);

const defaultAppearance = {
  lineColor: "#111827",
  scale: 1,
  lineWeight: 4,
  earStyle: "floppy",
  tailStyle: "curly",
  animationIntensity: "default"
};

function getConfigPath() {
  return path.join(app.getPath("userData"), "desktop-pet-config.json");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(Math.max(number, min), max);
}

function sanitizeAppearance(appearance) {
  if (!isPlainObject(appearance)) {
    return undefined;
  }

  const nextAppearance = {};
  if (typeof appearance.lineColor === "string" && /^#[0-9a-f]{6}$/i.test(appearance.lineColor)) {
    nextAppearance.lineColor = appearance.lineColor;
  }
  if (appearance.scale !== undefined) {
    nextAppearance.scale = clampNumber(appearance.scale, defaultAppearance.scale, 0.8, 1.4);
  }
  if (appearance.lineWeight !== undefined) {
    nextAppearance.lineWeight = clampNumber(appearance.lineWeight, defaultAppearance.lineWeight, 1.8, 5);
  }
  if (appearance.earStyle === "floppy" || appearance.earStyle === "pointy") {
    nextAppearance.earStyle = appearance.earStyle;
  }
  if (appearance.tailStyle === "short" || appearance.tailStyle === "curly") {
    nextAppearance.tailStyle = appearance.tailStyle;
  }
  if (
    appearance.animationIntensity === "calm" ||
    appearance.animationIntensity === "default" ||
    appearance.animationIntensity === "lively"
  ) {
    nextAppearance.animationIntensity = appearance.animationIntensity;
  }

  return Object.keys(nextAppearance).length > 0 ? nextAppearance : undefined;
}

function sanitizeConfig(config) {
  if (!isPlainObject(config)) {
    return {};
  }

  const nextConfig = {};
  if (
    typeof config.selectedPetId === "string" &&
    /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(config.selectedPetId) &&
    supportedPetIds.has(config.selectedPetId) &&
    config.selectedPetId !== defaultPetId
  ) {
    nextConfig.selectedPetId = config.selectedPetId;
  }

  const appearance = sanitizeAppearance(config.appearance);
  if (appearance) {
    nextConfig.appearance = appearance;
  }

  if (isPlainObject(config.petBounds)) {
    const x = Number(config.petBounds.x);
    const y = Number(config.petBounds.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      nextConfig.petBounds = {
        x: Math.round(x),
        y: Math.round(y)
      };
    }
  }

  return nextConfig;
}

function readConfig() {
  try {
    const raw = fs.readFileSync(getConfigPath(), "utf8");
    return sanitizeConfig(JSON.parse(raw));
  } catch {
    return {};
  }
}

function writeConfig(nextConfig) {
  const config = sanitizeConfig({
    ...readConfig(),
    ...nextConfig
  });
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf8");
}

function replaceConfig(nextConfig) {
  const config = sanitizeConfig(nextConfig);
  fs.mkdirSync(app.getPath("userData"), { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf8");
}

function getVisiblePetBounds() {
  const config = readConfig();
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const fallbackBounds = {
    x: Math.round(primaryDisplay.workArea.x + primaryDisplay.workArea.width - defaultPetBounds.width - 32),
    y: Math.round(primaryDisplay.workArea.y + primaryDisplay.workArea.height - defaultPetBounds.height - 32),
    ...defaultPetBounds
  };

  if (!config.petBounds) {
    return fallbackBounds;
  }

  const saved = {
    ...fallbackBounds,
    ...config.petBounds,
    width: defaultPetBounds.width,
    height: defaultPetBounds.height
  };

  const isVisible = displays.some((display) => {
    const area = display.workArea;
    const centerX = saved.x + saved.width / 2;
    const centerY = saved.y + saved.height / 2;
    return centerX >= area.x && centerX <= area.x + area.width && centerY >= area.y && centerY <= area.y + area.height;
  });

  return isVisible ? saved : fallbackBounds;
}

function persistPetBounds() {
  if (!petWindow || petWindow.isDestroyed()) {
    return;
  }

  const bounds = petWindow.getBounds();
  writeConfig({
    petBounds: {
      x: bounds.x,
      y: bounds.y
    }
  });
}

function createTrayIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#111827"/>
      <path d="M9 18c1.5-5 4-7.5 8-7.5S24 13 24 18c0 3.5-3 6-7.5 6S8 21.5 9 18Z" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 11 9 7M20 11l3-4M13 18h.01M20 18h.01M15 21c1 .7 2 .7 3 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  return nativeImage.createFromDataURL(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
}

function updateTrayMenu() {
  if (!tray) {
    return;
  }

  const isVisible = petWindow && !petWindow.isDestroyed() && petWindow.isVisible();
  const menu = Menu.buildFromTemplate([
    {
      label: isVisible ? "隐藏宠物" : "显示宠物",
      click: togglePetVisibility
    },
    {
      label: "设置",
      click: () => createSettingsWindow()
    },
    {
      label: "重置位置",
      click: resetPetPosition
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        persistPetBounds();
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(menu);
}

function resetPetPosition() {
  if (!petWindow || petWindow.isDestroyed()) {
    createPetWindow();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const nextBounds = {
    x: Math.round(primaryDisplay.workArea.x + primaryDisplay.workArea.width - defaultPetBounds.width - 32),
    y: Math.round(primaryDisplay.workArea.y + primaryDisplay.workArea.height - defaultPetBounds.height - 32),
    ...defaultPetBounds
  };
  petWindow.setBounds(nextBounds);
  persistPetBounds();
}

function togglePetVisibility() {
  if (!petWindow || petWindow.isDestroyed()) {
    createPetWindow();
    return;
  }

  if (petWindow.isVisible()) {
    petWindow.hide();
  } else {
    petWindow.showInactive();
  }
  updateTrayMenu();
}

function showPetContextMenu() {
  const isVisible = petWindow && !petWindow.isDestroyed() && petWindow.isVisible();
  const menu = Menu.buildFromTemplate([
    {
      label: isVisible ? "隐藏宠物" : "显示宠物",
      click: togglePetVisibility
    },
    {
      label: "设置",
      click: () => createSettingsWindow()
    },
    {
      label: "重置位置",
      click: resetPetPosition
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        persistPetBounds();
        app.quit();
      }
    }
  ]);
  menu.popup({ window: petWindow });
}

function createPetWindow() {
  if (petWindow && !petWindow.isDestroyed()) {
    petWindow.show();
    return petWindow;
  }

  petWindow = new BrowserWindow({
    ...getVisiblePetBounds(),
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    show: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  petWindow.setAlwaysOnTop(true, "floating");

  petWindow.once("ready-to-show", () => {
    petWindow.showInactive();
    updateTrayMenu();
  });

  petWindow.on("moved", persistPetBounds);
  petWindow.on("close", persistPetBounds);
  petWindow.on("show", updateTrayMenu);
  petWindow.on("hide", updateTrayMenu);
  petWindow.on("closed", () => {
    petWindow = undefined;
    updateTrayMenu();
  });

  if (useDevServer) {
    petWindow.loadURL(devServerUrl);
  } else {
    petWindow.loadFile(path.join(appRoot, "dist", "index.html"));
  }

  return petWindow;
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: 560,
    height: 700,
    title: "桌面玩偶设置",
    minWidth: 420,
    minHeight: 640,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  settingsWindow.once("ready-to-show", () => {
    settingsWindow.show();
  });

  settingsWindow.on("close", (event) => {
    if (settingsWindowCloseAfterFlush || settingsWindow.isDestroyed()) {
      settingsWindowCloseAfterFlush = false;
      settingsWindowFlushInProgress = false;
      return;
    }

    event.preventDefault();
    if (!settingsWindowFlushInProgress) {
      flushSettingsBeforeClose(settingsWindow);
    }
  });

  settingsWindow.on("closed", () => {
    settingsWindowCloseAfterFlush = false;
    settingsWindowFlushInProgress = false;
    settingsWindow = undefined;
  });

  if (useDevServer) {
    settingsWindow.loadURL(`${devServerUrl}?view=settings`);
  } else {
    settingsWindow.loadFile(path.join(appRoot, "dist", "index.html"), {
      query: {
        view: "settings"
      }
    });
  }

  return settingsWindow;
}

function flushSettingsBeforeClose(windowToClose) {
  if (!windowToClose || windowToClose.isDestroyed()) {
    return;
  }

  const requestId = nextSettingsFlushRequestId;
  nextSettingsFlushRequestId += 1;
  settingsWindowFlushInProgress = true;
  let settled = false;
  let closeTimer;

  function closeAfterFlush() {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(closeTimer);
    ipcMain.removeListener("pet:settings-flushed", onSettingsFlushed);
    settingsWindowFlushInProgress = false;
    if (windowToClose.isDestroyed()) {
      return;
    }
    settingsWindowCloseAfterFlush = true;
    windowToClose.close();
  }

  function onSettingsFlushed(_event, flushedRequestId) {
    if (flushedRequestId === requestId) {
      closeAfterFlush();
    }
  }

  ipcMain.on("pet:settings-flushed", onSettingsFlushed);
  windowToClose.webContents.send("pet:flush-settings", requestId);
  closeTimer = setTimeout(closeAfterFlush, 1500);
}

async function capturePetPreview() {
  const window = new BrowserWindow({
    width: 1200,
    height: 1100,
    show: false,
    backgroundColor: "#f7f8f5",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (useDevServer) {
    await window.loadURL(`${devServerUrl}?view=pet-preview`);
  } else {
    await window.loadFile(path.join(appRoot, "dist", "index.html"), {
      query: {
        view: "pet-preview"
      }
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 900));
  const image = await window.webContents.capturePage();
  fs.mkdirSync(path.dirname(previewCapturePath), { recursive: true });
  fs.writeFileSync(previewCapturePath, image.toPNG());
  window.destroy();
}

function createAppTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip("桌面玩偶");
  tray.on("click", () => {
    if (!petWindow || petWindow.isDestroyed()) {
      createPetWindow();
      return;
    }
    if (petWindow.isVisible()) {
      petWindow.hide();
    } else {
      petWindow.showInactive();
    }
    updateTrayMenu();
  });
  updateTrayMenu();
}

function registerIpcHandlers() {
  ipcMain.handle("pet:get-config", () => readConfig());
  ipcMain.handle("pet:save-config", (_event, config) => {
    writeConfig(config);
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.webContents.send("pet:config-updated", readConfig());
    }
    return readConfig();
  });
  ipcMain.handle("pet:reset-config", () => {
    replaceConfig({});
    if (petWindow && !petWindow.isDestroyed()) {
      petWindow.setBounds(getVisiblePetBounds());
      petWindow.webContents.send("pet:config-updated", readConfig());
    }
    return readConfig();
  });
  ipcMain.handle("pet:open-settings", () => {
    createSettingsWindow();
  });
  ipcMain.handle("pet:show-context-menu", () => {
    showPetContextMenu();
  });
  ipcMain.handle("pet:get-window-bounds", () => {
    if (!petWindow || petWindow.isDestroyed()) {
      return getVisiblePetBounds();
    }
    return petWindow.getBounds();
  });
  ipcMain.on("pet:set-window-position", (_event, position) => {
    if (!petWindow || petWindow.isDestroyed()) {
      return;
    }
    const x = Number(position?.x);
    const y = Number(position?.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      petWindow.setPosition(Math.round(x), Math.round(y), false);
    }
  });
  ipcMain.on("pet:set-mouse-events-ignored", (_event, ignored) => {
    if (!petWindow || petWindow.isDestroyed()) {
      return;
    }
    const nextIgnored = Boolean(ignored);
    if (petWindowIgnoresMouse === nextIgnored) {
      return;
    }
    petWindowIgnoresMouse = nextIgnored;
    petWindow.setIgnoreMouseEvents(nextIgnored, { forward: true });
  });
}

const gotLock = previewCapturePath ? true : app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const window = createPetWindow();
    window.showInactive();
  });

  app.whenReady().then(() => {
    if (previewCapturePath) {
      capturePetPreview()
        .then(() => app.quit())
        .catch((error) => {
          console.error(error);
          app.exitCode = 1;
          app.quit();
        });
      return;
    }

    registerIpcHandlers();
    createAppTray();
    createPetWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createPetWindow();
      }
    });
  });

  app.on("window-all-closed", (event) => {
    event.preventDefault();
  });

  app.on("before-quit", persistPetBounds);
  app.on("will-quit", () => {
    if (previewRuntimeDir) {
      fs.rmSync(previewRuntimeDir, { recursive: true, force: true });
    }
  });
}
