import * as THREE from "three";
import { PetAppearance } from "../types";
import { PetDefinition, PetFrameContext, PetInstance } from "./types";

type Point2 = [number, number];

type StrokePart = {
  mesh: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>;
  caps: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[];
  material: THREE.MeshBasicMaterial;
  points: THREE.Vector3[];
  radiusScale: number;
  segments: number;
};

type LinePetParts = {
  root: THREE.Group;
  groups: Map<string, THREE.Group>;
  strokes: StrokePart[];
  lineFillMeshes: THREE.Mesh[];
  fillMeshes: THREE.Mesh[];
};

type LinePetBuildApi = {
  root: THREE.Group;
  group: (name: string, parent?: THREE.Group) => THREE.Group;
  addStroke: (
    parent: THREE.Group,
    strokePoints: Point2[],
    appearance: PetAppearance,
    radiusScale?: number,
    segments?: number
  ) => void;
  addOval: (
    parent: THREE.Group,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    color: string,
    followsLineColor?: boolean
  ) => THREE.Mesh;
  addShape: (
    parent: THREE.Group,
    buildShape: (shape: THREE.Shape) => void,
    color: string,
    followsLineColor?: boolean
  ) => THREE.Mesh;
};

type LinePetConfig = {
  id: string;
  name: string;
  description: string;
  styleLabel: string;
  build: (api: LinePetBuildApi, appearance: PetAppearance) => void;
};

export function createLinePetDefinition(config: LinePetConfig): PetDefinition {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    styleLabel: config.styleLabel,
    renderer: "procedural-three",
    statusLabel: {
      idle: "待机",
      hover: "好奇",
      clicked: "弹跳",
      dragging: "移动中",
      happy: "开心"
    },
    create: ({ appearance }) => createLinePetInstance(config, appearance)
  };
}

function createLinePetInstance(config: LinePetConfig, appearance: PetAppearance): PetInstance {
  const pet = createLinePet(config, appearance);

  return {
    root: pet.root,
    updateAppearance: (nextAppearance) => updateLinePetAppearance(pet, nextAppearance),
    updateFrame: (context) => updateLinePetFrame(pet, context),
    dispose: () => disposeLinePet(pet)
  };
}

function createLinePet(config: LinePetConfig, appearance: PetAppearance): LinePetParts {
  const pet: LinePetParts = {
    root: new THREE.Group(),
    groups: new Map(),
    strokes: [],
    lineFillMeshes: [],
    fillMeshes: []
  };
  pet.root.scale.setScalar(appearance.scale);
  pet.root.rotation.x = -0.05;

  const api: LinePetBuildApi = {
    root: pet.root,
    group: (name, parent = pet.root) => {
      const group = new THREE.Group();
      parent.add(group);
      pet.groups.set(name, group);
      return group;
    },
    addStroke: (parent, strokePoints, nextAppearance, radiusScale = 1, segments = 18) => {
      addStroke(pet, parent, points(...strokePoints), nextAppearance, radiusScale, segments);
    },
    addOval: (parent, x, y, radiusX, radiusY, color, followsLineColor = false) =>
      addOval(pet, parent, x, y, radiusX, radiusY, color, followsLineColor),
    addShape: (parent, buildShape, color, followsLineColor = false) =>
      addShape(pet, parent, buildShape, color, followsLineColor)
  };

  config.build(api, appearance);
  updateLinePetAppearance(pet, appearance);

  return pet;
}

function updateLinePetFrame(
  pet: LinePetParts,
  { elapsedSeconds, appearance, state, activeAction, actionElapsedSeconds }: PetFrameContext
) {
  const intensity =
    appearance.animationIntensity === "calm" ? 0.55 : appearance.animationIntensity === "lively" ? 1.35 : 1;
  const bob = Math.sin(elapsedSeconds * 2.2 * intensity) * 0.045;
  const wag = Math.sin(elapsedSeconds * 8 * intensity) * (state === "happy" ? 0.32 : 0.18);
  const clickBounce = state === "clicked" ? Math.sin(elapsedSeconds * 18) * 0.12 : 0;
  const lookAround =
    state === "hover" || state === "happy"
      ? Math.sin(elapsedSeconds * 1.8) * 0.13
      : Math.sin(elapsedSeconds * 0.8) * 0.04;

  const actionMotion = getActionMotion(activeAction?.id, actionElapsedSeconds);

  pet.root.position.x = actionMotion.x;
  pet.root.position.y = bob + clickBounce + actionMotion.y;
  pet.root.scale.set(appearance.scale * actionMotion.scaleX, appearance.scale * actionMotion.scaleY, appearance.scale);
  pet.root.rotation.y = lookAround + actionMotion.rotationY;
  pet.root.rotation.x = -0.05 + Math.sin(elapsedSeconds * 1.1) * 0.015 + actionMotion.rotationX;
  pet.root.rotation.z = actionMotion.rotationZ;

  const face = pet.groups.get("face");
  if (face) {
    face.rotation.z = (state === "happy" ? Math.sin(elapsedSeconds * 7) * 0.07 : 0) + actionMotion.faceRotationZ;
    face.position.y = actionMotion.faceY;
  }

  for (const tailName of ["shortTail", "curlyTail"]) {
    const tail = pet.groups.get(tailName);
    if (tail) {
      tail.rotation.z = wag;
    }
  }
}

