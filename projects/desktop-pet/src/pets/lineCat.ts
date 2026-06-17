import { createLinePetDefinition } from "./linePetFactory";
import { PetDefinition } from "./types";

export const lineCatDefinition: PetDefinition = createLinePetDefinition({
  id: "line-cat",
  name: "线条小猫",
  description: "趴在小鱼旁、翘尾巴、圆脸短腿的手绘线条小猫。",
  styleLabel: "线条风格",
  build: (api, appearance) => {
    const root = api.root;
    const face = api.group("face");
    face.position.set(-0.54, 0.52, 0.18);

    const floppyLeftEar = api.group("floppyLeftEar");
    const floppyRightEar = api.group("floppyRightEar");
    const pointyLeftEar = api.group("pointyLeftEar");
    const pointyRightEar = api.group("pointyRightEar");
    const shortTail = api.group("shortTail");
    const curlyTail = api.group("curlyTail");
    shortTail.position.set(1.18, -0.1, 0);
    curlyTail.position.set(1.18, -0.1, 0);

    api.addStroke(root, [[-1.08, 0.7], [-0.94, 1.02], [-0.56, 1.08], [-0.2, 0.94]], appearance, 1.08);
    api.addStroke(root, [[-0.1, 0.82], [0.22, 0.94], [0.62, 0.84], [0.88, 0.56]], appearance, 1.02);
    api.addStroke(root, [[0.98, 0.38], [1.08, -0.06], [0.94, -0.46], [0.62, -0.64]], appearance, 1);
    api.addStroke(root, [[0.42, -0.72], [-0.04, -0.68], [-0.36, -0.48]], appearance, 0.96);
    api.addStroke(root, [[-0.58, -0.54], [-0.88, -0.62], [-1.1, -0.48], [-1.04, -0.28]], appearance, 0.9);
    api.addStroke(root, [[-0.95, -0.1], [-1.24, -0.08], [-1.38, 0.12], [-1.24, 0.42]], appearance, 1);

    api.addStroke(pointyLeftEar, [[-1.0, 0.78], [-0.92, 1.35], [-0.62, 1.02]], appearance, 1.05);
    api.addStroke(pointyLeftEar, [[-0.86, 0.98], [-0.77, 1.14], [-0.68, 0.98]], appearance, 0.66);
    api.addStroke(pointyRightEar, [[-0.32, 1.0], [-0.04, 1.42], [0.14, 0.88]], appearance, 1.05);
    api.addStroke(pointyRightEar, [[-0.2, 1.08], [-0.04, 1.2], [0.02, 0.98]], appearance, 0.66);
    api.addStroke(floppyLeftEar, [[-0.98, 0.74], [-1.24, 0.96], [-1.22, 0.64], [-1.0, 0.52]], appearance, 0.92);
    api.addStroke(floppyRightEar, [[-0.28, 0.94], [-0.12, 1.2], [0.12, 1.04], [0.06, 0.78]], appearance, 0.92);

    api.addStroke(shortTail, [[0, 0], [0.28, 0.44], [0.32, 0.86]], appearance, 1.03);
    api.addStroke(curlyTail, [[0, 0], [0.3, 0.36], [0.36, 0.82], [0.18, 1.12], [0.02, 0.88]], appearance, 1.03);

    api.addShape(root, (shape) => {
      shape.moveTo(-0.82, 0.94);
      shape.bezierCurveTo(-0.48, 1.12, -0.2, 1.02, 0.02, 0.78);
      shape.bezierCurveTo(-0.18, 0.58, -0.52, 0.56, -0.9, 0.72);
      shape.bezierCurveTo(-0.94, 0.82, -0.9, 0.9, -0.82, 0.94);
    }, "#d6d3d1");
    api.addShape(root, (shape) => {
      shape.moveTo(0.5, 0.62);
      shape.bezierCurveTo(0.82, 0.54, 0.94, 0.22, 0.82, -0.18);
      shape.bezierCurveTo(0.56, -0.08, 0.44, 0.22, 0.5, 0.62);
    }, "#ede9e3");

    api.addShape(root, (shape) => {
      shape.moveTo(-0.58, -1.02);
      shape.bezierCurveTo(-0.26, -0.68, 0.24, -0.58, 0.72, -0.76);
      shape.bezierCurveTo(1.0, -0.9, 1.06, -1.16, 0.8, -1.34);
      shape.bezierCurveTo(0.3, -1.66, -0.36, -1.52, -0.74, -1.18);
      shape.bezierCurveTo(-0.76, -1.1, -0.7, -1.04, -0.58, -1.02);
    }, "#f1e3be");
    api.addStroke(root, [[-0.58, -1.02], [-0.26, -0.68], [0.24, -0.58], [0.72, -0.76]], appearance, 0.78, 16);
    api.addStroke(root, [[0.72, -0.76], [1.0, -0.9], [1.06, -1.16], [0.8, -1.34]], appearance, 0.78, 16);
    api.addStroke(root, [[0.8, -1.34], [0.3, -1.66], [-0.36, -1.52], [-0.74, -1.18]], appearance, 0.78, 16);
    api.addStroke(root, [[-0.74, -1.18], [-0.76, -1.1], [-0.58, -1.02]], appearance, 0.78, 12);
    api.addStroke(root, [[-0.24, -1.0], [-0.18, -1.34]], appearance, 0.52, 8);
    api.addStroke(root, [[0.02, -0.9], [0.08, -1.36]], appearance, 0.52, 8);
    api.addStroke(root, [[0.28, -0.86], [0.36, -1.2]], appearance, 0.52, 8);
    api.addOval(root, -0.08, -1.12, 0.042, 0.052, appearance.lineColor, true);
    api.addOval(root, 0.22, -1.08, 0.036, 0.046, appearance.lineColor, true);
    api.addOval(root, 0.5, -1.18, 0.04, 0.05, appearance.lineColor, true);

    api.addOval(face, -0.25, 0.1, 0.064, 0.078, appearance.lineColor, true);
    api.addOval(face, 0.18, 0.04, 0.064, 0.078, appearance.lineColor, true);
    api.addOval(face, -0.04, -0.16, 0.07, 0.046, appearance.lineColor, true);
    api.addStroke(face, [[-0.08, -0.24], [-0.2, -0.32], [-0.34, -0.24]], appearance, 0.52, 8);
    api.addStroke(face, [[0, -0.24], [0.14, -0.32], [0.26, -0.22]], appearance, 0.52, 8);
    api.addStroke(face, [[-0.5, -0.08], [-0.76, -0.04]], appearance, 0.52, 6);
    api.addStroke(face, [[-0.5, -0.2], [-0.78, -0.24]], appearance, 0.52, 6);
    api.addStroke(face, [[0.42, -0.1], [0.68, -0.04]], appearance, 0.52, 6);
    api.addStroke(face, [[0.42, -0.22], [0.7, -0.28]], appearance, 0.52, 6);
  }
});
