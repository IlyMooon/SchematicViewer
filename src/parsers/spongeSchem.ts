import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { formatBlockName } from './legacySchematic';

/**
 * Parses Sponge .schem files (WorldEdit v1, v2, v3).
 */
export function parseSpongeSchematic(nbtData: any, filename: string): NormalizedSchematic {
  const root = nbtData.Schematic || nbtData;

  const width = Number(root.Width);
  const height = Number(root.Height);
  const length = Number(root.Length);

  if (!width || !height || !length) {
    throw new Error('Dimensions invalides dans le fichier .schem (Width, Height ou Length manquant)');
  }

  // Find Palette: can be 'Palette' (v1/v2) or 'BlockPalette' (v3)
  const rawPalette = root.BlockPalette || root.Palette;
  if (!rawPalette) {
    throw new Error('Balise Palette / BlockPalette introuvable dans le fichier .schem');
  }

  // Invert palette: index -> blockState string
  const paletteEntries = Object.entries(rawPalette);
  const paletteLookup: string[] = [];

  for (const [blockState, indexVal] of paletteEntries) {
    const idx = Number(indexVal);
    // Normalize block state: e.g. "minecraft:oak_planks"
    const normalizedName = blockState.startsWith('minecraft:') ? blockState : `minecraft:${blockState}`;
    paletteLookup[idx] = normalizedName;
  }

  const rawBlockData = root.BlockData;
  if (!rawBlockData) {
    throw new Error('Balise BlockData introuvable dans le fichier .schem');
  }

  const blockBytes = new Uint8Array(rawBlockData.buffer || rawBlockData);
  const blockCount = width * height * length;

  // 3D grid: grid[y][z][x]
  const grid: string[][][] = Array.from({ length: height }, () =>
    Array.from({ length: length }, () => new Array(width).fill('minecraft:air'))
  );

  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');

  let totalSolidBlocks = 0;
  let offset = 0;

  // Decode varints sequentially for index = 0 to blockCount - 1
  for (let index = 0; index < blockCount && offset < blockBytes.length; index++) {
    // Read VarInt
    let paletteId = 0;
    let shift = 0;
    while (offset < blockBytes.length) {
      const byte = blockBytes[offset++];
      paletteId |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }

    // Determine coordinates according to Sponge spec: index = x + z * width + y * width * length
    const x = index % width;
    const rem = Math.floor(index / width);
    const z = rem % length;
    const y = Math.floor(rem / length);

    if (y < height && z < length && x < width) {
      const fullBlockState = paletteLookup[paletteId] || 'minecraft:air';
      // Extract base block id (without block states [facing=...]) for materials
      const baseBlockId = fullBlockState.split('[')[0];

      grid[y][z][x] = fullBlockState;
      paletteSet.add(fullBlockState);

      if (!isAir(baseBlockId)) {
        totalSolidBlocks++;
        counts.set(baseBlockId, (counts.get(baseBlockId) || 0) + 1);
      }
    }
  }

  // Build Bill of Materials
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
    name: filename.replace(/\.(schematic|schem|litematic)$/i, ''),
    format: 'schem',
    width,
    height,
    length,
    totalBlocks: blockCount,
    totalSolidBlocks,
    grid,
    palette: Array.from(paletteSet),
    materials,
    metadata: {
      name: filename,
      format: 'schem',
      minecraftDataVersion: root.DataVersion ? Number(root.DataVersion) : undefined,
      author: root.Metadata?.Author || root.Author || undefined,
      description: root.Metadata?.Description || root.Description || undefined,
    },
  };
}

function isAir(blockId: string): boolean {
  return blockId === 'minecraft:air' || blockId === 'minecraft:cave_air' || blockId === 'minecraft:void_air';
}
