import fs from 'node:fs';

const map = JSON.parse(fs.readFileSync('scripts/generated_map.json', 'utf8'));

const tsCode = `/**
 * Exhaustive mapping of Minecraft 1.20+ block identifiers to texture filenames.
 * Auto-generated from PrismarineJS/minecraft-assets.
 */

export const EXACT_TEXTURE_MAP: Record<string, string> = ${JSON.stringify(map, null, 2)};

/**
 * Resolves any block ID (including block states and complex variants)
 * to its corresponding texture file name.
 */
export function resolveBlockTexture(blockId: string): string {
  // 1. Clean block ID (remove 'minecraft:' and bracketed properties '[facing=...]')
  const clean = blockId.split('[')[0].replace(/^minecraft:/, '');

  // 2. Direct lookup in exact mapping
  if (EXACT_TEXTURE_MAP[clean]) {
    return EXACT_TEXTURE_MAP[clean];
  }

  // 3. Morphological rules for block variants:

  // Stairs -> Base material
  if (clean.endsWith('_stairs')) {
    const base = clean.replace(/_stairs$/, '');
    if (EXACT_TEXTURE_MAP[base]) return EXACT_TEXTURE_MAP[base];
    if (EXACT_TEXTURE_MAP[base + '_planks']) return EXACT_TEXTURE_MAP[base + '_planks'];
    if (EXACT_TEXTURE_MAP[base + 's']) return EXACT_TEXTURE_MAP[base + 's'];
    return base;
  }

  // Slabs -> Base material
  if (clean.endsWith('_slab')) {
    const base = clean.replace(/_slab$/, '');
    if (EXACT_TEXTURE_MAP[base]) return EXACT_TEXTURE_MAP[base];
    if (EXACT_TEXTURE_MAP[base + '_planks']) return EXACT_TEXTURE_MAP[base + '_planks'];
    if (EXACT_TEXTURE_MAP[base + 's']) return EXACT_TEXTURE_MAP[base + 's'];
    return base;
  }

  // Walls -> Base stone
  if (clean.endsWith('_wall')) {
    const base = clean.replace(/_wall$/, '');
    if (EXACT_TEXTURE_MAP[base]) return EXACT_TEXTURE_MAP[base];
    if (EXACT_TEXTURE_MAP[base + 's']) return EXACT_TEXTURE_MAP[base + 's'];
    return base;
  }

  // Fences & Fence Gates -> Base wood
  if (clean.endsWith('_fence') || clean.endsWith('_fence_gate')) {
    const base = clean.replace(/_fence(_gate)?$/, '');
    if (EXACT_TEXTURE_MAP[base + '_planks']) return EXACT_TEXTURE_MAP[base + '_planks'];
    if (EXACT_TEXTURE_MAP[base]) return EXACT_TEXTURE_MAP[base];
    return base;
  }

  // Panes -> Base glass
  if (clean.endsWith('_pane')) {
    const base = clean.replace(/_pane$/, '');
    if (EXACT_TEXTURE_MAP[base]) return EXACT_TEXTURE_MAP[base];
    return 'glass';
  }

  // Carpets & Beds -> Wool
  if (clean.endsWith('_carpet') || clean.endsWith('_bed')) {
    const color = clean.replace(/_(carpet|bed)$/, '');
    if (EXACT_TEXTURE_MAP[color + '_wool']) return EXACT_TEXTURE_MAP[color + '_wool'];
    return 'white_wool';
  }

  // Doors
  if (clean.endsWith('_door')) {
    if (EXACT_TEXTURE_MAP[clean + '_bottom']) return EXACT_TEXTURE_MAP[clean + '_bottom'];
    return clean + '_bottom';
  }

  // Signs & Hanging Signs -> Wood planks
  if (clean.includes('_sign')) {
    const wood = clean.split('_')[0];
    if (EXACT_TEXTURE_MAP[wood + '_planks']) return EXACT_TEXTURE_MAP[wood + '_planks'];
    return 'oak_planks';
  }

  // Candles
  if (clean.includes('candle')) {
    return 'candle';
  }

  return clean;
}

/**
 * Returns candidate URLs in order of preference:
 * 1. Local bundled texture in /textures/blocks/ (0ms load, offline capable)
 * 2. jsDelivr CDN from PrismarineJS/minecraft-assets
 * 3. raw.githubusercontent.com fallback
 */
export function getTextureCandidateUrls(textureName: string): string[] {
  return [
    '/textures/blocks/' + textureName + '.png',
    'https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.20.2/blocks/' + textureName + '.png',
    'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/' + textureName + '.png',
  ];
}
`;

fs.writeFileSync('src/textures/textureMapping.ts', tsCode);
console.log('✅ Generated src/textures/textureMapping.ts successfully!');
