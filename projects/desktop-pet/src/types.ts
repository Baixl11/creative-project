import petManifest from "../pet-manifest.json";

export const defaultPetId = petManifest.defaultPetId;
export const supportedPetIds = petManifest.supportedPetIds;

export type PetAppearance = {
  lineColor: string;
  scale: number;
  lineWeight: number;
  earStyle: "floppy" | "pointy";
  tailStyle: "short" | "curly";
  animationIntensity: "calm" | "default" | "lively";
};

export type PetConfig = {
  selectedPetId?: string;
  appearance?: Partial<PetAppearance>;
  petBounds?: {
    x: number;
    y: number;
  };
};

export type PetState = "idle" | "hover" | "clicked" | "dragging" | "happy";

export type PetActionId =
  | "dog-wander"
  | "dog-bark"
  | "dog-hop-side"
  | "cat-stretch"
  | "cat-scratch-ear"
  | "rabbit-carrot"
  | "rabbit-hop"
  | "cow-moo"
  | "cow-stomp"
  | "alpaca-spit"
  | "alpaca-lie-down";

export type PetAction = {
  id: PetActionId;
  label: string;
  durationMs: number;
  bubbleText?: string;
  propText?: string;
};

export const defaultAppearance: PetAppearance = {
  lineColor: "#111827",
  scale: 1,
  lineWeight: 4,
  earStyle: "floppy",
  tailStyle: "curly",
  animationIntensity: "default"
};

export function resolveAppearance(config?: PetConfig): PetAppearance {
  return {
    ...defaultAppearance,
    ...(config?.appearance ?? {})
  };
}

export function resolveSelectedPetId(config?: PetConfig): string {
  const selectedPetId = config?.selectedPetId;
  return typeof selectedPetId === "string" && supportedPetIds.includes(selectedPetId) ? selectedPetId : defaultPetId;
}
