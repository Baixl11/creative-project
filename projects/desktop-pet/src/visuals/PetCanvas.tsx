import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getPetDefinition } from "../pets/registry";
import { PetInstance } from "../pets/types";
import { PetAction, PetAppearance, PetState } from "../types";

type PetCanvasProps = {
  selectedPetId: string;
  appearance: PetAppearance;
  petState: PetState;
  activeAction?: PetAction;
  className?: string;
  renderMode?: "three" | "svg";
};

export function PetCanvas({
  selectedPetId,
  appearance,
  petState,
  activeAction,
  className = "pet-canvas",
  renderMode = "three"
}: PetCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const petRef = useRef<PetInstance | null>(null);
  const appearanceRef = useRef(appearance);
  const stateRef = useRef(petState);
  const actionRef = useRef(activeAction);
  const actionStartedAtRef = useRef(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const petDefinition = useMemo(() => getPetDefinition(selectedPetId), [selectedPetId]);
  const forceSvg =
    webglFailed ||
    renderMode === "svg" ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("render") === "2d");

  appearanceRef.current = appearance;
  stateRef.current = petState;

  if (actionRef.current?.id !== activeAction?.id) {
    actionRef.current = activeAction;
    actionStartedAtRef.current = 0;
  }

  useEffect(() => {
    if (forceSvg) {
      return;
    }

    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.02, 7);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (error) {
      console.warn("Falling back to SVG pet renderer because WebGL could not start.", error);
      setWebglFailed(true);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const pet = petDefinition.create({ appearance: appearanceRef.current });
    petRef.current = pet;
    scene.add(pet.root);

    let elapsedSeconds = 0;
    let animationFrame = 0;

    function resize() {
      if (!mount) {
        return;
      }
      const size = Math.min(mount.clientWidth, mount.clientHeight);
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    }

    function animate() {
      elapsedSeconds += 0.016;
      if (actionRef.current && actionStartedAtRef.current === 0) {
        actionStartedAtRef.current = elapsedSeconds;
      }
      pet.updateFrame({
        elapsedSeconds,
        appearance: appearanceRef.current,
        state: stateRef.current,
        activeAction: actionRef.current,
        actionElapsedSeconds: actionRef.current ? Math.max(0, elapsedSeconds - actionStartedAtRef.current) : 0
      });
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
      scene.remove(pet.root);
      petRef.current = null;
      mount.removeChild(renderer.domElement);
      pet.dispose();
      renderer.dispose();
    };
  }, [petDefinition, forceSvg]);

  useEffect(() => {
    petRef.current?.updateAppearance(appearance);
  }, [appearance]);

  if (forceSvg) {
    return <PetCanvasSvg selectedPetId={selectedPetId} appearance={appearance} className={className} />;
  }

  return <div ref={mountRef} className={className} />;
}

