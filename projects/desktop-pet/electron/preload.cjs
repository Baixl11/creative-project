const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopPet", {
  getConfig: () => ipcRenderer.invoke("pet:get-config"),
  saveConfig: (config) => ipcRenderer.invoke("pet:save-config", config),
  resetConfig: () => ipcRenderer.invoke("pet:reset-config"),
  openSettings: () => ipcRenderer.invoke("pet:open-settings"),
  showContextMenu: () => ipcRenderer.invoke("pet:show-context-menu"),
  getWindowBounds: () => ipcRenderer.invoke("pet:get-window-bounds"),
  setWindowPosition: (position) => ipcRenderer.send("pet:set-window-position", position),
  setMouseEventsIgnored: (ignored) => ipcRenderer.send("pet:set-mouse-events-ignored", ignored),
  onConfigUpdated: (callback) => {
    const listener = (_event, config) => callback(config);
    ipcRenderer.on("pet:config-updated", listener);
    return () => ipcRenderer.removeListener("pet:config-updated", listener);
  },
  onFlushSettings: (callback) => {
    const listener = async (_event, requestId) => {
      let errorMessage;
      try {
        await callback();
      } catch (error) {
        console.error("Failed to flush settings before close.", error);
        errorMessage = error instanceof Error ? error.message : String(error);
      } finally {
        ipcRenderer.send("pet:settings-flushed", {
          requestId,
          ok: !errorMessage,
          error: errorMessage
        });
      }
    };
    ipcRenderer.on("pet:flush-settings", listener);
    return () => ipcRenderer.removeListener("pet:flush-settings", listener);
  }
});
