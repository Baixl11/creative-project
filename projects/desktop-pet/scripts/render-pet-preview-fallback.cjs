const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const outPath = process.argv[2];
if (!outPath) {
  console.error("Usage: node scripts/render-pet-preview-fallback.cjs <out.png>");
  process.exit(1);
}

const width = 1200;
const height = 1100;
const stride = width * 4 + 1;
const pixels = Buffer.alloc(stride * height);

const colors = {
  background: [247, 248, 245, 255],
  grid: [224, 231, 221, 255],
  card: [255, 255, 255, 255],
  border: [215, 221, 210, 255],
  ink: [17, 24, 39, 255],
  muted: [100, 116, 139, 255],
  soft: [229, 231, 235, 255],
  accent: [244, 114, 139, 255]
};

for (let y = 0; y < height; y += 1) {
  pixels[y * stride] = 0;
}

function putPixel(x, y, color) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || px >= width || py < 0 || py >= height) {
    return;
  }
  const offset = py * stride + 1 + px * 4;
  pixels[offset] = color[0];
  pixels[offset + 1] = color[1];
  pixels[offset + 2] = color[2];
  pixels[offset + 3] = color[3];
}

function fillRect(x, y, rectWidth, rectHeight, color) {
  for (let py = Math.max(0, Math.round(y)); py < Math.min(height, Math.round(y + rectHeight)); py += 1) {
    for (let px = Math.max(0, Math.round(x)); px < Math.min(width, Math.round(x + rectWidth)); px += 1) {
      putPixel(px, py, color);
    }
  }
}

function drawDisc(cx, cy, radius, color) {
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  const radiusSquared = radius * radius;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSquared) {
        putPixel(x, y, color);
      }
    }
  }
}

function drawLine(x1, y1, x2, y2, color, thickness = 5) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    drawDisc(x1 + dx * t, y1 + dy * t, thickness / 2, color);
  }
}

function drawPolyline(cx, cy, scale, points, color = colors.ink, thickness = 6) {
  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1];
    const [x2, y2] = points[index];
    drawLine(cx + x1 * scale, cy + y1 * scale, cx + x2 * scale, cy + y2 * scale, color, thickness);
  }
}

function drawEllipse(cx, cy, radiusX, radiusY, color, thickness = 5) {
  let previous;
  const steps = 96;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const point = [cx + Math.cos(angle) * radiusX, cy + Math.sin(angle) * radiusY];
    if (previous) {
      drawLine(previous[0], previous[1], point[0], point[1], color, thickness);
    }
    previous = point;
  }
}