function PetCanvasSvg({
  selectedPetId,
  appearance,
  className
}: {
  selectedPetId: string;
  appearance: PetAppearance;
  className: string;
}) {
  const stroke = appearance.lineColor;
  const strokeWidth = appearance.lineWeight * 2.4;
  const shared = {
    fill: "none",
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  return (
    <svg className={`${className} pet-canvas--svg`} viewBox="-120 -120 240 240" role="img" aria-label={selectedPetId}>
      {selectedPetId === "line-cat" ? (
        <>
          <path {...shared} d="M-82 -6 C-78 -62 -18 -75 35 -54 C78 -38 78 22 36 45 C-2 66 -77 55 -92 20" />
          <path {...shared} d="M-78 -42 L-62 -84 L-34 -54" />
          <path {...shared} d="M-26 -58 L-2 -96 L18 -48" />
          <path {...shared} d="M55 -26 C86 -55 104 -30 82 4 C72 20 57 24 42 16" />
          <circle cx="-42" cy="-26" r="5" fill={stroke} />
          <circle cx="1" cy="-23" r="5" fill={stroke} />
          <path {...shared} d="M-23 -7 Q-16 2 -5 -8" />
          <path {...shared} d="M-62 -5 L-92 -12 M-62 8 L-94 10 M18 -3 L50 -11 M18 10 L52 13" />
          <path {...shared} d="M-42 70 C-8 48 44 52 70 70 C38 96 -13 96 -42 70" />
          <circle cx="16" cy="72" r="4" fill={stroke} />
        </>
      ) : selectedPetId === "line-rabbit" ? (
        <>
          <path {...shared} d="M-50 8 C-62 -38 -42 -74 0 -74 C44 -74 64 -36 54 8 C72 24 70 72 38 90 C10 105 -34 98 -54 70 C-72 44 -68 20 -50 8" />
          <path {...shared} d="M-28 -68 C-52 -112 -18 -116 -8 -74" />
          <path {...shared} d="M18 -70 C32 -116 62 -108 40 -62" />
          <circle cx="-19" cy="-18" r="5" fill={stroke} />
          <circle cx="20" cy="-18" r="5" fill={stroke} />
          <path {...shared} d="M-5 0 Q0 6 7 0 M-18 22 Q0 34 19 22" />
          <path {...shared} d="M-45 62 Q-22 72 -8 58 M14 58 Q32 74 52 60" />
          <path {...shared} d="M72 82 C76 60 100 60 104 82 Z M75 62 C75 48 101 48 101 62" />
        </>
      ) : selectedPetId === "line-alpaca" ? (
        <>
          <path {...shared} d="M-28 -78 C-46 -94 -30 -112 -12 -88" />
          <path {...shared} d="M22 -82 C40 -108 58 -90 34 -72" />
          <path {...shared} d="M-38 -70 C-48 -32 -38 18 -12 28 C18 40 42 24 42 -10 C42 -44 18 -74 -14 -80" />
          <path {...shared} d="M-58 28 C-86 45 -82 86 -42 94 C-6 104 44 100 70 74 C94 48 68 18 30 25" />
          <path {...shared} d="M-44 -86 Q-28 -106 -8 -88 Q8 -110 24 -84 Q42 -90 50 -68" />
          <circle cx="-14" cy="-36" r="5" fill={stroke} />
          <circle cx="18" cy="-34" r="5" fill={stroke} />
          <path {...shared} d="M-2 -18 Q6 -10 16 -18" />
          <path {...shared} d="M-50 92 L-54 112 M-10 100 L-12 116 M34 96 L34 114 M66 78 L76 100" />
          <path {...shared} d="M-66 56 Q-50 40 -34 58 M-20 72 Q0 54 18 72 M32 58 Q52 42 68 62" />
        </>
      ) : selectedPetId === "line-cow" ? (
        <>
          <path {...shared} d="M-76 -28 C-72 -72 -30 -88 12 -78 C58 -68 82 -30 72 22 C64 66 24 90 -22 82 C-60 76 -86 38 -76 -28" />
          <path {...shared} d="M-48 -70 L-62 -98 M42 -68 L62 -96" />
          <path {...shared} d="M-72 -42 C-104 -62 -112 -20 -78 -12 M66 -42 C104 -64 114 -20 78 -10" />
          <path {...shared} d="M-38 12 C-26 -8 30 -10 42 12 C52 34 28 50 0 50 C-28 50 -50 34 -38 12" />
          <circle cx="-24" cy="-24" r="5" fill={stroke} />
          <circle cx="28" cy="-24" r="5" fill={stroke} />
          <circle cx="-14" cy="22" r="4" fill={stroke} />
          <circle cx="18" cy="22" r="4" fill={stroke} />
          <path {...shared} d="M-48 46 C-68 62 -58 84 -32 80 M34 48 C58 62 52 84 28 80" />
          <path d="M-2 -68 C20 -64 28 -46 18 -30 C0 -34 -8 -48 -2 -68Z" fill="#d1d5db" />
          <path d="M-62 -10 C-42 -18 -26 -8 -26 14 C-46 18 -62 10 -62 -10Z" fill="#e5e7eb" />
        </>
      ) : (
        <>
          <path {...shared} d="M-50 -76 C-24 -104 28 -102 54 -72 C90 -62 94 -18 68 8 C88 34 70 76 26 82 C-12 104 -58 82 -64 44 C-96 26 -92 -28 -62 -40" />
          {appearance.earStyle === "pointy" ? (
            <>
              <path {...shared} d="M-56 -62 L-74 -104 L-30 -78" />
              <path {...shared} d="M54 -62 L74 -104 L32 -76" />
            </>
          ) : (
            <>
              <path {...shared} d="M-62 -54 C-96 -56 -104 -12 -74 4" />
              <path {...shared} d="M58 -54 C92 -58 104 -16 76 4" />
            </>
          )}
          <circle cx="-24" cy="-20" r="5" fill={stroke} />
          <circle cx="24" cy="-20" r="5" fill={stroke} />
          <circle cx="0" cy="-2" r="7" fill={stroke} />
          <path {...shared} d="M0 4 Q-12 22 -30 10 M0 4 Q12 22 30 10" />
          <path d="M-10 22 C-4 44 16 42 16 22 C8 28 0 30 -10 22Z" fill="#f4728b" />
          <path {...shared} d="M-62 48 C-44 76 -12 70 0 52 C16 74 48 76 64 46" />
        </>
      )}
    </svg>
  );
}
