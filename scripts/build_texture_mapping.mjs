import fs from 'node:fs';
import path from 'node:path';

const colors = [
  'white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime',
  'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue',
  'brown', 'green', 'red', 'black'
];

const woods = [
  'oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak',
  'mangrove', 'cherry', 'bamboo', 'crimson', 'warped', 'pale_oak', 'poplar'
];

async function build() {
  console.log('Fetching 26.1 blocks_textures.json...');
  const res26 = await fetch('https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/blocks_textures.json');
  const list26 = await res26.json();

  const map = {};

  // 1. Populate from 26.1 (skip missingno)
  for (const item of list26) {
    if (item.texture && typeof item.texture === 'string' && !item.texture.includes('missingno')) {
      const tex = item.texture.split('/').pop().replace('.png', '');
      map[item.name] = tex;
    }
  }

  // 2. Direct map from local files in public/textures/blocks/
  const localFiles = fs.readdirSync('public/textures/blocks').filter(f => f.endsWith('.png'));
  for (const file of localFiles) {
    const name = file.replace('.png', '');
    if (!map[name]) {
      map[name] = name;
    }
  }

  // 3. Directional / top-down overrides for blocks viewed from above in a 2D layer
  const standardOverrides = {
    'grass_block': 'grass_block_top',
    'dirt_path': 'dirt_path_top',
    'podzol': 'podzol_top',
    'mycelium': 'mycelium_top',
    'crafting_table': 'crafting_table_top',
    'furnace': 'furnace_front',
    'blast_furnace': 'blast_furnace_front',
    'smoker': 'smoker_front',
    'dispenser': 'dispenser_front',
    'dropper': 'dropper_front',
    'observer': 'observer_front',
    'piston': 'piston_top',
    'sticky_piston': 'piston_top',
    'tnt': 'tnt_top',
    'target': 'target_top',
    'barrel': 'barrel_top',
    'cartography_table': 'cartography_table_top',
    'fletching_table': 'fletching_table_top',
    'smithing_table': 'smithing_table_top',
    'loom': 'loom_top',
    'lectern': 'lectern_top',
    'enchanting_table': 'enchanting_table_top',
    'lodestone': 'lodestone_top',
    'respawn_anchor': 'respawn_anchor_top',
    'daylight_detector': 'daylight_detector_top',
    'scaffolding': 'scaffolding_top',
    'stonecutter': 'stonecutter_top',
    'chiseled_bookshelf': 'chiseled_bookshelf_empty',
    'bookshelf': 'bookshelf',
    'crafter': 'crafter_top',
    'hay_block': 'hay_block_top',
    'bone_block': 'bone_block_side',
    'cauldron': 'cauldron_top',
    'hopper': 'hopper_top',
    'glass_pane': 'glass',
    'iron_bars': 'iron_bars',
    'ladder': 'ladder',
    'torch': 'torch',
    'wall_torch': 'torch',
    'soul_torch': 'soul_torch',
    'soul_wall_torch': 'soul_torch',
    'redstone_torch': 'redstone_torch',
    'redstone_wall_torch': 'redstone_torch',
    'lantern': 'lantern',
    'soul_lantern': 'soul_lantern',
    'chain': 'chain',
    'bell': 'bell_bottom',
    'redstone_wire': 'redstone_dust_dot',
    'repeater': 'repeater',
    'comparator': 'comparator',
    'lever': 'lever',
    'tripwire_hook': 'tripwire_hook',
    'cake': 'cake_top',
    'end_portal_frame': 'end_portal_frame_top',
    'brewing_stand': 'brewing_stand',
    'conduit': 'conduit',
    'crying_obsidian': 'crying_obsidian',
    'chest': 'oak_planks',
    'trapped_chest': 'oak_planks',
    'ender_chest': 'obsidian',
    'spawner': 'spawner',

    // 26.x features
    'pale_oak_log': 'pale_oak_log_top',
    'pale_oak_wood': 'pale_oak_log',
    'pale_oak_stairs': 'pale_oak_planks',
    'pale_oak_slab': 'pale_oak_planks',
    'pale_oak_fence': 'pale_oak_planks',
    'pale_oak_fence_gate': 'pale_oak_planks',
    'pale_oak_door': 'pale_oak_door_bottom',
    'pale_oak_trapdoor': 'pale_oak_trapdoor',
    'pale_moss_block': 'pale_moss_block',
    'pale_moss_carpet': 'pale_moss_carpet',
    'pale_hanging_moss': 'pale_hanging_moss',
    'resin_block': 'resin_block',
    'resin_bricks': 'resin_bricks',
    'resin_brick_stairs': 'resin_bricks',
    'resin_brick_slab': 'resin_bricks',
    'resin_brick_wall': 'resin_bricks',
    'resin_clump': 'resin_clump',
    'chiseled_resin_bricks': 'chiseled_resin_bricks',
    'tuff_stairs': 'tuff',
    'tuff_slab': 'tuff',
    'tuff_wall': 'tuff',
    'tuff_brick_stairs': 'tuff_bricks',
    'tuff_brick_slab': 'tuff_bricks',
    'tuff_brick_wall': 'tuff_bricks',
    'polished_tuff_stairs': 'polished_tuff',
    'polished_tuff_slab': 'polished_tuff',
    'polished_tuff_wall': 'polished_tuff',
    'copper_bulb': 'copper_bulb',
    'copper_grate': 'copper_grate',
    'copper_door': 'copper_door_bottom',
    'copper_trapdoor': 'copper_trapdoor',
    'trial_spawner': 'trial_spawner_top',
    'vault': 'vault_top',
    'heavy_core': 'heavy_core',
    'creaking_heart': 'creaking_heart_top_awake',

    // 26.3 Wilderness Bound
    'poplar_planks': 'poplar_planks',
    'poplar_log': 'poplar_log_top',
    'poplar_wood': 'poplar_log',
    'stripped_poplar_log': 'stripped_poplar_log_top',
    'stripped_poplar_wood': 'stripped_poplar_log',
    'poplar_leaves': 'poplar_leaves',
    'poplar_sapling': 'poplar_sapling',
    'potted_poplar_sapling': 'poplar_sapling',
    'poplar_stairs': 'poplar_planks',
    'poplar_slab': 'poplar_planks',
    'poplar_fence': 'poplar_planks',
    'poplar_fence_gate': 'poplar_planks',
    'poplar_door': 'poplar_door_bottom',
    'poplar_trapdoor': 'poplar_trapdoor',
    'poplar_shelf': 'poplar_shelf',
    'straw_bed': 'straw_bed',
    'shelf_mushroom': 'shelf_mushroom',
    'red_shrub': 'red_shrub',
    'cushion': 'white_cushion',
  };

  for (const [k, v] of Object.entries(standardOverrides)) {
    map[k] = v;
  }

  // 4. Shelves for all wood types
  for (const w of woods) {
    map[`${w}_shelf`] = `${w}_shelf`;
    map[`${w}_fence`] = `${w}_planks`;
    map[`${w}_fence_gate`] = `${w}_planks`;
    map[`${w}_stairs`] = `${w}_planks`;
    map[`${w}_slab`] = `${w}_planks`;
  }

  // 5. Walls -> Base blocks
  const wallBases = {
    'cobblestone_wall': 'cobblestone',
    'mossy_cobblestone_wall': 'mossy_cobblestone',
    'brick_wall': 'bricks',
    'prismarine_wall': 'prismarine',
    'red_sandstone_wall': 'red_sandstone_top',
    'mossy_stone_brick_wall': 'mossy_stone_bricks',
    'granite_wall': 'granite',
    'stone_brick_wall': 'stone_bricks',
    'mud_brick_wall': 'mud_bricks',
    'nether_brick_wall': 'nether_bricks',
    'andesite_wall': 'andesite',
    'red_nether_brick_wall': 'red_nether_bricks',
    'sandstone_wall': 'sandstone_top',
    'end_stone_brick_wall': 'end_stone_bricks',
    'diorite_wall': 'diorite',
    'blackstone_wall': 'blackstone',
    'polished_blackstone_brick_wall': 'polished_blackstone_bricks',
    'polished_blackstone_wall': 'polished_blackstone',
    'tuff_wall': 'tuff',
    'polished_tuff_wall': 'polished_tuff',
    'tuff_brick_wall': 'tuff_bricks',
    'cobbled_deepslate_wall': 'cobbled_deepslate',
    'polished_deepslate_wall': 'polished_deepslate',
    'deepslate_tile_wall': 'deepslate_tiles',
    'deepslate_brick_wall': 'deepslate_bricks',
    'resin_brick_wall': 'resin_bricks',
  };
  for (const [wall, base] of Object.entries(wallBases)) {
    map[wall] = base;
  }

  // 6. 26.3 Color Variants: Wool stairs/slabs, Concrete stairs/slabs, Cushions, Beds, Carpets, Stained glass panes
  for (const c of colors) {
    map[`${c}_wool_stairs`] = `${c}_wool`;
    map[`${c}_wool_slab`] = `${c}_wool`;
    map[`${c}_concrete_stairs`] = `${c}_concrete`;
    map[`${c}_concrete_slab`] = `${c}_concrete`;
    map[`${c}_terracotta_stairs`] = `${c}_terracotta`;
    map[`${c}_terracotta_slab`] = `${c}_terracotta`;
    map[`${c}_cushion`] = `${c}_cushion`;
    map[`${c}_carpet`] = `${c}_wool`;
    map[`${c}_bed`] = `${c}_wool`;
    map[`${c}_stained_glass_pane`] = `${c}_stained_glass`;
    map[`${c}_shulker_box`] = `${c}_shulker_box`;
    map[`${c}_glazed_terracotta`] = `${c}_glazed_terracotta`;
    map[`${c}_concrete_powder`] = `${c}_concrete_powder`;
  }

  // 7. Copper variations (waxed, exposed, weathered, oxidized)
  const copperStates = ['', 'exposed_', 'weathered_', 'oxidized_'];
  const copperItems = ['copper', 'cut_copper', 'copper_grate', 'copper_bulb', 'copper_bars', 'copper_door', 'copper_trapdoor'];
  for (const prefix of copperStates) {
    for (const item of copperItems) {
      const baseName = `${prefix}${item}`;
      const unwaxed = baseName;
      if (item === 'copper_door') {
        map[unwaxed] = `${prefix}copper_door_bottom`;
        map[`waxed_${unwaxed}`] = `${prefix}copper_door_bottom`;
      } else {
        map[`waxed_${unwaxed}`] = map[unwaxed] || unwaxed;
      }
    }
  }

  console.log('Total entries in complete texture map:', Object.keys(map).length);

  const tsCode = `/**
 * Exhaustive mapping of Minecraft 1.20+, 1.21, and 26.3 Wilderness Bound block identifiers to texture filenames.
 * Auto-generated with 26.3 Wilderness Bound support.
 */

export const EXACT_TEXTURE_MAP: Record<string, string> = ${JSON.stringify(map, null, 2)};

/**
 * Resolves any block ID (including 26.3 blockstates and variants)
 * to its corresponding texture file name.
 */
export function resolveBlockTexture(blockId: string): string {
  let clean = blockId.split('[')[0].replace(/^minecraft:/, '');

  // Strip waxing prefix
  if (clean.startsWith('waxed_')) {
    clean = clean.replace(/^waxed_/, '');
  }

  // Strip potting prefix
  if (clean.startsWith('potted_')) {
    clean = clean.replace(/^potted_/, '');
  }

  if (EXACT_TEXTURE_MAP[clean]) {
    return EXACT_TEXTURE_MAP[clean];
  }

  // Morphological rules for block variants:

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

  // Cushions
  if (clean.includes('cushion')) {
    const color = clean.replace(/_cushion$/, '').replace(/^cushion$/, 'white');
    if (EXACT_TEXTURE_MAP[color + '_cushion']) return EXACT_TEXTURE_MAP[color + '_cushion'];
    if (EXACT_TEXTURE_MAP[color + '_wool']) return EXACT_TEXTURE_MAP[color + '_wool'];
    return 'white_cushion';
  }

  // Shelves
  if (clean.endsWith('_shelf')) {
    const wood = clean.replace(/_shelf$/, '');
    if (EXACT_TEXTURE_MAP[wood + '_shelf']) return EXACT_TEXTURE_MAP[wood + '_shelf'];
    if (EXACT_TEXTURE_MAP[wood + '_planks']) return EXACT_TEXTURE_MAP[wood + '_planks'];
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
 * 2. jsDelivr CDN from PrismarineJS/minecraft-assets version 26.1 / 26.3
 * 3. jsDelivr CDN from version 1.20.2
 * 4. raw.githubusercontent.com fallback
 */
export function getTextureCandidateUrls(textureName: string): string[] {
  return [
    '/textures/blocks/' + textureName + '.png',
    'https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/26.1/blocks/' + textureName + '.png',
    'https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.20.2/blocks/' + textureName + '.png',
    'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/blocks/' + textureName + '.png',
    'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/' + textureName + '.png',
  ];
}
`;

  fs.writeFileSync('src/textures/textureMapping.ts', tsCode);
  console.log('✅ Wrote src/textures/textureMapping.ts with 26.3 Wilderness Bound support!');
}

build().catch(console.error);
