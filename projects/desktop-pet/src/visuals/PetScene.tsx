import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getPetActions } from "../pets/actions";
import { getPetDefinition } from "../pets/registry";
import { PetAction, PetAppearance, PetState } from "../types";
import { PetCanvas } from "./PetCanvas";

type PetSceneProps = {
  selectedPetId: string;
  appearance: PetAppearance;
  onOpenSettings: () => void;
};

const defaultStateLabel: Record<PetState, string> = {
  idle: "待机",
  hover: "好奇",
  clicked: "弹跳",
  dragging: "移动中",
  happy: "开心"
};

export function PetScene({ selectedPetId, appearance, onOpenSettings }: PetSceneProps) {
  const stageRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef<PetState>("idle");
  const dragRef = useRef({
    active: false,
    pendingBounds: false,
    startX: 0,
    startY: 0,
    windowX: 0,
    windowY: 0
  });
  const pettingRef = useRef({ startedAt: 0, lastX: 0, lastY: 0 });
  const actionIndexRef = useRef(0);
  const [petState, setPetState] = useState<PetState>("idle");
  const [activeAction, setActiveAction] = useState<PetAction | undefined>(undefined);
  const petDefinition = useMemo(() => getPetDefinition(selectedPetId), [selectedPetId]);
  const petActions = useMemo(() => getPetActions(selectedPetId), [selectedPetId]);
  const stateLabel = petDefinition.statusLabel?.[petState] ?? defaultStateLabel[petState];

  function applyState(nextState: PetState) {
    stateRef.current = nextState;
    setPetState(nextState);
  }

  useEffect(() => {
    window.desktopPet?.setMouseEventsIgnored(true);

    function updateMousePassThrough(event: MouseEvent) {
      const stage = stageRef.current;
      if (!stage || dragRef.current.active) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const radius = Math.min(rect.width, rect.height) * 0.48;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      window.desktopPet?.setMouseEventsIgnored(distance > radius);
    }

    window.addEventListener("mousemove", updateMousePassThrough);
    return () => {
      window.desktopPet?.setMouseEventsIgnored(false);
      window.removeEventListener("mousemove", updateMousePassThrough);
    };
  }, []);

  function resetToIdle(delay = 700) {
    window.setTimeout(() => {
      if (stateRef.current !== "dragging") {
        applyState("idle");
      }
    }, delay);
  }

  function cancelDrag() {
    if (!dragRef.current.active) {
      return;
    }
    dragRef.current.active = false;
    dragRef.current.pendingBounds = false;
    pettingRef.current.startedAt = 0;
    applyState("idle");
    window.desktopPet?.setMouseEventsIgnored(true);
  }

  function finishDrag(event: ReactPointerEvent<HTMLElement>) {
    if (!dragRef.current.active) {
      return;
    }
    const moved = Math.abs(event.screenX - dragRef.current.startX) + Math.abs(event.screenY - dragRef.current.startY);
    dragRef.current.active = false;
    dragRef.current.pendingBounds = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (moved < 6) {
      applyState("clicked");
      resetToIdle(550);
    } else {
      applyState("hover");
      resetToIdle(900);
    }
  }

  useEffect(() => {
    actionIndexRef.current = 0;
    setActiveAction(undefined);
    if (petActions.length === 0) {
      return undefined;
    }

    let endTimer = 0;
    let actionInterval = 0;
    const startTimer = window.setTimeout(() => {
      function triggerAction() {
        if (stateRef.current === "dragging") {
          return;
        }

        const action = petActions[actionIndexRef.current % petActions.length];
        actionIndexRef.current += 1;
        setActiveAction(action);
        window.clearTimeout(endTimer);
        endTimer = window.setTimeout(() => setActiveAction(undefined), action.durationMs);
      }

      triggerAction();
      actionInterval = window.setInterval(triggerAction, 20000);
    }, 5000);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
      if (actionInterval) {
        window.clearInterval(actionInterval);
      }
    };
  }, [petActions]);

  return (
    <section
      ref={stageRef}
      className={`pet-stage pet-stage--${petState}`}
      onPointerEnter={() => {
        window.desktopPet?.setMouseEventsIgnored(false);
        applyState("hover");
      }}
      onPointerLeave={() => {
        pettingRef.current.startedAt = 0;
        if (!dragRef.current.active) {
          applyState("idle");
          window.desktopPet?.setMouseEventsIgnored(true);
        }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        dragRef.current = {
          active: true,
          pendingBounds: true,
          startX: event.screenX,
          startY: event.screenY,
          windowX: 0,
          windowY: 0
        };
        window.desktopPet?.setMouseEventsIgnored(false);
        applyState("dragging");
        event.currentTarget.setPointerCapture(event.pointerId);
        window.desktopPet?.getWindowBounds().then((bounds) => {
          if (!dragRef.current.active) {
            return;
          }
          dragRef.current.windowX = bounds.x;
          dragRef.current.windowY = bounds.y;
          dragRef.current.pendingBounds = false;
        }).catch(cancelDrag);
      }}
      onPointerMove={(event) => {
        if (dragRef.current.active) {
          if (!dragRef.current.pendingBounds) {
            window.desktopPet?.setWindowPosition({
              x: dragRef.current.windowX + event.screenX - dragRef.current.startX,
              y: dragRef.current.windowY + event.screenY - dragRef.current.startY
            });
          }
          return;
        }

        const last = pettingRef.current;
        const distance = Math.abs(event.clientX - last.lastX) + Math.abs(event.clientY - last.lastY);
        if (distance > 6) {
          if (!last.startedAt) {
            last.startedAt = performance.now();
          }
          if (performance.now() - last.startedAt > 600) {
            applyState("happy");
          }
        }
        pettingRef.current.lastX = event.clientX;
        pettingRef.current.lastY = event.clientY;
      }}
      onPointerUp={(event) => {
        finishDrag(event);
      }}
      onPointerCancel={cancelDrag}
      onLostPointerCapture={cancelDrag}
      onDoubleClick={onOpenSettings}
      onContextMenu={(event) => {
        event.preventDefault();
        pettingRef.current.startedAt = 0;
        window.desktopPet?.setMouseEventsIgnored(false);
        window.desktopPet?.showContextMenu();
      }}
    >
      <PetCanvas selectedPetId={selectedPetId} appearance={appearance} petState={petState} activeAction={activeAction} />
      {activeAction?.bubbleText ? <div className="pet-action-bubble">{activeAction.bubbleText}</div> : null}
      {activeAction?.propText ? <div className={`pet-action-prop pet-action-prop--${activeAction.id}`}>{activeAction.propText}</div> : null}
      <div className="pet-badge">{stateLabel}</div>
    </section>
  );
}
