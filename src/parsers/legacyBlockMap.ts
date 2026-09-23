/**
 * Comprehensive mapping of legacy Minecraft numeric Block IDs (and metadata)
 * to modern 1.20+ Minecraft block names.
 */

// Colors for wool, stained glass, concrete, terracotta, carpets, beds
const COLOR_NAMES = [
  'white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime',
  'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue',
  'brown', 'green', 'red', 'black'
];

// Wood types for planks, logs, leaves, saplings
const WOOD_TYPES = [
  'oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak'
];

// Stone types
const STONE_VARIANTS: Record<number, string> = {
  0: 'minecraft:stone',
  1: 'minecraft:granite',
  2: 'minecraft:polished_granite',
  3: 'minecraft:diorite',
  4: 'minecraft:polished_diorite',
  5: 'minecraft:andesite',
  6: 'minecraft:polished_andesite',
};

// Dirt types
const DIRT_VARIANTS: Record<number, string> = {
  0: 'minecraft:dirt',
  1: 'minecraft:coarse_dirt',
  2: 'minecraft:podzol',
};

// Sand types
const SAND_VARIANTS: Record<number, string> = {
  0: 'minecraft:sand',
  1: 'minecraft:red_sand',
};

// Sandstone types
const SANDSTONE_VARIANTS: Record<number, string> = {
  0: 'minecraft:sandstone',
  1: 'minecraft:chiseled_sandstone',
  2: 'minecraft:cut_sandstone',
};

const RED_SANDSTONE_VARIANTS: Record<number, string> = {
  0: 'minecraft:red_sandstone',
  1: 'minecraft:chiseled_red_sandstone',
  2: 'minecraft:cut_red_sandstone',
};

// Stone bricks
const STONE_BRICK_VARIANTS: Record<number, string> = {
  0: 'minecraft:stone_bricks',
  1: 'minecraft:mossy_stone_bricks',
  2: 'minecraft:cracked_stone_bricks',
  3: 'minecraft:chiseled_stone_bricks',
};

// Slabs (half blocks)
const STONE_SLAB_VARIANTS: Record<number, string> = {
  0: 'minecraft:smooth_stone_slab',
  1: 'minecraft:sandstone_slab',
  2: 'minecraft:petrified_oak_slab',
  3: 'minecraft:cobblestone_slab',
  4: 'minecraft:brick_slab',
  5: 'minecraft:stone_brick_slab',
  6: 'minecraft:nether_brick_slab',
  7: 'minecraft:quartz_slab',
};

