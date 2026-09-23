import type { NormalizedSchematic } from '../types/schematic';
import { parseNBT } from './nbt';
import { parseLegacySchematic } from './legacySchematic';
import { parseSpongeSchematic } from './spongeSchem';
import { parseLitematic } from './litematic';

/**
 * Universal schematic parser: auto-detects format and normalizes data to NormalizedSchematic.
 */
export async function parseSchematicFile(
  buffer: ArrayBuffer | Uint8Array,
  filename: string
): Promise<NormalizedSchematic> {
  const nbtData = await parseNBT(buffer);

  const root = nbtData.Schematic || nbtData;
  const ext = filename.split('.').pop()?.toLowerCase();

  // 1. Check for Litematica format
  if (ext === 'litematic' || root.Regions !== undefined) {
    return parseLitematic(root, filename);
  }

  // 2. Check for Sponge format
  if (
    ext === 'schem' ||
    root.BlockData !== undefined ||
    root.BlockPalette !== undefined ||
    (root.Palette !== undefined && root.Blocks === undefined)
  ) {
    return parseSpongeSchematic(nbtData, filename);
  }

  // 3. Check for Legacy MCEdit format
  if (ext === 'schematic' || root.Blocks !== undefined) {
    return parseLegacySchematic(nbtData, filename);
  }

  // Fallback heuristic: check fields
  if (root.Regions) {
    return parseLitematic(root, filename);
  }
  if (root.BlockData) {
    return parseSpongeSchematic(nbtData, filename);
  }
  if (root.Blocks) {
    return parseLegacySchematic(nbtData, filename);
  }

  throw new Error(
    `Format de fichier non reconnu pour "${filename}". Formats supportés: .schem, .schematic, .litematic.`
  );
}
