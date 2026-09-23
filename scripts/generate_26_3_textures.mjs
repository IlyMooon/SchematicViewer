import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createPNG(width, height, getPixel) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawScanlines[offset++] = r;
      rawScanlines[offset++] = g;
      rawScanlines[offset++] = b;
      rawScanlines[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = 'public/textures/blocks';

// 1. Poplar Planks (Warm golden-amber autumn wood planks)
const poplarPlanksBuf = createPNG(16, 16, (x, y) => {
  const isSeparator = y === 3 || y === 7 || y === 11 || y === 15;
  if (isSeparator) return [130, 90, 30, 255]; // dark groove

  if ((y < 4 && x === 8) || (y >= 4 && y < 8 && (x === 4 || x === 12)) || (y >= 8 && y < 12 && x === 10) || (y >= 12 && x === 6)) {
    return [140, 95, 35, 255];
  }

  const noise = ((x * 13 + y * 17) % 7) - 3;
  const r = Math.min(255, Math.max(0, 218 + noise * 5));
  const g = Math.min(255, Math.max(0, 160 + noise * 5));
  const b = Math.min(255, Math.max(0, 68 + noise * 4));
  return [r, g, b, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_planks.png'), poplarPlanksBuf);

// 2. Poplar Log Side
const poplarLogBuf = createPNG(16, 16, (x, y) => {
  const isDarkLine = x === 2 || x === 7 || x === 13;
  const isLightLine = x === 4 || x === 10;
  if (isDarkLine) return [135, 120, 95, 255];
  if (isLightLine) return [195, 180, 150, 255];

  const n = ((x * 3 + y * 7) % 5) - 2;
  return [168 + n * 4, 152 + n * 4, 124 + n * 4, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_log.png'), poplarLogBuf);

// 3. Poplar Log Top
const poplarLogTopBuf = createPNG(16, 16, (x, y) => {
  const dx = x - 7.5;
  const dy = y - 7.5;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 7) return [145, 130, 105, 255];
  if (dist > 6) return [160, 145, 115, 255];

  const ring = Math.sin(dist * 2.5);
  const baseR = 210 + ring * 15;
  const baseG = 155 + ring * 12;
  const baseB = 75 + ring * 10;
  return [Math.round(baseR), Math.round(baseG), Math.round(baseB), 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_log_top.png'), poplarLogTopBuf);

// 4. Stripped Poplar Log
const strippedPoplarLogBuf = createPNG(16, 16, (x, y) => {
  const grain = ((x * 11 + y * 5) % 6) - 3;
  const isLine = x === 3 || x === 8 || x === 12;
  const baseR = isLine ? 195 : 215 + grain * 4;
  const baseG = isLine ? 145 : 165 + grain * 4;
  const baseB = isLine ? 65 : 80 + grain * 3;
  return [Math.round(baseR), Math.round(baseG), Math.round(baseB), 255];
});
fs.writeFileSync(path.join(outDir, 'stripped_poplar_log.png'), strippedPoplarLogBuf);

// 5. Stripped Poplar Log Top
const strippedPoplarLogTopBuf = createPNG(16, 16, (x, y) => {
  const dx = x - 7.5;
  const dy = y - 7.5;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ring = Math.sin(dist * 2.2);
  const baseR = 212 + ring * 12;
  const baseG = 160 + ring * 10;
  const baseB = 76 + ring * 8;
  return [Math.round(baseR), Math.round(baseG), Math.round(baseB), 255];
});
fs.writeFileSync(path.join(outDir, 'stripped_poplar_log_top.png'), strippedPoplarLogTopBuf);

// 6. Poplar Leaves
const poplarLeavesBuf = createPNG(16, 16, (x, y) => {
  const isHole = ((x * 11 + y * 13) % 9 === 0) && (x > 1 && x < 14 && y > 1 && y < 14);
  if (isHole) return [0, 0, 0, 0];

  const palette = [
    [228, 125, 32, 255],
    [240, 160, 48, 255],
    [200, 95, 20, 255],
    [248, 186, 68, 255],
  ];
  const idx = (x * 7 + y * 5 + (x ^ y)) % palette.length;
  return palette[idx];
});
fs.writeFileSync(path.join(outDir, 'poplar_leaves.png'), poplarLeavesBuf);

// 7. Poplar Shelf (Wood shelf)
const poplarShelfBuf = createPNG(16, 16, (x, y) => {
  // Top/bottom edge borders
  if (y === 0 || y === 15) return [130, 90, 30, 255];
  if (y === 1 || y === 14) return [160, 110, 40, 255];
  // Shelf divider at center
  if (y === 7 || y === 8) return [140, 95, 35, 255];
  // Poplar planks background
  const noise = ((x * 13 + y * 17) % 5) - 2;
  return [210 + noise * 4, 155 + noise * 4, 65 + noise * 3, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_shelf.png'), poplarShelfBuf);

// 8. Poplar Door (Top & Bottom)
const poplarDoorTopBuf = createPNG(16, 16, (x, y) => {
  if (x === 0 || x === 15 || y === 0) return [130, 90, 30, 255];
  // Window opening in upper half
  if (x >= 4 && x <= 11 && y >= 3 && y <= 9) {
    if (x === 4 || x === 11 || y === 3 || y === 9) return [140, 95, 35, 255];
    return [0, 0, 0, 0]; // see-through window
  }
  const noise = ((x * 7 + y * 11) % 5) - 2;
  return [215 + noise * 4, 158 + noise * 4, 68 + noise * 3, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_door_top.png'), poplarDoorTopBuf);

const poplarDoorBottomBuf = createPNG(16, 16, (x, y) => {
  if (x === 0 || x === 15 || y === 15) return [130, 90, 30, 255];
  // Door handle
  if (x === 12 && (y === 2 || y === 3)) return [70, 70, 70, 255];
  // Recessed panel
  if (x >= 3 && x <= 12 && y >= 5 && y <= 12) {
    if (x === 3 || y === 5) return [140, 95, 35, 255];
    if (x === 12 || y === 12) return [225, 170, 80, 255];
  }
  const noise = ((x * 7 + y * 11) % 5) - 2;
  return [215 + noise * 4, 158 + noise * 4, 68 + noise * 3, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_door_bottom.png'), poplarDoorBottomBuf);

// 9. Poplar Trapdoor
const poplarTrapdoorBuf = createPNG(16, 16, (x, y) => {
  if (x === 0 || x === 15 || y === 0 || y === 15 || x === 7 || x === 8 || y === 7 || y === 8) {
    return [135, 92, 32, 255]; // frame
  }
  const noise = ((x * 5 + y * 7) % 5) - 2;
  return [218 + noise * 4, 160 + noise * 4, 70 + noise * 3, 255];
});
fs.writeFileSync(path.join(outDir, 'poplar_trapdoor.png'), poplarTrapdoorBuf);

// 10. Poplar Sapling
const poplarSaplingBuf = createPNG(16, 16, (x, y) => {
  // Stem
  if ((x === 7 || x === 8) && y >= 9 && y <= 15) return [140, 115, 80, 255];
  // Amber leaves
  if (x >= 4 && x <= 11 && y >= 3 && y <= 10) {
    const pal = [
      [230, 130, 35, 255],
      [245, 165, 50, 255],
      [205, 98, 22, 255],
      [250, 190, 75, 255],
    ];
    return pal[(x * 5 + y * 7) % pal.length];
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(outDir, 'poplar_sapling.png'), poplarSaplingBuf);

// 11. Straw Bed
const strawBedBuf = createPNG(16, 16, (x, y) => {
  if (y < 4) {
    const pNoise = ((x * 7) % 3) * 4;
    return [240 - pNoise, 235 - pNoise, 210 - pNoise, 255];
  }
  const weave = (x + y) % 2 === 0 ? 15 : -15;
  return [215 + weave, 175 + weave, 65 + weave, 255];
});
fs.writeFileSync(path.join(outDir, 'straw_bed.png'), strawBedBuf);

// 12. Shelf Mushroom
const shelfMushroomBuf = createPNG(16, 16, (x, y) => {
  if (x < 2 || x > 13 || y < 3 || y > 12) return [0, 0, 0, 0];
  const ring = (x + y) % 4;
  if (ring === 0) return [145, 90, 45, 255];
  if (ring === 1) return [180, 120, 65, 255];
  if (ring === 2) return [115, 70, 30, 255];
  return [205, 145, 85, 255];
});
fs.writeFileSync(path.join(outDir, 'shelf_mushroom.png'), shelfMushroomBuf);

// 13. Red Shrub
const redShrubBuf = createPNG(16, 16, (x, y) => {
  const isBranch = (x === 7 || x === 8) && y > 10;
  if (isBranch) return [100, 70, 40, 255];
  const inFoliage = (x >= 3 && x <= 12 && y >= 2 && y <= 11);
  if (!inFoliage) return [0, 0, 0, 0];

  const rNoise = ((x * 17 + y * 13) % 4);
  const redPal = [
    [195, 40, 35, 255],
    [225, 65, 55, 255],
    [160, 28, 25, 255],
    [240, 95, 80, 255],
  ];
  return redPal[rNoise];
});
fs.writeFileSync(path.join(outDir, 'red_shrub.png'), redShrubBuf);

// 14. Cushions (26.3 Wilderness Bound) - Plush stitched tufted cushion for 16 colors
const cushionColors = {
  white: [235, 235, 235],
  orange: [230, 110, 25],
  magenta: [180, 55, 170],
  light_blue: [60, 175, 215],
  yellow: [245, 205, 45],
  lime: [110, 185, 25],
  pink: [235, 135, 165],
  gray: [65, 70, 75],
  light_gray: [145, 145, 140],
  cyan: [20, 135, 145],
  purple: [120, 45, 165],
  blue: [45, 60, 160],
  brown: [110, 70, 40],
  green: [85, 120, 35],
  red: [175, 38, 35],
  black: [25, 25, 30]
};

for (const [colName, [cr, cg, cb]] of Object.entries(cushionColors)) {
  const buf = createPNG(16, 16, (x, y) => {
    // Stitched seam border (1px from edge)
    const isEdge = x === 0 || x === 15 || y === 0 || y === 15;
    const isStitch = (x === 1 || x === 14 || y === 1 || y === 14) && ((x + y) % 3 === 0);
    // Center button tuft
    const isCenterTuft = (x >= 7 && x <= 8 && y >= 7 && y <= 8);

    if (isEdge) {
      return [Math.max(0, cr - 45), Math.max(0, cg - 45), Math.max(0, cb - 45), 255];
    }
    if (isStitch) {
      return [Math.min(255, cr + 40), Math.min(255, cg + 40), Math.min(255, cb + 40), 255];
    }
    if (isCenterTuft) {
      return [Math.max(0, cr - 50), Math.max(0, cg - 50), Math.max(0, cb - 50), 255];
    }

    // Soft plush texture variation
    const noise = ((x * 7 + y * 13) % 5) - 2;
    const r = Math.min(255, Math.max(0, cr + noise * 5));
    const g = Math.min(255, Math.max(0, cg + noise * 5));
    const b = Math.min(255, Math.max(0, cb + noise * 5));
    return [r, g, b, 255];
  });
  fs.writeFileSync(path.join(outDir, `${colName}_cushion.png`), buf);
}
// Default cushion is white cushion
fs.copyFileSync(path.join(outDir, 'white_cushion.png'), path.join(outDir, 'cushion.png'));

console.log('✅ Generated all 26.3 Wilderness Bound textures (Poplar set, flora, straw bed, 16 cushions)!');