const BASE_LEGACY_MAP: Record<number, string> = {
  0: 'minecraft:air',
  1: 'minecraft:stone',
  2: 'minecraft:grass_block',
  3: 'minecraft:dirt',
  4: 'minecraft:cobblestone',
  5: 'minecraft:oak_planks',
  6: 'minecraft:oak_sapling',
  7: 'minecraft:bedrock',
  8: 'minecraft:water',
  9: 'minecraft:water',
  10: 'minecraft:lava',
  11: 'minecraft:lava',
  12: 'minecraft:sand',
  13: 'minecraft:gravel',
  14: 'minecraft:gold_ore',
  15: 'minecraft:iron_ore',
  16: 'minecraft:coal_ore',
  17: 'minecraft:oak_log',
  18: 'minecraft:oak_leaves',
  19: 'minecraft:sponge',
  20: 'minecraft:glass',
  21: 'minecraft:lapis_ore',
  22: 'minecraft:lapis_block',
  23: 'minecraft:dispenser',
  24: 'minecraft:sandstone',
  25: 'minecraft:note_block',
  26: 'minecraft:red_bed',
  27: 'minecraft:powered_rail',
  28: 'minecraft:detector_rail',
  29: 'minecraft:sticky_piston',
  30: 'minecraft:cobweb',
  31: 'minecraft:short_grass',
  32: 'minecraft:dead_bush',
  33: 'minecraft:piston',
  35: 'minecraft:white_wool',
  37: 'minecraft:dandelion',
  38: 'minecraft:poppy',
  39: 'minecraft:brown_mushroom',
  40: 'minecraft:red_mushroom',
  41: 'minecraft:gold_block',
  42: 'minecraft:iron_block',
  43: 'minecraft:smooth_stone_slab', // Double slab
  44: 'minecraft:stone_slab',
  45: 'minecraft:bricks',
  46: 'minecraft:tnt',
  47: 'minecraft:bookshelf',
  48: 'minecraft:mossy_cobblestone',
  49: 'minecraft:obsidian',
  50: 'minecraft:torch',
  51: 'minecraft:fire',
  52: 'minecraft:spawner',
  53: 'minecraft:oak_stairs',
  54: 'minecraft:chest',
  55: 'minecraft:redstone_wire',
  56: 'minecraft:diamond_ore',
  57: 'minecraft:diamond_block',
  58: 'minecraft:crafting_table',
  59: 'minecraft:wheat',
  60: 'minecraft:farmland',
  61: 'minecraft:furnace',
  62: 'minecraft:furnace',
  63: 'minecraft:oak_sign',
  64: 'minecraft:oak_door',
  65: 'minecraft:ladder',
  66: 'minecraft:rail',
  67: 'minecraft:cobblestone_stairs',
  68: 'minecraft:oak_wall_sign',
  69: 'minecraft:lever',
  70: 'minecraft:stone_pressure_plate',
  71: 'minecraft:iron_door',
  72: 'minecraft:oak_pressure_plate',
  73: 'minecraft:redstone_ore',
  74: 'minecraft:redstone_ore',
  75: 'minecraft:redstone_torch',
  76: 'minecraft:redstone_torch',
  77: 'minecraft:stone_button',
  78: 'minecraft:snow',
  79: 'minecraft:ice',
  80: 'minecraft:snow_block',
  81: 'minecraft:cactus',
  82: 'minecraft:clay',
  83: 'minecraft:sugar_cane',
  84: 'minecraft:jukebox',
  85: 'minecraft:oak_fence',
  86: 'minecraft:carved_pumpkin',
  87: 'minecraft:netherrack',
  88: 'minecraft:soul_sand',
  89: 'minecraft:glowstone',
  90: 'minecraft:nether_portal',
  91: 'minecraft:jack_o_lantern',
  92: 'minecraft:cake',
  93: 'minecraft:repeater',
  94: 'minecraft:repeater',
  95: 'minecraft:white_stained_glass',
  96: 'minecraft:oak_trapdoor',
  97: 'minecraft:infested_stone',
  98: 'minecraft:stone_bricks',
  99: 'minecraft:brown_mushroom_block',
  100: 'minecraft:red_mushroom_block',
  101: 'minecraft:iron_bars',
  102: 'minecraft:glass_pane',
  103: 'minecraft:melon',
  104: 'minecraft:pumpkin_stem',
  105: 'minecraft:melon_stem',
  106: 'minecraft:vine',
  107: 'minecraft:oak_fence_gate',
  108: 'minecraft:brick_stairs',
  109: 'minecraft:stone_brick_stairs',
  110: 'minecraft:mycelium',
  111: 'minecraft:lily_pad',
  112: 'minecraft:nether_bricks',
  113: 'minecraft:nether_brick_fence',
  114: 'minecraft:nether_brick_stairs',
  115: 'minecraft:nether_wart',
  116: 'minecraft:enchanting_table',
  117: 'minecraft:brewing_stand',
  118: 'minecraft:cauldron',
  119: 'minecraft:end_portal',
  120: 'minecraft:end_portal_frame',
  121: 'minecraft:end_stone',
  122: 'minecraft:dragon_egg',
  123: 'minecraft:redstone_lamp',
  124: 'minecraft:redstone_lamp',
  126: 'minecraft:oak_slab',
  127: 'minecraft:cocoa',
  128: 'minecraft:sandstone_stairs',
  129: 'minecraft:emerald_ore',
  130: 'minecraft:ender_chest',
  131: 'minecraft:tripwire_hook',
  132: 'minecraft:tripwire',
  133: 'minecraft:emerald_block',
  134: 'minecraft:spruce_stairs',
  135: 'minecraft:birch_stairs',
  136: 'minecraft:jungle_stairs',
  137: 'minecraft:command_block',
  138: 'minecraft:beacon',
  139: 'minecraft:cobblestone_wall',
  140: 'minecraft:flower_pot',
  141: 'minecraft:carrots',
  142: 'minecraft:potatoes',
  143: 'minecraft:oak_button',
  144: 'minecraft:skeleton_skull',
  145: 'minecraft:anvil',
  146: 'minecraft:trapped_chest',
  147: 'minecraft:light_weighted_pressure_plate',
  148: 'minecraft:heavy_weighted_pressure_plate',
  149: 'minecraft:comparator',
  150: 'minecraft:comparator',
  151: 'minecraft:daylight_detector',
  152: 'minecraft:redstone_block',
  153: 'minecraft:nether_quartz_ore',
  154: 'minecraft:hopper',
  155: 'minecraft:quartz_block',
  156: 'minecraft:quartz_stairs',
  157: 'minecraft:activator_rail',
  158: 'minecraft:dropper',
  159: 'minecraft:white_terracotta',
  160: 'minecraft:white_stained_glass_pane',
  161: 'minecraft:acacia_leaves',
  162: 'minecraft:acacia_log',
  163: 'minecraft:acacia_stairs',
  164: 'minecraft:dark_oak_stairs',
  165: 'minecraft:slime_block',
  166: 'minecraft:barrier',
  167: 'minecraft:iron_trapdoor',
  168: 'minecraft:prismarine',
  169: 'minecraft:sea_lantern',
  170: 'minecraft:hay_block',
  171: 'minecraft:white_carpet',
  172: 'minecraft:terracotta',
  173: 'minecraft:coal_block',
  174: 'minecraft:packed_ice',
  175: 'minecraft:sunflower',
  179: 'minecraft:red_sandstone',
  180: 'minecraft:red_sandstone_stairs',
  182: 'minecraft:red_sandstone_slab',
  183: 'minecraft:spruce_fence_gate',
  184: 'minecraft:birch_fence_gate',
  185: 'minecraft:jungle_fence_gate',
  186: 'minecraft:dark_oak_fence_gate',
  187: 'minecraft:acacia_fence_gate',
  188: 'minecraft:spruce_fence',
  189: 'minecraft:birch_fence',
  190: 'minecraft:jungle_fence',
  191: 'minecraft:dark_oak_fence',
  192: 'minecraft:acacia_fence',
  193: 'minecraft:spruce_door',
  194: 'minecraft:birch_door',
  195: 'minecraft:jungle_door',
  196: 'minecraft:acacia_door',
  197: 'minecraft:dark_oak_door',
  198: 'minecraft:end_rod',
  199: 'minecraft:chorus_plant',
  200: 'minecraft:chorus_flower',
  201: 'minecraft:purpur_block',
  202: 'minecraft:purpur_pillar',
  203: 'minecraft:purpur_stairs',
  205: 'minecraft:purpur_slab',
  206: 'minecraft:end_stone_bricks',
  208: 'minecraft:dirt_path',
  212: 'minecraft:frosted_ice',
  213: 'minecraft:magma_block',
  214: 'minecraft:nether_wart_block',
  215: 'minecraft:red_nether_bricks',
  216: 'minecraft:bone_block',
  218: 'minecraft:observer',
  219: 'minecraft:white_shulker_box',
  251: 'minecraft:white_concrete',
  252: 'minecraft:white_concrete_powder',
};

