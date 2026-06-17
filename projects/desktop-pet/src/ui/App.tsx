import { useEffect, useMemo, useState } from "react";
import { getPetDefinition } from "../pets/registry";
import { PetScene } from "../visuals/PetScene";
import { defaultAppearance, PetAppearance, PetConfig, resolveAppearance, resolveSelectedPetId } from "../types";
import { SettingsPanel } from "./SettingsPanel";

const isSettingsView = new URLSearchParams(window.location.search).get("view") === "settings";

export function App() {
  const [config, setConfig] = useState<PetConfig>({});
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    let cleanup: undefined | (() => void);
    if (!window.desktopPet) {
      setConfigLoaded(true);
      return undefined;
    }
    window.desktopPet.getConfig().then((nextConfig) => {
      setConfig(nextConfig);
      setConfigLoaded(true);
    });
    cleanup = window.desktopPet?.onConfigUpdated((nextConfig) => setConfig(nextConfig));
    return () => cleanup?.();
  }, []);

  const appearance = useMemo(() => resolveAppearance(config), [config]);
  const selectedPetId = useMemo(() => getPetDefinition(resolveSelectedPetId(config)).id, [config]);

  if (isSettingsView) {
    if (!configLoaded) {
      return (
        <main className="settings">
          <header className="settings__header">
            <div>
              <p className="eyebrow">桌面玩偶</p>
              <h1>宠物设置</h1>
            </div>
            <span className="status">加载中</span>
          </header>
        </main>
      );
    }

    return (
      <SettingsPanel
        selectedPetId={selectedPetId}
        appearance={appearance}
        onSave={async (nextSelectedPetId, nextAppearance) => {
          const nextConfig = await window.desktopPet?.saveConfig({
            selectedPetId: nextSelectedPetId,
            appearance: nextAppearance
          });
          if (nextConfig) {
            setConfig(nextConfig);
          }
        }}
        onReset={async () => {
          const nextConfig = await window.desktopPet?.resetConfig();
          setConfig(nextConfig ?? { appearance: defaultAppearance });
        }}
      />
    );
  }

  return (
    <main className="pet-shell" aria-label="桌面玩偶">
      <PetScene
        selectedPetId={selectedPetId}
        appearance={appearance}
        onOpenSettings={() => window.desktopPet?.openSettings()}
      />
    </main>
  );
}