function updateLinePetAppearance(pet: LinePetParts, appearance: PetAppearance) {
  pet.root.scale.setScalar(appearance.scale);
  updateStrokeWeight(pet, appearance.lineWeight);
  updateLineColor(pet, appearance.lineColor);

  setVisible(pet, "floppyLeftEar", appearance.earStyle === "floppy");
  setVisible(pet, "floppyRightEar", appearance.earStyle === "floppy");
  setVisible(pet, "pointyLeftEar", appearance.earStyle === "pointy");
  setVisible(pet, "pointyRightEar", appearance.earStyle === "pointy");
  setVisible(pet, "shortTail", appearance.tailStyle === "short");
  setVisible(pet, "curlyTail", appearance.tailStyle === "curly");
}

function getActionMotion(actionId: string | undefined, seconds: number) {
  const wave = Math.sin(seconds * Math.PI * 2);
  const fastWave = Math.sin(seconds * Math.PI * 5);
  const hop = Math.max(0, Math.sin(seconds * Math.PI * 2.2));

  const motion = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    faceRotationZ: 0,
    faceY: 0
  };

  switch (actionId) {
    case "dog-wander":
      motion.x = Math.sin(seconds * Math.PI * 0.9) * 0.18;
      motion.rotationY = Math.sin(seconds * Math.PI * 0.9) * 0.18;
      motion.y = Math.abs(wave) * 0.035;
      break;
    case "dog-bark":
      motion.scaleY = 1 + Math.abs(fastWave) * 0.06;
      motion.scaleX = 1 - Math.abs(fastWave) * 0.03;
      motion.y = Math.abs(fastWave) * 0.04;
      motion.faceRotationZ = Math.sin(seconds * Math.PI * 8) * 0.06;
      break;
    case "dog-hop-side":
      motion.x = Math.sin(seconds * Math.PI * 2) * 0.22;
      motion.y = hop * 0.16;
      motion.rotationZ = Math.sin(seconds * Math.PI * 2) * 0.08;
      break;
    case "cat-stretch":
      motion.scaleX = 1.16 + Math.sin(seconds * Math.PI) * 0.04;
      motion.scaleY = 0.86;
      motion.rotationZ = -0.08 + Math.sin(seconds * Math.PI * 0.7) * 0.04;
      motion.y = -0.08;
      motion.faceY = -0.04;
      break;
    case "cat-scratch-ear":
      motion.rotationZ = Math.sin(seconds * Math.PI * 6) * 0.055;
      motion.faceRotationZ = Math.sin(seconds * Math.PI * 8) * 0.12;
      motion.y = Math.abs(fastWave) * 0.025;
      break;
    case "rabbit-carrot":
      motion.scaleY = 1 + Math.sin(seconds * Math.PI * 6) * 0.025;
      motion.faceY = -0.03 + Math.sin(seconds * Math.PI * 8) * 0.018;
      break;
    case "rabbit-hop":
      motion.y = hop * 0.3;
      motion.scaleY = 1 - hop * 0.08;
      motion.scaleX = 1 + hop * 0.05;
      motion.rotationZ = Math.sin(seconds * Math.PI * 2.2) * 0.08;
      break;
    case "cow-moo":
      motion.scaleY = 1 + Math.abs(fastWave) * 0.045;
      motion.scaleX = 1 - Math.abs(fastWave) * 0.02;
      motion.faceRotationZ = Math.sin(seconds * Math.PI * 5) * 0.05;
      break;
    case "cow-stomp":
      motion.y = Math.abs(Math.sin(seconds * Math.PI * 4)) * 0.05;
      motion.rotationZ = Math.sin(seconds * Math.PI * 4) * 0.05;
      motion.scaleY = 1 - Math.abs(Math.sin(seconds * Math.PI * 4)) * 0.025;
      break;
    case "alpaca-spit":
      motion.rotationY = Math.sin(seconds * Math.PI * 3) * 0.18;
      motion.faceRotationZ = Math.sin(seconds * Math.PI * 6) * 0.06;
      motion.faceY = Math.sin(seconds * Math.PI * 3) * 0.035;
      break;
    case "alpaca-lie-down":
      motion.y = -0.34;
      motion.scaleY = 0.62;
      motion.scaleX = 1.12;
      motion.rotationX = 0.1;
      motion.faceY = -0.08;
      break;
  }

  return motion;
}

