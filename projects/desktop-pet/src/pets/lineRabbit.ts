import { createLinePetDefinition } from "./linePetFactory";
import { PetDefinition } from "./types";

export const lineRabbitDefinition: PetDefinition = createLinePetDefinition({
  id: "line-rabbit",
  name: "线条小兔",
  description: "圆滚滚坐姿、修长双耳和小蘑菇点缀的手绘线条小兔。",
  styleLabel: "线条风格",
  build: (api, appearance) => {
    const root = api.root;
    const face = api.group("face");
    face.position.set(0.02, 0.34, 0.18);

    const floppyLeftEar = api.group("floppyLeftEar");
    const floppyRightEar = api.group("floppyRightEar");
    const pointyLeftEar = api.group("pointyLeftEar");
    const pointyRightEar = api.group("pointyRightEar");
    const shortTail = api.group("shortTail");
    const curlyTail = api.group("curlyTail");
    shortTail.position.set(-0.92, -0.52, 0);
    curlyTail.position.set(-0.92, -0.52, 0);

    api.addStroke(root, [[-0.56, 0.96], [-0.2, 1.12], [0.28, 1.08], [0.62, 0.84]], appearance, 1.08);
    api.addStroke(root, [[0.76, 0.64], [0.98, 0.2], [0.98, -0.38], [0.72, -0.88]], appearance, 1.04);
    api.addStroke(root, [[0.56, -1.12], [0.22, -1.34], [-0.16, -1.34], [-0.52, -1.12]], appearance, 1.04);
    api.addStroke(root, [[-0.74, -0.86], [-0.98, -0.36], [-0.98, 0.2], [-0.74, 0.64]], appearance, 1.04);
    api.addStroke(root, [[-0.28, -0.26], [-0.38, -0.66], [-0.28, -0.94]], appearance, 0.62, 8);
    api.addStroke(root, [[0.28, -0.26], [0.38, -0.66], [0.28, -0.94]], appearance, 0.62, 8);
    api.addStroke(root, [[-0.48, -1.0], [-0.76, -1.22], [-0.42, -1.28]], appearance, 0.72, 8);
    api.addStroke(root, [[0.48, -1.0], [0.76, -1.22], [0.42, -1.28]], appearance, 0.72, 8);
    api.addStroke(root, [[-0.32, -0.9], [-0.02, -0.78], [0.34, -0.92]], appearance, 0.52, 8);

    api.addStroke(pointyLeftEar, [[-0.34, 1.0], [-0.58, 1.62], [-0.54, 2.26], [-0.12, 1.48]], appearance, 1.05);
    api.addStroke(pointyLeftEar, [[-0.38, 1.16], [-0.4, 1.72], [-0.3, 2.02]], appearance, 0.66);
    api.addStroke(pointyRightEar, [[0.12, 1.02], [0.34, 1.7], [0.26, 2.34], [0.0, 1.52]], appearance, 1.05);
    api.addStroke(pointyRightEar, [[0.14, 1.18], [0.16, 1.8], [0.1, 2.08]], appearance, 0.66);
    api.addStroke(floppyLeftEar, [[-0.34, 1.0], [-0.82, 1.28], [-0.78, 0.72], [-0.46, 0.52]], appearance, 0.96);
    api.addStroke(floppyLeftEar, [[-0.62, 0.98], [-0.58, 0.68]], appearance, 0.62);
    api.addStroke(floppyRightEar, [[0.12, 1.02], [0.62, 1.28], [0.68, 0.72], [0.32, 0.5]], appearance, 0.96);
    api.addStroke(floppyRightEar, [[0.44, 0.98], [0.44, 0.66]], appearance, 0.62);

    api.addStroke(shortTail, [[0, 0], [-0.24, 0.1], [-0.3, 0.32], [-0.08, 0.42]], appearance, 0.92);
    api.addStroke(curlyTail, [[0, 0], [-0.26, 0.12], [-0.34, 0.36], [-0.08, 0.5], [0.12, 0.28]], appearance, 0.92);

    api.addStroke(root, [[-1.3, -1.28], [-1.14, -1.18], [-1.0, -1.28]], appearance, 0.44, 6);
    api.addStroke(root, [[1.0, -1.28], [1.18, -1.16], [1.36, -1.28]], appearance, 0.44, 6);
    api.addStroke(root, [[-1.2, -1.22], [-1.26, -0.98]], appearance, 0.4, 6);
    api.addStroke(root, [[1.18, -1.22], [1.28, -0.98]], appearance, 0.4, 6);

    api.addStroke(root, [[-1.48, -1.28], [-1.48, -1.06]], appearance, 0.4, 6);
    api.addShape(root, (shape) => {
      shape.moveTo(-1.68, -1.06);
      shape.bezierCurveTo(-1.58, -1.26, -1.36, -1.26, -1.24, -1.06);
      shape.lineTo(-1.68, -1.06);
    }, "#f8d7da");
    api.addOval(root, -1.58, -1.12, 0.032, 0.038, appearance.lineColor, true);
    api.addOval(root, -1.36, -1.12, 0.032, 0.038, appearance.lineColor, true);

    api.addOval(face, -0.2, 0.14, 0.056, 0.07, appearance.lineColor, true);
    api.addOval(face, 0.22, 0.14, 0.056, 0.07, appearance.lineColor, true);
    api.addOval(face, 0.02, -0.06, 0.044, 0.034, appearance.lineColor, true);
    api.addOval(face, -0.4, -0.04, 0.052, 0.03, "#f9a8d4");
    api.addOval(face, 0.42, -0.04, 0.052, 0.03, "#f9a8d4");
    api.addStroke(face, [[-0.02, -0.12], [-0.12, -0.22], [-0.24, -0.16]], appearance, 0.5, 8);
    api.addStroke(face, [[0.06, -0.12], [0.16, -0.22], [0.28, -0.16]], appearance, 0.5, 8);
    api.addStroke(face, [[-0.46, 0.02], [-0.66, 0.08]], appearance, 0.42, 6);
    api.addStroke(face, [[0.48, 0.02], [0.68, 0.08]], appearance, 0.42, 6);
  }
});
