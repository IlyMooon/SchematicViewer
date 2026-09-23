import type { NormalizedSchematic } from '../types/schematic';
import { parseNBT } from './nbt';
import { parseLegacySchematic } from './legacySchematic';
import { parseSpongeSchematic } from './spongeSchem';
import { parseLitematic } from './litematic';
import { parseVanillaStructure } from './vanillaStructure';

/**
 * Universal schematic parser: auto-detects format from NBT structure and content,
 * supporting .schem (v1, v2, v3), .schematic (legacy), .litematic, and vanilla .nbt structure blocks.
 */
export async function parseSchematicFile(
  buffer: ArrayBuffer | Uint8Array,
  filename: string
): Promise<NormalizedSchematic> {
  const nbtData = await parseNBT(buffer);

  const root = nbtData.Schematic || nbtData;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Detect Litematica (.litematic or Regions present)
  if (root.Regions !== undefined || ext === 'litematic') {
    return parseLitematic(root, filename);
  }

  // 2. Detect Vanilla Minecraft Structure Block template (.nbt or renamed .schem)
  const isVanillaStructure =
    (root.palette !== undefined || root.palettes !== undefined) &&
    (root.blocks !== undefined || root.Blocks !== undefined) &&
    Array.isArray(root.blocks ?? root.Blocks) &&
    (root.blocks?.[0]?.pos !== undefined || root.Blocks?.[0]?.pos !== undefined);

  if (isVanillaStructure) {
    return parseVanillaStructure(nbtData, filename);
  }

  // 3. Detect Legacy MCEdit (.schematic or renamed .schem with raw byte array Blocks and Materials)
  const isRawByteArrayBlocks =
    root.Blocks &&
    (ArrayBuffer.isView(root.Blocks) || Array.isArray(root.Blocks)) &&
    typeof root.Blocks[0] === 'number';

  const isLegacySchematic =
    root.Materials !== undefined ||
    (isRawByteArrayBlocks && !root.Palette && !root.BlockPalette && !root.Blocks?.Palette);

  if (isLegacySchematic || ext === 'schematic') {
    try {
      return parseLegacySchematic(nbtData, filename);
    } catch (legacyErr) {
      console.warn('Legacy schematic parsing attempt failed, falling back to other parsers...', legacyErr);
    }
  }

  // 4. Detect Sponge Schematic (v1, v2, v3)
  const hasSpongeFeatures =
    root.BlockData !== undefined ||
    root.BlockPalette !== undefined ||
    root.Palette !== undefined ||
    root.Blocks?.Palette !== undefined ||
    root.Blocks?.Data !== undefined ||
    ext === 'schem';

  if (hasSpongeFeatures) {
    try {
      return parseSpongeSchematic(nbtData, filename);
    } catch (spongeErr) {
      // If Sponge parsing failed and file has Blocks byte array, try legacy as safety net
      if (root.Blocks) {
        try {
          return parseLegacySchematic(nbtData, filename);
        } catch {
          // ignore fallback error
        }
      }
      throw spongeErr;
    }
  }

  // 5. Final fallback attempt across all parsers
  try {
    return parseSpongeSchematic(nbtData, filename);
  } catch {
    try {
      return parseLegacySchematic(nbtData, filename);
    } catch {
      try {
        return parseLitematic(root, filename);
      } catch {
        throw new Error(
          `Impossible d'interpréter le fichier "${filename}". ` +
          `Formats supportés : .schem (Sponge v1/v2/v3), .schematic (MCEdit legacy), .litematic, et .nbt (structures vanilla).`
        );
      }
    }
  }
}