function setVisible(pet: LinePetParts, groupName: string, visible: boolean) {
  const group = pet.groups.get(groupName);
  if (group) {
    group.visible = visible;
  }
}

function addStroke(
  pet: LinePetParts,
  parent: THREE.Group,
  strokePoints: THREE.Vector3[],
  appearance: PetAppearance,
  radiusScale = 1,
  segments = 18
) {
  const radius = lineWeightToRadius(appearance.lineWeight) * radiusScale;
  const material = new THREE.MeshBasicMaterial({ color: appearance.lineColor });
  const mesh = new THREE.Mesh(createTubeGeometry(strokePoints, radius, segments), material);
  parent.add(mesh);

  const caps = [strokePoints[0], strokePoints[strokePoints.length - 1]].map((point) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), material);
    cap.position.copy(point);
    cap.scale.setScalar(radius);
    parent.add(cap);
    return cap;
  });

  pet.strokes.push({
    mesh,
    caps,
    material,
    points: strokePoints,
    radiusScale,
    segments
  });
}

function addOval(
  pet: LinePetParts,
  parent: THREE.Group,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  followsLineColor = false
) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  mesh.position.set(x, y, 0.03);
  mesh.scale.set(radiusX, radiusY, 1);
  parent.add(mesh);
  pet.fillMeshes.push(mesh);
  if (followsLineColor) {
    pet.lineFillMeshes.push(mesh);
  }
  return mesh;
}

function addShape(
  pet: LinePetParts,
  parent: THREE.Group,
  buildShape: (shape: THREE.Shape) => void,
  color: string,
  followsLineColor = false
) {
  const shape = new THREE.Shape();
  buildShape(shape);
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
  );
  mesh.position.z = -0.01;
  parent.add(mesh);
  pet.fillMeshes.push(mesh);
  if (followsLineColor) {
    pet.lineFillMeshes.push(mesh);
  }
  return mesh;
}

function updateStrokeWeight(pet: LinePetParts, lineWeight: number) {
  const baseRadius = lineWeightToRadius(lineWeight);
  for (const stroke of pet.strokes) {
    const radius = baseRadius * stroke.radiusScale;
    stroke.mesh.geometry.dispose();
    stroke.mesh.geometry = createTubeGeometry(stroke.points, radius, stroke.segments);
    for (const cap of stroke.caps) {
      cap.scale.setScalar(radius);
    }
  }
}

function updateLineColor(pet: LinePetParts, lineColor: string) {
  for (const stroke of pet.strokes) {
    stroke.material.color.set(lineColor);
  }

  for (const mesh of pet.lineFillMeshes) {
    const material = mesh.material;
    if (Array.isArray(material)) {
      continue;
    }
    if (material instanceof THREE.MeshBasicMaterial) {
      material.color.set(lineColor);
    }
  }
}

function createTubeGeometry(strokePoints: THREE.Vector3[], radius: number, segments: number) {
  const curve =
    strokePoints.length === 2
      ? new THREE.LineCurve3(strokePoints[0], strokePoints[1])
      : new THREE.CatmullRomCurve3(strokePoints, false, "catmullrom", 0.45);
  return new THREE.TubeGeometry(curve, segments, radius, 10, false);
}

function lineWeightToRadius(lineWeight: number) {
  return 0.014 + lineWeight * 0.01;
}

function points(...coords: Point2[]) {
  return coords.map(([x, y]) => new THREE.Vector3(x, y, 0));
}

function disposeLinePet(pet: LinePetParts) {
  for (const stroke of pet.strokes) {
    stroke.mesh.geometry.dispose();
    stroke.material.dispose();
    for (const cap of stroke.caps) {
      cap.geometry.dispose();
    }
  }

  for (const mesh of pet.fillMeshes) {
    mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else {
      material.dispose();
    }
  }
}
