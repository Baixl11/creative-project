import type { PetConfig } from "./types";

declare global {
  interface Window {
    desktopPet?: {
      getConfig: () => Promise<PetConfig>;
      saveConfig: (config: PetConfig) => Promise<PetConfig>;
      resetConfig: () => Promise<PetConfig>;
      openSettings: () => Promise<void>;
      showContextMenu: () => Promise<void>;
      getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
      setWindowPosition: (position: { x: number; y: number }) => void;
      setMouseEventsIgnored: (ignored: boolean) => void;
      onConfigUpdated: (callback: (config: PetConfig) => void) => () => void;
      onFlushSettings: (callback: () => Promise<void>) => () => void;
    };
  }
}

export {};
