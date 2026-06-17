import { useEffect, useRef, useState } from "react";
import { petDefinitions } from "../pets/registry";
import { PetAppearance } from "../types";
import { PetCanvas } from "../visuals/PetCanvas";

type SettingsPanelProps = {
  selectedPetId: string;
  appearance: PetAppearance;
  onSave: (selectedPetId: string, appearance: PetAppearance) => Promise<void>;
  onReset: () => Promise<void>;
};

const colors = ["#111827", "#ffffff", "#38bdf8", "#f472b6", "#4ade80"];
const statusText = {
  auto: "自动应用",
  applying: "应用中...",
  applied: "已应用",
  failed: "应用失败",
  resetting: "重置中...",
  reset: "已重置",
  reverting: "还原中...",
  reverted: "已还原"
};

export function SettingsPanel({ selectedPetId, appearance, onSave, onReset }: SettingsPanelProps) {
  const initialDraftRef = useRef({ selectedPetId, appearance });
  const [draft, setDraft] = useState({ selectedPetId, appearance });
  const [status, setStatus] = useState(statusText.auto);
  const saveTimerRef = useRef<number | undefined>(undefined);
  const draftRef = useRef(draft);
  const onSaveRef = useRef(onSave);
  const hasQueuedSaveRef = useRef(false);
  const pendingSaveRef = useRef<Promise<void> | undefined>(undefined);
  const mountedRef = useRef(true);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (hasQueuedSaveRef.current) {
      return;
    }

    const nextDraft = { selectedPetId, appearance };
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, [selectedPetId, appearance]);

  useEffect(() => {
    mountedRef.current = true;
    const removeFlushListener = window.desktopPet?.onFlushSettings(flushQueuedSave);

    function flushOnUnload() {
      void flushQueuedSave();
    }

    window.addEventListener("beforeunload", flushOnUnload);
    return () => {
      window.removeEventListener("beforeunload", flushOnUnload);
      removeFlushListener?.();
      mountedRef.current = false;
      void flushQueuedSave();
    };
  }, []);

  function setPanelStatus(nextStatus: string) {
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  }

  function clearQueuedSave() {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = undefined;
    }
    hasQueuedSaveRef.current = false;
  }

  async function flushQueuedSave() {
    const hadQueuedSave = hasQueuedSaveRef.current;
    const nextDraft = draftRef.current;
    clearQueuedSave();
    if (hadQueuedSave) {
      await runSave(nextDraft.selectedPetId, nextDraft.appearance);
      setPanelStatus(statusText.applied);
      return;
    }

    if (pendingSaveRef.current) {
      await pendingSaveRef.current;
    }
  }

  async function runSave(nextSelectedPetId: string, nextAppearance: PetAppearance) {
    const previousSave = pendingSaveRef.current;
    const savePromise = (async () => {
      if (previousSave) {
        try {
          await previousSave;
        } catch {
          // Continue with the latest settings even if an earlier save failed.
        }
      }
      await onSaveRef.current(nextSelectedPetId, nextAppearance);
    })();
    pendingSaveRef.current = savePromise;
    try {
      await savePromise;
    } finally {
      if (pendingSaveRef.current === savePromise) {
        pendingSaveRef.current = undefined;
      }
    }
  }

  function queueSave(nextDraft: typeof draft) {
    draftRef.current = nextDraft;
    setPanelStatus(statusText.applying);
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    hasQueuedSaveRef.current = true;
    saveTimerRef.current = window.setTimeout(async () => {
      saveTimerRef.current = undefined;
      hasQueuedSaveRef.current = false;
      const queuedDraft = draftRef.current;
      try {
        await runSave(queuedDraft.selectedPetId, queuedDraft.appearance);
        setPanelStatus(statusText.applied);
      } catch {
        setPanelStatus(statusText.failed);
      }
    }, 180);
  }

  function updateDraft(nextDraft: typeof draft) {
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    queueSave(nextDraft);
  }

  function updateAppearance(nextAppearance: PetAppearance) {
    updateDraft({ ...draft, appearance: nextAppearance });
  }

  async function reset() {
    clearQueuedSave();
    setPanelStatus(statusText.resetting);
    try {
      if (pendingSaveRef.current) {
        try {
          await pendingSaveRef.current;
        } catch {
          // Reset should still be able to recover from an earlier failed save.
        }
      }
      await onReset();
      setPanelStatus(statusText.reset);
    } catch {
      setPanelStatus(statusText.failed);
    }
  }

  async function revert() {
    const initialDraft = initialDraftRef.current;
    clearQueuedSave();
    draftRef.current = initialDraft;
    setDraft(initialDraft);
    setPanelStatus(statusText.reverting);
    try {
      if (pendingSaveRef.current) {
        try {
          await pendingSaveRef.current;
        } catch {
          // Revert should still restore the initial state after an earlier failed save.
        }
      }
      await runSave(initialDraft.selectedPetId, initialDraft.appearance);
      setPanelStatus(statusText.reverted);
    } catch {
      setPanelStatus(statusText.failed);
    }
  }

  return (
    <main className="settings">
      <header className="settings__header">
        <div>
          <p className="eyebrow">桌面玩偶</p>
          <h1>宠物设置</h1>
        </div>
        <span className="status">{status}</span>
      </header>

      <section className="settings__preview" aria-label="宠物预览">
        <div className="settings__preview-canvas">
          <PetCanvas selectedPetId={draft.selectedPetId} appearance={draft.appearance} petState="happy" />
        </div>
        <div className="settings__preview-copy">
          <h2>实时预览</h2>
          <p>{petDefinitions.find((petDefinition) => petDefinition.id === draft.selectedPetId)?.description}</p>
        </div>
      </section>

      <section className="settings__section" aria-label="选择宠物">
        <h2>选择宠物</h2>
        <div className="pet-picker">
          {petDefinitions.map((petDefinition) => (
            <button
              key={petDefinition.id}
              className={draft.selectedPetId === petDefinition.id ? "pet-option pet-option--active" : "pet-option"}
              type="button"
              onClick={() => updateDraft({ ...draft, selectedPetId: petDefinition.id })}
            >
              <span className="pet-option__name">{petDefinition.name}</span>
              <span className="pet-option__meta">{petDefinition.styleLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings__section" aria-label="线条颜色">
        <h2>线条颜色</h2>
        <div className="swatches">
          {colors.map((color) => (
            <button
              key={color}
              className={draft.appearance.lineColor === color ? "swatch swatch--active" : "swatch"}
              type="button"
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => updateAppearance({ ...draft.appearance, lineColor: color })}
            />
          ))}
          <input
            aria-label="自定义颜色"
            className="color-input"
            type="color"
            value={draft.appearance.lineColor}
            onChange={(event) => updateAppearance({ ...draft.appearance, lineColor: event.target.value })}
          />
        </div>
      </section>

      <section className="settings__section" aria-label="大小与线条">
        <label>
          大小
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={draft.appearance.scale}
            onChange={(event) => updateAppearance({ ...draft.appearance, scale: Number(event.target.value) })}
          />
        </label>
        <label>
          线条粗细
          <input
            type="range"
            min="1.8"
            max="5"
            step="0.2"
            value={draft.appearance.lineWeight}
            onChange={(event) => updateAppearance({ ...draft.appearance, lineWeight: Number(event.target.value) })}
          />
        </label>
      </section>

      <section className="settings__section settings__grid" aria-label="样式">
        <label>
          耳朵
          <select
            value={draft.appearance.earStyle}
            onChange={(event) =>
              updateAppearance({ ...draft.appearance, earStyle: event.target.value as PetAppearance["earStyle"] })
            }
          >
            <option value="floppy">软耳</option>
            <option value="pointy">尖耳</option>
          </select>
        </label>
        <label>
          尾巴
          <select
            value={draft.appearance.tailStyle}
            onChange={(event) =>
              updateAppearance({ ...draft.appearance, tailStyle: event.target.value as PetAppearance["tailStyle"] })
            }
          >
            <option value="curly">卷尾</option>
            <option value="short">短尾</option>
          </select>
        </label>
        <label>
          动作强度
          <select
            value={draft.appearance.animationIntensity}
            onChange={(event) =>
              updateAppearance({
                ...draft.appearance,
                animationIntensity: event.target.value as PetAppearance["animationIntensity"]
              })
            }
          >
            <option value="calm">安静</option>
            <option value="default">默认</option>
            <option value="lively">活泼</option>
          </select>
        </label>
      </section>

      <footer className="settings__actions">
        <button type="button" className="button button--secondary" onClick={revert}>
          还原
        </button>
        <button type="button" className="button button--secondary" onClick={reset}>
          重置
        </button>
      </footer>
    </main>
  );
}
