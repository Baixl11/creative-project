import { createLinePetDefinition } from "./linePetFactory";
import { PetDefinition } from "./types";

export const lineAlpacaDefinition: PetDefinition = createLinePetDefinition({
  id: "line-alpaca",
  name: "线条羊驼",
  description: "长脖子、蓬松刘海和卷卷绒毛身体的手绘线条羊驼。",
  styleLabel: "线条风格",
  build: (api, appearance) => {
    const root = api.root;
    const face = api.group("face");
    face.position.set(0, 0.84, 0.18);

    const floppyLeftEar = api.group("floppyLeftEar");
    const floppyRightEar = api.group("floppyRightEar");
    const pointyLeftEar = api.group("pointyLeftEar");
    const pointyRightEar = api.group("pointyRightEar");
    const shortTail = api.group("shortTail");
    const curlyTail = api.group("curlyTail");
    shortTail.position.set(-1.0, -0.78, 0);
    curlyTail.position.set(-1.0, -0.78, 0);

    api.addStroke(root, [[-0.34, 1.52], [-0.56, 1.34], [-0.64, 1.02], [-0.48, 0.7]], appearance, 1.04);
    api.addStroke(root, [[0.34, 1.52], [0.56, 1.34], [0.64, 1.02], [0.48, 0.7]], appearance, 1.04);
    api.addStroke(root, [[-0.42, 0.58], [-0.48, 0.16], [-0.5, -0.22], [-0.76, -0.42]], appearance, 1);
    api.addStroke(root, [[0.42, 0.58], [0.48, 0.16], [0.5, -0.22], [0.76, -0.42]], appearance, 1);
    api.addStroke(root, [[-0.82, -0.44], [-1.04, -0.5], [-1.16, -0.72], [-1.0, -0.94], [-0.78, -0.88]], appearance, 1.04);
    api.addStroke(root, [[-0.78, -0.88], [-0.58, -1.04], [-0.28, -0.96], [-0.04, -1.08]], appearance, 1.02);
    api.addStroke(root, [[-0.04, -1.08], [0.24, -0.96], [0.56, -1.04], [0.78, -0.88]], appearance, 1.02);
    api.addStroke(root, [[0.78, -0.88], [1.0, -0.94], [1.16, -0.72], [1.04, -0.5], [0.82, -0.44]], appearance, 1.04);
    api.addStroke(root, [[-0.72, -0.92], [-0.82, -1.28], [-0.66, -1.58], [-0.44, -1.42]], appearance, 0.94);
    api.addStroke(root, [[-0.24, -1.02], [-0.3, -1.34], [-0.16, -1.58], [0.04, -1.4]], appearance, 0.94);
    api.addStroke(root, [[0.24, -1.02], [0.3, -1.34], [0.16, -1.58], [-0.04, -1.4]], appearance, 0.94);
    api.addStroke(root, [[0.72, -0.92], [0.82, -1.28], [0.66, -1.58], [0.44, -1.42]], appearance, 0.94);

    api.addStroke(root, [[-0.86, -0.34], [-1.0, -0.2], [-0.84, -0.06]], appearance, 0.54, 8);
    api.addStroke(root, [[-0.42, -0.46], [-0.56, -0.3], [-0.38, -0.18]], appearance, 0.54, 8);
    api.addStroke(root, [[0.0, -0.48], [-0.14, -0.32], [0.04, -0.2]], appearance, 0.54, 8);
    api.addStroke(root, [[0.42, -0.46], [0.56, -0.3], [0.38, -0.18]], appearance, 0.54, 8);
    api.addStroke(root, [[0.86, -0.34], [1.0, -0.2], [0.84, -0.06]], appearance, 0.54, 8);

    api.addStroke(pointyLeftEar, [[-0.42, 1.42], [-0.68, 1.96], [-0.38, 1.76]], appearance, 0.95);
    api.addStroke(pointyLeftEar, [[-0.54, 1.56], [-0.56, 1.82]], appearance, 0.54, 6);
    api.addStroke(pointyRightEar, [[0.42, 1.42], [0.68, 1.96], [0.38, 1.76]], appearance, 0.95);
    api.addStroke(pointyRightEar, [[0.54, 1.56], [0.56, 1.82]], appearance, 0.54, 6);
    api.addStroke(floppyLeftEar, [[-0.42, 1.42], [-0.74, 1.62], [-0.7, 1.24], [-0.46, 1.22]], appearance, 0.9);
    api.addStroke(floppyRightEar, [[0.42, 1.42], [0.74, 1.62], [0.7, 1.24], [0.46, 1.22]], appearance, 0.9);

    api.addStroke(shortTail, [[0, 0], [-0.26, 0.04], [-0.36, 0.2]], appearance, 0.92);
    api.addStroke(curlyTail, [[0, 0], [-0.28, 0.06], [-0.28, 0.32], [-0.04, 0.36], [0.08, 0.18]], appearance, 0.92);

    api.addStroke(face, [[-0.48, 0.56], [-0.3, 0.78], [-0.08, 0.68], [0.12, 0.82], [0.36, 0.72], [0.48, 0.5]], appearance, 0.92);
    api.addStroke(face, [[-0.5, 0.48], [-0.62, 0.18], [-0.48, -0.14]], appearance, 1);
    api.addStroke(face, [[0.5, 0.48], [0.62, 0.18], [0.48, -0.14]], appearance, 1);
    api.addStroke(face, [[-0.44, -0.26], [-0.16, -0.48], [0.18, -0.48], [0.44, -0.24]], appearance, 1);
    api.addStroke(face, [[-0.26, 0.58], [-0.4, 0.46], [-0.3, 0.34]], appearance, 0.5, 8);
    api.addStroke(face, [[0.02, 0.62], [-0.1, 0.46], [0.06, 0.34]], appearance, 0.5, 8);
    api.addStroke(face, [[0.3, 0.58], [0.14, 0.44], [0.28, 0.32]], appearance, 0.5, 8);
    api.addOval(face, -0.22, 0.16, 0.058, 0.078, appearance.lineColor, true);
    api.addOval(face, 0.22, 0.16, 0.058, 0.078, appearance.lineColor, true);
    api.addOval(face, 0, -0.04, 0.07, 0.048, appearance.lineColor, true);
    api.addStroke(face, [[-0.06, -0.12], [-0.18, -0.22], [-0.32, -0.16]], appearance, 0.54, 8);
    api.addStroke(face, [[0.06, -0.12], [0.18, -0.22], [0.32, -0.16]], appearance, 0.54, 8);
    api.addOval(face, -0.42, 0.0, 0.044, 0.03, "#f9a8d4");
    api.addOval(face, 0.42, 0.0, 0.044, 0.03, "#f9a8d4");
  }
});
