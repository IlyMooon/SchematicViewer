import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { formatBlockName } from './legacySchematic';

/**
 * Parses Vanilla Minecraft Structure Template format (.nbt / Structure Block files).
 */
export function parseVanillaStructure(nbtData: any, filename: string): NormalizedSchematic {
  const root = nbtData.Structure || nbtData;

  const rawSize = root.size || root.Size;
  if (!rawSize || !Array.isArray(rawSize) || rawSize.length < 3) {
    throw new Error('Format de structure vanilla invalide: tableau "size" manquant ou incomplet');
  }

  const width = Math.abs(Number(rawSize[0]));
  const height = Math.abs(Number(rawSize[1]));
  const length = Math.abs(Number(rawSize[2]));

  if (!width || !height || !length) {
    throw new Error('Dimensions nulles dans le fichier de structure');
  }

  // 1. Build palette
  const rawPalette = root.palette || root.Palette || root.palettes?.[0] || root.Palettes?.[0] || [];
  const paletteLookup: string[] = [];

  for (let i = 0; i < rawPalette.length; i++) {
    const entry = rawPalette[i];
    const name = entry.Name ? String(entry.Name) : 'minecraft:air';
    const normalizedName = name.startsWith('minecraft:') ? name : `minecraft:${name}`;

    if (entry.Properties && Object.keys(entry.Properties).length > 0) {
      const propsStr = Object.entries(entry.Properties)
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
      paletteLookup[i] = `${normalizedName}[${propsStr}]`;
    } else {
      paletteLookup[i] = normalizedName;
    }
  }

  if (paletteLookup.length === 0) {
    paletteLookup.push('minecraft:air');
  }

  // 2. Initialize 3D grid
  const grid: string[][][] = Array.from({ length: height }, () =>
    Array.from({ length: length }, () => new Array(width).fill('minecraft:air'))
  );

  const rawBlocks = root.blocks || root.Blocks || [];
  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');

  let totalSolidBlocks = 0;

  for (let i = 0; i < rawBlocks.length; i++) {
    const blk = rawBlocks[i];
    const pos = blk.pos || blk.Pos;
    const state = Number(blk.state ?? blk.State ?? 0);

    if (pos && Array.isArray(pos) && pos.length >= 3) {
      const x = Number(pos[0]);
      const y = Number(pos[1]);
      const z = Number(pos[2]);

      if (y >= 0 && y < height && z >= 0 && z < length && x >= 0 && x < width) {
        const fullBlockState = paletteLookup[state] || 'minecraft:air';
        const baseId = fullBlockState.split('[')[0];

        grid[y][z][x] = fullBlockState;
        paletteSet.add(fullBlockState);

        if (!isAir(baseId)) {
          totalSolidBlocks++;
          counts.set(baseId, (counts.get(baseId) || 0) + 1);
        }
      }
    }
  }

  // 3. Bill of Materials
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
    name: filename.replace(/\.(schematic|schem|litematic|nbt)$/i, ''),
    format: 'schem',
    width,
    height,
    length,
    totalBlocks: width * height * length,
    totalSolidBlocks,
    grid,
    palette: Array.from(paletteSet),
    materials,
    metadata: {
      name: filename,
      format: 'schem',
      minecraftDataVersion: root.DataVersion ? Number(root.DataVersion) : undefined,
      author: root.author || root.Author || undefined,
    },
  };
}

function isAir(blockId: string): boolean {
  return blockId === 'minecraft:air' || blockId === 'minecraft:cave_air' || blockId === 'minecraft:void_air';
}
