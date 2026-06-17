import * as THREE from "three";
import { PetAction, PetAppearance, PetState } from "../types";

export type PetRenderContext = {
  appearance: PetAppearance;
};

export type PetFrameContext = {
  elapsedSeconds: number;
  appearance: PetAppearance;
  state: PetState;
  activeAction?: PetAction;
  actionElapsedSeconds: number;
};

export type PetInstance = {
  root: THREE.Group;
  updateAppearance: (appearance: PetAppearance) => void;
  updateFrame: (context: PetFrameContext) => void;
  dispose: () => void;
};

export type PetDefinition = {
  id: string;
  name: string;
  description: string;
  styleLabel: string;
  renderer: "procedural-three" | "model-three";
  statusLabel?: Partial<Record<PetState, string>>;
  create: (context: PetRenderContext) => PetInstance;
};