/**
 * Resolves a legacy block ID and metadata nibble to a modern 1.20+ block identifier.
 */
export function legacyToModernBlock(id: number, data: number = 0): string {
  // Air check
  if (id === 0) return 'minecraft:air';

  // 1: Stone variants
  if (id === 1) return STONE_VARIANTS[data] || 'minecraft:stone';

  // 3: Dirt variants
  if (id === 3) return DIRT_VARIANTS[data] || 'minecraft:dirt';

  // 5: Planks
  if (id === 5) {
    const wood = WOOD_TYPES[data % WOOD_TYPES.length] || 'oak';
    return `minecraft:${wood}_planks`;
  }

  // 6: Saplings
  if (id === 6) {
    const wood = WOOD_TYPES[data & 0x7] || 'oak';
    return `minecraft:${wood}_sapling`;
  }

  // 12: Sand
  if (id === 12) return SAND_VARIANTS[data] || 'minecraft:sand';

  // 17: Log 1 (Oak, Spruce, Birch, Jungle)
  if (id === 17) {
    const wood = WOOD_TYPES[data & 0x3] || 'oak';
    return `minecraft:${wood}_log`;
  }

  // 18: Leaves 1
  if (id === 18) {
    const wood = WOOD_TYPES[data & 0x3] || 'oak';
    return `minecraft:${wood}_leaves`;
  }

  // 19: Sponge
  if (id === 19) return data === 1 ? 'minecraft:wet_sponge' : 'minecraft:sponge';

  // 24: Sandstone
  if (id === 24) return SANDSTONE_VARIANTS[data] || 'minecraft:sandstone';

  // 35: Wool
  if (id === 35) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_wool`;
  }

  // 44: Stone slabs
  if (id === 44) {
    return STONE_SLAB_VARIANTS[data & 0x7] || 'minecraft:stone_slab';
  }

  // 95: Stained Glass
  if (id === 95) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_stained_glass`;
  }

  // 98: Stone Bricks
  if (id === 98) return STONE_BRICK_VARIANTS[data] || 'minecraft:stone_bricks';

  // 126: Wooden Slabs
  if (id === 126) {
    const wood = WOOD_TYPES[data & 0x7] || 'oak';
    return `minecraft:${wood}_slab`;
  }

  // 159: Terracotta (Stained Clay)
  if (id === 159) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_terracotta`;
  }

  // 160: Stained Glass Pane
  if (id === 160) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_stained_glass_pane`;
  }

  // 161: Leaves 2 (Acacia, Dark Oak)
  if (id === 161) {
    const wood = (data & 0x1) === 0 ? 'acacia' : 'dark_oak';
    return `minecraft:${wood}_leaves`;
  }

  // 162: Log 2 (Acacia, Dark Oak)
  if (id === 162) {
    const wood = (data & 0x1) === 0 ? 'acacia' : 'dark_oak';
    return `minecraft:${wood}_log`;
  }

  // 171: Carpet
  if (id === 171) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_carpet`;
  }

  // 179: Red Sandstone
  if (id === 179) return RED_SANDSTONE_VARIANTS[data] || 'minecraft:red_sandstone';

  // 219 - 234: Shulker boxes
  if (id >= 219 && id <= 234) {
    const color = COLOR_NAMES[id - 219] || 'white';
    return `minecraft:${color}_shulker_box`;
  }

  // 251: Concrete
  if (id === 251) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_concrete`;
  }

  // 252: Concrete Powder
  if (id === 252) {
    const color = COLOR_NAMES[data & 0xF] || 'white';
    return `minecraft:${color}_concrete_powder`;
  }

  // Fallback to base legacy map
  if (BASE_LEGACY_MAP[id]) {
    return BASE_LEGACY_MAP[id];
  }

  return `minecraft:unknown_block_${id}`;
}
