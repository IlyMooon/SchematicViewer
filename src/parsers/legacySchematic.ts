import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { legacyToModernBlock } from './legacyBlockMap';

/**
 * Parses legacy MCEdit .schematic files.
 */
export function parseLegacySchematic(nbtData: any, filename: string): NormalizedSchematic {
  // Can be at root or under 'Schematic' tag
  const root = nbtData.Schematic || nbtData;

  const width = Number(root.Width);
  const height = Number(root.Height);
  const length = Number(root.Length);

  if (!width || !height || !length) {
    throw new Error('Dimensions invalides dans le fichier .schematic (Width, Height ou Length manquant)');
  }

  const rawBlocks = root.Blocks;
  const rawData = root.Data;
  const rawAdd = root.AddBlocks;

  if (!rawBlocks) {
    throw new Error('Balise "Blocks" manquante dans le fichier .schematic');
  }

  const blockCount = width * height * length;
  const blocksBytes = new Uint8Array(rawBlocks.buffer || rawBlocks);
  const dataBytes = rawData ? new Uint8Array(rawData.buffer || rawData) : null;
  const addBytes = rawAdd ? new Uint8Array(rawAdd.buffer || rawAdd) : null;

  // 3D grid: grid[y][z][x]
  const grid: string[][][] = Array.from({ length: height }, () =>
    Array.from({ length: length }, () => new Array(width).fill('minecraft:air'))
  );

  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');

  let totalSolidBlocks = 0;

  for (let y = 0; y < height; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        const index = (y * length + z) * width + x;
        if (index >= blocksBytes.length) continue;

        let blockId = blocksBytes[index] & 0xFF;

        // Check AddBlocks for IDs > 255
        if (addBytes) {
          const addIndex = Math.floor(index / 2);
          if (addIndex < addBytes.length) {
            const addByte = addBytes[addIndex];
            const nibble = (index % 2 === 0) ? (addByte & 0x0F) : ((addByte >> 4) & 0x0F);
            blockId = (nibble << 8) | blockId;
          }
        }

        const dataVal = dataBytes && index < dataBytes.length ? (dataBytes[index] & 0x0F) : 0;
        const modernId = legacyToModernBlock(blockId, dataVal);

        grid[y][z][x] = modernId;
        paletteSet.add(modernId);

        if (modernId !== 'minecraft:air') {
          totalSolidBlocks++;
          counts.set(modernId, (counts.get(modernId) || 0) + 1);
        }
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
    format: 'schematic',
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
      format: 'schematic',
      description: root.Materials ? `Materials: ${root.Materials}` : undefined,
      author: root.Author || undefined,
    },
  };
}

export function formatBlockName(id: string): string {
  const clean = id.replace(/^minecraft:/, '').replace(/\[.*\]$/, '');
  return clean
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