function drawPet(kind, cx, cy, scale) {
  if (kind === "cat") {
    drawPolyline(cx, cy, scale, [[-82, -6], [-78, -62], [-18, -75], [35, -54], [78, -38], [78, 22], [36, 45], [-2, 66], [-77, 55], [-92, 20], [-82, -6]]);
    drawPolyline(cx, cy, scale, [[-78, -42], [-62, -84], [-34, -54]]);
    drawPolyline(cx, cy, scale, [[-26, -58], [-2, -96], [18, -48]]);
    drawPolyline(cx, cy, scale, [[55, -26], [86, -55], [104, -30], [82, 4], [72, 20], [57, 24], [42, 16]]);
    drawDisc(cx - 42 * scale, cy - 26 * scale, 5 * scale, colors.ink);
    drawDisc(cx + 1 * scale, cy - 23 * scale, 5 * scale, colors.ink);
    drawPolyline(cx, cy, scale, [[-23, -7], [-16, 2], [-5, -8]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-62, -5], [-92, -12]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-62, 8], [-94, 10]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[18, -3], [50, -11]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[18, 10], [52, 13]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-42, 70], [-8, 48], [44, 52], [70, 70], [38, 96], [-13, 96], [-42, 70]]);
  } else if (kind === "rabbit") {
    drawPolyline(cx, cy, scale, [[-50, 8], [-62, -38], [-42, -74], [0, -74], [44, -74], [64, -36], [54, 8], [72, 24], [70, 72], [38, 90], [10, 105], [-34, 98], [-54, 70], [-72, 44], [-68, 20], [-50, 8]]);
    drawPolyline(cx, cy, scale, [[-28, -68], [-52, -112], [-18, -116], [-8, -74]]);
    drawPolyline(cx, cy, scale, [[18, -70], [32, -116], [62, -108], [40, -62]]);
    drawDisc(cx - 19 * scale, cy - 18 * scale, 5 * scale, colors.ink);
    drawDisc(cx + 20 * scale, cy - 18 * scale, 5 * scale, colors.ink);
    drawPolyline(cx, cy, scale, [[-5, 0], [0, 6], [7, 0]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-18, 22], [0, 34], [19, 22]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[72, 82], [76, 60], [100, 60], [104, 82]], colors.ink, 4);
  } else if (kind === "alpaca") {
    drawPolyline(cx, cy, scale, [[-28, -78], [-46, -94], [-30, -112], [-12, -88]]);
    drawPolyline(cx, cy, scale, [[22, -82], [40, -108], [58, -90], [34, -72]]);
    drawPolyline(cx, cy, scale, [[-38, -70], [-48, -32], [-38, 18], [-12, 28], [18, 40], [42, 24], [42, -10], [42, -44], [18, -74], [-14, -80], [-38, -70]]);
    drawPolyline(cx, cy, scale, [[-58, 28], [-86, 45], [-82, 86], [-42, 94], [-6, 104], [44, 100], [70, 74], [94, 48], [68, 18], [30, 25]]);
    drawPolyline(cx, cy, scale, [[-44, -86], [-28, -106], [-8, -88], [8, -110], [24, -84], [42, -90], [50, -68]], colors.ink, 4);
    drawDisc(cx - 14 * scale, cy - 36 * scale, 5 * scale, colors.ink);
    drawDisc(cx + 18 * scale, cy - 34 * scale, 5 * scale, colors.ink);
    drawPolyline(cx, cy, scale, [[-2, -18], [6, -10], [16, -18]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-50, 92], [-54, 112]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[-10, 100], [-12, 116]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[34, 96], [34, 114]], colors.ink, 4);
    drawPolyline(cx, cy, scale, [[66, 78], [76, 100]], colors.ink, 4);
  } else {
    drawPolyline(cx, cy, scale, [[-76, -28], [-72, -72], [-30, -88], [12, -78], [58, -68], [82, -30], [72, 22], [64, 66], [24, 90], [-22, 82], [-60, 76], [-86, 38], [-76, -28]]);
    drawPolyline(cx, cy, scale, [[-48, -70], [-62, -98]]);
    drawPolyline(cx, cy, scale, [[42, -68], [62, -96]]);
    drawPolyline(cx, cy, scale, [[-72, -42], [-104, -62], [-112, -20], [-78, -12]]);
    drawPolyline(cx, cy, scale, [[66, -42], [104, -64], [114, -20], [78, -10]]);
    drawPolyline(cx, cy, scale, [[-38, 12], [-26, -8], [30, -10], [42, 12], [52, 34], [28, 50], [0, 50], [-28, 50], [-50, 34], [-38, 12]]);
    fillRect(cx - 2 * scale, cy - 68 * scale, 28 * scale, 32 * scale, colors.soft);
    fillRect(cx - 62 * scale, cy - 10 * scale, 32 * scale, 24 * scale, colors.soft);
    drawDisc(cx - 24 * scale, cy - 24 * scale, 5 * scale, colors.ink);
    drawDisc(cx + 28 * scale, cy - 24 * scale, 5 * scale, colors.ink);
    drawDisc(cx - 14 * scale, cy + 22 * scale, 4 * scale, colors.ink);
    drawDisc(cx + 18 * scale, cy + 22 * scale, 4 * scale, colors.ink);
  }
}

function drawCard(x, y, cardWidth, cardHeight) {
  fillRect(x, y, cardWidth, cardHeight, colors.card);
  drawLine(x, y, x + cardWidth, y, colors.border, 2);
  drawLine(x + cardWidth, y, x + cardWidth, y + cardHeight, colors.border, 2);
  drawLine(x + cardWidth, y + cardHeight, x, y + cardHeight, colors.border, 2);
  drawLine(x, y + cardHeight, x, y, colors.border, 2);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function writePng(filePath) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const compressed = zlib.deflateSync(pixels, { level: 9 });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.concat([header, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]));
}

fillRect(0, 0, width, height, colors.background);
for (let x = 0; x <= width; x += 20) {
  drawLine(x, 0, x, height, colors.grid, 1);
}
for (let y = 0; y <= height; y += 20) {
  drawLine(0, y, width, y, colors.grid, 1);
}

fillRect(70, 54, 580, 10, colors.muted);
fillRect(70, 82, 720, 24, colors.ink);
fillRect(72, 124, 780, 8, colors.muted);

const lineup = [
  ["cat", 95, 170],
  ["alpaca", 360, 170],
  ["rabbit", 625, 170],
  ["cow", 890, 170]
];
for (const [kind, x, y] of lineup) {
  drawCard(x, y, 215, 215);
  drawPet(kind, x + 107, y + 92, 0.58);
  fillRect(x + 48, y + 184, 120, 8, colors.muted);
}

const cards = [
  ["cat", 70, 450],
  ["alpaca", 620, 450],
  ["rabbit", 70, 745],
  ["cow", 620, 745]
];
for (const [kind, x, y] of cards) {
  drawCard(x, y, 500, 250);
  drawPet(kind, x + 120, y + 118, 0.7);
  fillRect(x + 250, y + 58, 140, 14, colors.ink);
  fillRect(x + 250, y + 94, 210, 8, colors.muted);
  fillRect(x + 250, y + 114, 190, 8, colors.muted);
  fillRect(x + 250, y + 176, 180, 8, colors.accent);
}

writePng(outPath);
console.log(`Saved fallback pet preview to ${outPath}`);
