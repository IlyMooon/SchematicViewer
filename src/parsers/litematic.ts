import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { formatBlockName } from './legacySchematic';

/**
 * Parses .litematic files (Litematica / Fabric format).
 */
export function parseLitematic(nbtData: any, filename: string): NormalizedSchematic {
  const root = nbtData;

  const metadata = root.Metadata || {};
  const regionsObj = root.Regions;

  if (!regionsObj || typeof regionsObj !== 'object') {
    throw new Error('Aucune région trouvée dans le fichier .litematic');
  }

  const regionNames = Object.keys(regionsObj);
  if (regionNames.length === 0) {
    throw new Error('Le dictionnaire des régions est vide dans le fichier .litematic');
  }

  // 1. Calculate enclosing dimensions and region offsets
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  interface RegionInfo {
    name: string;
    pos: { x: number; y: number; z: number };
    size: { x: number; y: number; z: number };
    absSize: { x: number; y: number; z: number };
    palette: string[];
    blockStates: bigint[] | BigInt64Array | null;
  }

  const parsedRegions: RegionInfo[] = [];

  for (const regName of regionNames) {
    const reg = regionsObj[regName];
    const pos = {
      x: Number(reg.Position?.x ?? 0),
      y: Number(reg.Position?.y ?? 0),
      z: Number(reg.Position?.z ?? 0),
    };
    const size = {
      x: Number(reg.Size?.x ?? 0),
      y: Number(reg.Size?.y ?? 0),
      z: Number(reg.Size?.z ?? 0),
    };
    const absSize = {
      x: Math.abs(size.x),
      y: Math.abs(size.y),
      z: Math.abs(size.z),
    };

    if (absSize.x === 0 || absSize.y === 0 || absSize.z === 0) continue;

    // Actual coordinates spanned in global space
    const rx1 = size.x > 0 ? pos.x : pos.x + size.x + 1;
    const rx2 = size.x > 0 ? pos.x + size.x : pos.x + 1;
    const ry1 = size.y > 0 ? pos.y : pos.y + size.y + 1;
    const ry2 = size.y > 0 ? pos.y + size.y : pos.y + 1;
    const rz1 = size.z > 0 ? pos.z : pos.z + size.z + 1;
    const rz2 = size.z > 0 ? pos.z + size.z : pos.z + 1;

    minX = Math.min(minX, rx1);
    minY = Math.min(minY, ry1);
    minZ = Math.min(minZ, rz1);
    maxX = Math.max(maxX, rx2);
    maxY = Math.max(maxY, ry2);
    maxZ = Math.max(maxZ, rz2);

    // Build palette for this region
    const rawPalette = reg.BlockStatePalette || [];
    const palette: string[] = [];

    for (let i = 0; i < rawPalette.length; i++) {
      const entry = rawPalette[i];
      const blockName = entry.Name ? String(entry.Name) : 'minecraft:air';
      const normalizedName = blockName.startsWith('minecraft:') ? blockName : `minecraft:${blockName}`;

      if (entry.Properties && Object.keys(entry.Properties).length > 0) {
        const propsStr = Object.entries(entry.Properties)
          .map(([k, v]) => `${k}=${v}`)
          .join(',');
        palette.push(`${normalizedName}[${propsStr}]`);
      } else {
        palette.push(normalizedName);
      }
    }

    // Fallback if palette is empty
    if (palette.length === 0) {
      palette.push('minecraft:air');
    }

    parsedRegions.push({
      name: regName,
      pos,
      size,
      absSize,
      palette,
      blockStates: reg.BlockStates || null,
    });
  }

  // Fallback dimensions if min/max couldn't be calculated
  if (minX === Infinity) {
    minX = 0; minY = 0; minZ = 0;
    maxX = Math.abs(Number(metadata.EnclosingSize?.x ?? 1));
    maxY = Math.abs(Number(metadata.EnclosingSize?.y ?? 1));
    maxZ = Math.abs(Number(metadata.EnclosingSize?.z ?? 1));
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const length = Math.max(1, maxZ - minZ);

  // 3D grid: grid[y][z][x]
  const grid: string[][][] = Array.from({ length: height }, () =>
    Array.from({ length: length }, () => new Array(width).fill('minecraft:air'))
  );

  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');

  let totalSolidBlocks = 0;

  // 2. Unpack each region into the global grid
  for (const reg of parsedRegions) {
    const { absSize, palette, blockStates, pos, size } = reg;
    const bitsPerBlock = Math.max(2, Math.ceil(Math.log2(palette.length)));
    const mask = (1n << BigInt(bitsPerBlock)) - 1n;

    const baseGX = (size.x > 0 ? pos.x : pos.x + size.x + 1) - minX;
    const baseGY = (size.y > 0 ? pos.y : pos.y + size.y + 1) - minY;
    const baseGZ = (size.z > 0 ? pos.z : pos.z + size.z + 1) - minZ;

    for (let ry = 0; ry < absSize.y; ry++) {
      for (let rz = 0; rz < absSize.z; rz++) {
        for (let rx = 0; rx < absSize.x; rx++) {
          // Litematica local volume indexing
          const blockIndex = (ry * absSize.x * absSize.z) + (rz * absSize.x) + rx;
          let paletteIdx = 0;

          if (blockStates && blockStates.length > 0) {
            const startBit = BigInt(blockIndex) * BigInt(bitsPerBlock);
            const startLongIdx = Number(startBit / 64n);
            const bitOffset = startBit % 64n;

            if (startLongIdx < blockStates.length) {
              const curLong = BigInt.asUintN(64, BigInt(blockStates[startLongIdx]));
              let val = (curLong >> bitOffset);

              if (bitOffset + BigInt(bitsPerBlock) > 64n && startLongIdx + 1 < blockStates.length) {
                const bitsInFirst = 64n - bitOffset;
                const nextLong = BigInt.asUintN(64, BigInt(blockStates[startLongIdx + 1]));
                const bitsFromSecond = BigInt(bitsPerBlock) - bitsInFirst;
                const secondMask = (1n << bitsFromSecond) - 1n;
                val = (val | ((nextLong & secondMask) << bitsInFirst)) & mask;
              } else {
                val = val & mask;
              }

              paletteIdx = Number(val);
            }
          }

          const blockState = palette[paletteIdx] || 'minecraft:air';
          const baseBlockId = blockState.split('[')[0];

          // Target grid position
          const gx = baseGX + rx;
          const gy = baseGY + ry;
          const gz = baseGZ + rz;

          if (gy >= 0 && gy < height && gz >= 0 && gz < length && gx >= 0 && gx < width) {
            grid[gy][gz][gx] = blockState;
            paletteSet.add(blockState);

            if (!isAir(baseBlockId)) {
              totalSolidBlocks++;
              counts.set(baseBlockId, (counts.get(baseBlockId) || 0) + 1);
            }
          }
        }
      }
    }
  }

  // 3. Build Bill of Materials
  const materials: BOMItem[] = Array.from(counts.entries())
    .map(([id, count]) => {
      const stacks = Math.floor(count / 64);
      const remainder = count % 64;
      const shulkers = Math.floor(stacks / 27);
      const shulkerStacksRemainder = stacks % 27;

      return {
        id,
        displayName: formatBlockName(id),
        count,
        stacks,
        remainder,
        shulkers: shulkers > 0 ? shulkers : undefined,
        shulkerStacksRemainder: shulkers > 0 ? shulkerStacksRemainder : undefined,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    name: metadata.Name || filename.replace(/\.(schematic|schem|litematic)$/i, ''),
    format: 'litematic',
    width,
    height,
    length,
    totalBlocks: width * height * length,
    totalSolidBlocks,
    grid,
    palette: Array.from(paletteSet),
    materials,
    metadata: {
      name: metadata.Name || filename,
      format: 'litematic',
      author: metadata.Author || undefined,
      description: metadata.Description || undefined,
      minecraftDataVersion: root.MinecraftDataVersion ? Number(root.MinecraftDataVersion) : undefined,
    },
  };
}

function isAir(blockId: string): boolean {
  return blockId === 'minecraft:air' || blockId === 'minecraft:cave_air' || blockId === 'minecraft:void_air';
}
