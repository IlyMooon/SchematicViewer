import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { formatBlockName } from './legacySchematic';

/**
 * Parses Sponge .schem files (supporting Sponge v1, v2, v3 and other variants).
 */
export function parseSpongeSchematic(nbtData: any, filename: string): NormalizedSchematic {
  const root = nbtData.Schematic || nbtData;

  // 1. Resolve dimensions (supporting root, nested Blocks, or lowercase)
  let width = Number(root.Width ?? root.width ?? root.Blocks?.Width ?? root.Blocks?.width);
  let height = Number(root.Height ?? root.height ?? root.Blocks?.Height ?? root.Blocks?.height);
  let length = Number(root.Length ?? root.length ?? root.Blocks?.Length ?? root.Blocks?.length);

  // Check if size is an array [x, y, z]
  if ((!width || !height || !length) && (root.size || root.Size)) {
    const sizeArr = root.size || root.Size;
    if (Array.isArray(sizeArr) && sizeArr.length >= 3) {
      width = Math.abs(Number(sizeArr[0]));
      height = Math.abs(Number(sizeArr[1]));
      length = Math.abs(Number(sizeArr[2]));
    }
  }

  // 2. Locate Palette (supporting Sponge v1/v2 top-level, Sponge v3 nested in Blocks, case variations)
  let rawPalette: any =
    root.BlockPalette ??
    root.Palette ??
    root.blockPalette ??
    root.palette ??
    root.block_palette ??
    root.Blocks?.Palette ??
    root.Blocks?.BlockPalette ??
    root.Blocks?.palette ??
    root.Blocks?.blockPalette ??
    root.Blocks?.block_palette ??
    root.Schematic?.Palette ??
    root.Schematic?.BlockPalette ??
    root.Schematic?.Blocks?.Palette;

  // 3. Locate BlockData (supporting Sponge v1/v2 top-level, Sponge v3 nested in Blocks.Data)
  let rawBlockData: any =
    root.BlockData ??
    root.blockData ??
    root.block_data ??
    root.Blocks?.Data ??
    root.Blocks?.data ??
    root.Blocks?.BlockData ??
    root.Blocks?.blockData ??
    root.Data ??
    root.data ??
    root.Schematic?.BlockData ??
    root.Schematic?.Blocks?.Data;

  // 4. Deep search fallback if palette or data were not found in standard paths
  if (!rawPalette || !rawBlockData) {
    const searchTarget = root.Blocks || root;
    for (const key of Object.keys(searchTarget)) {
      const val = searchTarget[key];
      if (!val) continue;

      // Detect palette
      if (!rawPalette && typeof val === 'object' && !ArrayBuffer.isView(val)) {
        if (Array.isArray(val) && val.length > 0 && (val[0]?.Name || typeof val[0] === 'string')) {
          rawPalette = val;
        } else {
          const keys = Object.keys(val);
          if (keys.some(k => k.includes(':') || typeof val[k] === 'number')) {
            rawPalette = val;
          }
        }
      }

      // Detect block data
      if (!rawBlockData && (ArrayBuffer.isView(val) || Array.isArray(val))) {
        if (key.toLowerCase().includes('data') || key.toLowerCase().includes('block')) {
          rawBlockData = val;
        }
      }
    }
  }

  if (!rawPalette) {
    throw new Error(
      `Balise Palette / BlockPalette introuvable dans le fichier "${filename}". ` +
      `Vérifiez que le fichier est un schematic Sponge valide (v1, v2 ou v3).`
    );
  }

  // 5. Invert and normalize palette: index -> blockState string
  const paletteLookup: string[] = [];

  if (Array.isArray(rawPalette)) {
    // Palette is a list: [{ Name: "minecraft:stone", Properties: ... }] or ["minecraft:stone", ...]
    for (let i = 0; i < rawPalette.length; i++) {
      const entry = rawPalette[i];
      if (typeof entry === 'string') {
        paletteLookup[i] = entry.startsWith('minecraft:') ? entry : `minecraft:${entry}`;
      } else if (entry && typeof entry === 'object') {
        const name = entry.Name ? String(entry.Name) : 'minecraft:air';
        const norm = name.startsWith('minecraft:') ? name : `minecraft:${name}`;
        if (entry.Properties && Object.keys(entry.Properties).length > 0) {
          const props = Object.entries(entry.Properties).map(([k, v]) => `${k}=${v}`).join(',');
          paletteLookup[i] = `${norm}[${props}]`;
        } else {
          paletteLookup[i] = norm;
        }
      }
    }
  } else if (typeof rawPalette === 'object') {
    // Palette is a compound dictionary: { "minecraft:stone": 0 } or { "0": "minecraft:stone" }
    for (const [key, val] of Object.entries(rawPalette)) {
      if (typeof val === 'number' || !isNaN(Number(val))) {
        const idx = Number(val);
        const norm = key.startsWith('minecraft:') ? key : `minecraft:${key}`;
        paletteLookup[idx] = norm;
      } else if (typeof val === 'string') {
        const idx = Number(key);
        const norm = val.startsWith('minecraft:') ? val : `minecraft:${val}`;
        paletteLookup[idx] = norm;
      }
    }
  }

  if (paletteLookup.length === 0) {
    paletteLookup.push('minecraft:air');
  }

  // Ensure dimensions are valid
  if (!width || !height || !length) {
    throw new Error('Dimensions invalides dans le fichier .schem (Width, Height ou Length manquant ou nul)');
  }

  const blockCount = width * height * length;
  const blockBytes = rawBlockData
    ? (rawBlockData instanceof Uint8Array ? rawBlockData : new Uint8Array(rawBlockData.buffer || rawBlockData))
    : new Uint8Array(0);

  // 6. Build 3D grid: grid[y][z][x]
  const grid: string[][][] = Array.from({ length: height }, () =>
    Array.from({ length: length }, () => new Array(width).fill('minecraft:air'))
  );

  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');

  let totalSolidBlocks = 0;
  let offset = 0;

  // Check if blockData is byte-sized raw IDs or VarInt stream
  const isDirectByteArray = blockBytes.length === blockCount && rawPalette && Object.keys(rawPalette).length <= 128;

  for (let index = 0; index < blockCount; index++) {
    let paletteId = 0;

    if (offset < blockBytes.length) {
      if (isDirectByteArray) {
        paletteId = blockBytes[offset++];
      } else {
        // Standard VarInt decoding
        let shift = 0;
        while (offset < blockBytes.length) {
          const byte = blockBytes[offset++];
          paletteId |= (byte & 0x7F) << shift;
          if ((byte & 0x80) === 0) break;
          shift += 7;
        }
      }
    }

    // Determine coordinates according to Sponge spec: index = x + z * width + y * width * length
    const x = index % width;
    const rem = Math.floor(index / width);
    const z = rem % length;
    const y = Math.floor(rem / length);

    if (y < height && z < length && x < width) {
      const fullBlockState = paletteLookup[paletteId] || 'minecraft:air';
      const baseBlockId = fullBlockState.split('[')[0];

      grid[y][z][x] = fullBlockState;
      paletteSet.add(fullBlockState);

      if (!isAir(baseBlockId)) {
        totalSolidBlocks++;
        counts.set(baseBlockId, (counts.get(baseBlockId) || 0) + 1);
      }
    }
  }

  // 7. Bill of Materials
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
