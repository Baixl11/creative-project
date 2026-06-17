import { createLinePetDefinition } from "./linePetFactory";
import { PetDefinition } from "./types";

export const lineCowDefinition: PetDefinition = createLinePetDefinition({
  id: "line-cow",
  name: "线条小牛",
  description: "外扩圆耳、短角、宽鼻口和奶牛斑纹更清楚的手绘线条小牛。",
  styleLabel: "线条风格",
  build: (api, appearance) => {
    const root = api.root;
    const face = api.group("face");
    face.position.set(0, 0.34, 0.18);

    const floppyLeftEar = api.group("floppyLeftEar");
    const floppyRightEar = api.group("floppyRightEar");
    const pointyLeftEar = api.group("pointyLeftEar");
    const pointyRightEar = api.group("pointyRightEar");
    const shortTail = api.group("shortTail");
    const curlyTail = api.group("curlyTail");
    shortTail.position.set(-1.36, -0.86, 0);
    curlyTail.position.set(-1.36, -0.86, 0);

    api.addStroke(root, [[-0.82, 1.08], [-0.44, 1.3], [0, 1.34], [0.44, 1.3], [0.82, 1.08]], appearance, 1.08);
    api.addStroke(root, [[1.04, 0.88], [1.32, 0.5], [1.36, -0.06], [1.12, -0.58]], appearance, 1.05);
    api.addStroke(root, [[0.98, -0.82], [0.62, -1.06], [0.5, -1.44], [0.78, -1.56]], appearance, 0.96);
    api.addStroke(root, [[0.24, -1.16], [0, -1.34], [-0.24, -1.16]], appearance, 0.9);
    api.addStroke(root, [[-0.98, -0.82], [-0.62, -1.06], [-0.5, -1.44], [-0.78, -1.56]], appearance, 0.96);
    api.addStroke(root, [[-1.12, -0.58], [-1.36, -0.06], [-1.32, 0.5], [-1.04, 0.88]], appearance, 1.05);

    api.addStroke(root, [[-0.34, 1.16], [-0.58, 1.58], [-0.18, 1.48]], appearance, 0.92);
    api.addStroke(root, [[0.34, 1.16], [0.58, 1.58], [0.18, 1.48]], appearance, 0.92);
    api.addStroke(root, [[-0.1, 1.22], [-0.02, 1.02], [0.1, 1.22]], appearance, 0.46, 6);

    api.addStroke(floppyLeftEar, [[-0.86, 0.92], [-1.28, 0.9], [-1.5, 0.62], [-1.32, 0.34], [-1.0, 0.42]], appearance, 1.06);
    api.addStroke(floppyLeftEar, [[-1.26, 0.74], [-1.24, 0.48]], appearance, 0.58);
    api.addStroke(floppyRightEar, [[0.86, 0.92], [1.28, 0.9], [1.5, 0.62], [1.32, 0.34], [1.0, 0.42]], appearance, 1.06);
    api.addStroke(floppyRightEar, [[1.26, 0.74], [1.24, 0.48]], appearance, 0.58);
    api.addStroke(pointyLeftEar, [[-0.76, 0.98], [-1.12, 1.12], [-0.98, 0.72]], appearance, 0.94);
    api.addStroke(pointyRightEar, [[0.76, 0.98], [1.12, 1.12], [0.98, 0.72]], appearance, 0.94);

    api.addShape(root, (shape) => {
      shape.moveTo(-0.76, 0.84);
      shape.bezierCurveTo(-0.42, 1.06, -0.14, 0.9, 0.0, 0.6);
      shape.bezierCurveTo(-0.24, 0.38, -0.56, 0.4, -0.84, 0.58);
      shape.bezierCurveTo(-0.9, 0.68, -0.86, 0.78, -0.76, 0.84);
    }, "#111827");
    api.addShape(root, (shape) => {
      shape.moveTo(0.42, 1.0);
      shape.bezierCurveTo(0.82, 0.94, 1.02, 0.62, 0.9, 0.28);
      shape.bezierCurveTo(0.58, 0.22, 0.34, 0.52, 0.42, 1.0);
    }, "#111827");
    api.addShape(root, (shape) => {
      shape.moveTo(-0.42, -0.62);
      shape.bezierCurveTo(-0.1, -0.9, 0.38, -0.9, 0.76, -0.56);
      shape.bezierCurveTo(0.36, -0.32, -0.1, -0.34, -0.42, -0.62);
    }, "#d6d3d1");

    api.addStroke(shortTail, [[0, 0], [-0.34, 0.0], [-0.42, 0.3]], appearance, 0.96);
    api.addStroke(curlyTail, [[0, 0], [-0.3, 0.06], [-0.38, 0.34], [-0.12, 0.44], [0.08, 0.26]], appearance, 0.96);

    api.addStroke(face, [[-0.44, 0.28], [-0.24, 0.42], [-0.06, 0.36]], appearance, 0.56, 8);
    api.addStroke(face, [[0.44, 0.28], [0.24, 0.42], [0.06, 0.36]], appearance, 0.56, 8);
    api.addOval(face, -0.24, 0.18, 0.064, 0.08, appearance.lineColor, true);
    api.addOval(face, 0.24, 0.18, 0.064, 0.08, appearance.lineColor, true);
    api.addStroke(face, [[-0.1, 0.02], [0, -0.08], [0.1, 0.02]], appearance, 0.46, 8);
    api.addShape(face, (shape) => {
      shape.moveTo(-0.54, -0.06);
      shape.bezierCurveTo(-0.36, -0.42, 0.36, -0.42, 0.54, -0.06);
      shape.bezierCurveTo(0.38, 0.18, -0.38, 0.18, -0.54, -0.06);
    }, "#f4d7d8");
    api.addStroke(face, [[-0.54, -0.06], [-0.36, -0.42], [0.36, -0.42], [0.54, -0.06]], appearance, 0.86, 18);
    api.addOval(face, -0.18, -0.1, 0.048, 0.034, appearance.lineColor, true);
    api.addOval(face, 0.18, -0.1, 0.048, 0.034, appearance.lineColor, true);
    api.addStroke(face, [[-0.06, -0.3], [-0.18, -0.4], [-0.32, -0.3]], appearance, 0.5, 8);
    api.addStroke(face, [[0.06, -0.3], [0.18, -0.4], [0.32, -0.3]], appearance, 0.5, 8);
    api.addOval(face, -0.5, -0.02, 0.052, 0.034, "#f9a8d4");
    api.addOval(face, 0.5, -0.02, 0.052, 0.034, "#f9a8d4");
  }
});
