import { PetDefinition } from "./types";
import { createLinePetDefinition } from "./linePetFactory";

export const lineDogDefinition: PetDefinition = createLinePetDefinition({
  id: "line-dog",
  name: "线条小狗",
  description: "正面蓬松、手绘线条风的小狗。",
  styleLabel: "线条风格",
  build: (api, appearance) => {
    const root = api.root;
    const face = api.group("face");
    face.position.set(0, 0.42, 0.16);

    const floppyLeftEar = api.group("floppyLeftEar");
    const floppyRightEar = api.group("floppyRightEar");
    const pointyLeftEar = api.group("pointyLeftEar");
    const pointyRightEar = api.group("pointyRightEar");
    const shortTail = api.group("shortTail");
    const curlyTail = api.group("curlyTail");

    shortTail.position.set(-1.32, -1.22, 0);
    curlyTail.position.set(-1.32, -1.22, 0);

    api.addStroke(root, [[-0.78, 1.18], [-0.6, 1.36], [-0.32, 1.42]], appearance, 1.08);
    api.addStroke(root, [[-0.12, 1.46], [0.08, 1.55], [0.36, 1.44], [0.54, 1.28]], appearance, 1.06);
    api.addStroke(root, [[0.72, 1.24], [1.04, 1.3], [1.28, 1.08], [1.35, 0.77]], appearance, 1.03);
    api.addStroke(root, [[-1.36, -0.03], [-1.62, -0.16], [-1.78, -0.43]], appearance, 0.95);
    api.addStroke(root, [[-1.72, -0.62], [-1.46, -0.78], [-1.2, -0.88]], appearance, 0.88);
    api.addStroke(root, [[-1.15, -1.04], [-1.23, -1.32], [-1.08, -1.56], [-0.82, -1.68]], appearance, 1);
    api.addStroke(root, [[-0.66, -1.72], [-0.42, -1.68], [-0.27, -1.55]], appearance, 1.02);
    api.addStroke(root, [[1.16, -0.18], [1.42, -0.2], [1.67, -0.36], [1.79, -0.54]], appearance, 0.96);
    api.addStroke(root, [[1.68, -0.69], [1.45, -0.82], [1.14, -0.88]], appearance, 0.93);
    api.addStroke(root, [[1.03, -1.02], [1.34, -1.15], [1.47, -1.46]], appearance, 0.98);
    api.addStroke(root, [[1.36, -1.6], [1.05, -1.59], [0.82, -1.46]], appearance, 0.94);
    api.addStroke(root, [[0.58, -1.34], [0.32, -1.18], [0.08, -1.24], [-0.1, -1.48]], appearance, 1);

    api.addStroke(floppyLeftEar, [[-1.02, 1.12], [-1.34, 0.98], [-1.44, 0.65], [-1.42, 0.34]], appearance, 1.06);
    api.addStroke(floppyLeftEar, [[-1.4, 0.24], [-1.26, 0.06], [-0.98, 0.03], [-0.72, 0.13]], appearance, 1.02);
    api.addStroke(floppyLeftEar, [[-0.92, -0.03], [-0.68, -0.12], [-0.55, -0.27]], appearance, 0.86);
    api.addStroke(floppyRightEar, [[1.28, 0.95], [1.48, 0.86], [1.56, 0.54], [1.46, 0.27]], appearance, 1.05);
    api.addStroke(floppyRightEar, [[1.36, 0.16], [1.14, 0.04], [0.94, 0.1]], appearance, 1);
    api.addStroke(floppyRightEar, [[0.9, -0.12], [1.03, -0.29], [1.2, -0.35]], appearance, 0.84);
    api.addStroke(pointyLeftEar, [[-1, 1.05], [-0.82, 1.5], [-0.56, 1.12]], appearance, 1.03);
    api.addStroke(pointyLeftEar, [[-1, 1.05], [-1.28, 0.74], [-1.24, 0.35]], appearance, 0.92);
    api.addStroke(pointyRightEar, [[1.02, 1.08], [1.24, 1.5], [1.44, 1.04]], appearance, 1.03);
    api.addStroke(pointyRightEar, [[1.44, 1.04], [1.52, 0.62], [1.34, 0.28]], appearance, 0.92);

    api.addStroke(shortTail, [[0, 0], [-0.28, -0.04], [-0.38, -0.2]], appearance, 0.95);
    api.addStroke(curlyTail, [[0, 0], [-0.27, 0.03], [-0.45, -0.15], [-0.25, -0.31], [-0.02, -0.24]], appearance, 0.95);

    api.addOval(face, -0.28, 0.23, 0.065, 0.075, appearance.lineColor, true);
    api.addOval(face, 0.28, 0.23, 0.065, 0.075, appearance.lineColor, true);
    api.addOval(face, 0, 0.08, 0.095, 0.068, appearance.lineColor, true);
    api.addStroke(face, [[0, 0.02], [-0.03, -0.06], [-0.08, -0.12]], appearance, 0.66, 8);
    api.addStroke(face, [[-0.08, -0.12], [-0.22, -0.19], [-0.35, -0.08]], appearance, 0.68, 12);
    api.addStroke(face, [[0.08, -0.12], [0.22, -0.19], [0.35, -0.08]], appearance, 0.68, 12);
    api.addShape(face, (shape) => {
      shape.moveTo(-0.15, -0.17);
      shape.bezierCurveTo(-0.12, -0.42, 0, -0.52, 0.14, -0.34);
      shape.bezierCurveTo(0.24, -0.2, 0.12, -0.11, 0, -0.09);
      shape.bezierCurveTo(-0.07, -0.1, -0.12, -0.13, -0.15, -0.17);
    }, "#f4728b");
  }
});
