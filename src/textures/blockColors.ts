/**
 * Block colors, localized names and abbreviations for procedural fallbacks.
 */

export interface BlockVisualMeta {
  color: string;
  nameFr: string;
  nameEn: string;
  initials: string;
}

export const BLOCK_META_MAP: Record<string, BlockVisualMeta> = {
  // Stones & Deepslate
  'minecraft:stone': { color: '#7e7e7e', nameFr: 'Pierre', nameEn: 'Stone', initials: 'ST' },
  'minecraft:granite': { color: '#976451', nameFr: 'Granite', nameEn: 'Granite', initials: 'GR' },
  'minecraft:polished_granite': { color: '#986754', nameFr: 'Granite poli', nameEn: 'Polished Granite', initials: 'PG' },
  'minecraft:diorite': { color: '#bfbfbf', nameFr: 'Diorite', nameEn: 'Diorite', initials: 'DI' },
  'minecraft:polished_diorite': { color: '#c4c4c4', nameFr: 'Diorite polie', nameEn: 'Polished Diorite', initials: 'PD' },
  'minecraft:andesite': { color: '#888889', nameFr: 'Andésite', nameEn: 'Andesite', initials: 'AN' },
  'minecraft:polished_andesite': { color: '#858586', nameFr: 'Andésite polie', nameEn: 'Polished Andesite', initials: 'PA' },
  'minecraft:cobblestone': { color: '#686868', nameFr: 'Pierre taillée', nameEn: 'Cobblestone', initials: 'CB' },
  'minecraft:mossy_cobblestone': { color: '#57674e', nameFr: 'Pierre moussue', nameEn: 'Mossy Cobblestone', initials: 'MC' },
  'minecraft:stone_bricks': { color: '#767676', nameFr: 'Pierres sculptées', nameEn: 'Stone Bricks', initials: 'SB' },
  'minecraft:mossy_stone_bricks': { color: '#66745f', nameFr: 'Pierres sculptées moussues', nameEn: 'Mossy Stone Bricks', initials: 'MS' },
  'minecraft:cracked_stone_bricks': { color: '#6c6c6c', nameFr: 'Pierres sculptées fissurées', nameEn: 'Cracked Stone Bricks', initials: 'CS' },
  'minecraft:deepslate': { color: '#44444a', nameFr: 'Abîme', nameEn: 'Deepslate', initials: 'DS' },
  'minecraft:cobbled_deepslate': { color: '#3f3f45', nameFr: 'Pierres des abîmes', nameEn: 'Cobbled Deepslate', initials: 'CD' },
  'minecraft:polished_deepslate': { color: '#38383f', nameFr: 'Abîme poli', nameEn: 'Polished Deepslate', initials: 'DP' },
  'minecraft:deepslate_bricks': { color: '#34343a', nameFr: 'Ardoise des abîmes taillée', nameEn: 'Deepslate Bricks', initials: 'DB' },
  'minecraft:deepslate_tiles': { color: '#2d2d33', nameFr: 'Tuiles des abîmes', nameEn: 'Deepslate Tiles', initials: 'DT' },
  'minecraft:bedrock': { color: '#2b2b2b', nameFr: 'Bedrock', nameEn: 'Bedrock', initials: 'BD' },
  'minecraft:obsidian': { color: '#1a1027', nameFr: 'Obsidienne', nameEn: 'Obsidian', initials: 'OB' },
  'minecraft:crying_obsidian': { color: '#2b1049', nameFr: 'Obsidienne pleureuse', nameEn: 'Crying Obsidian', initials: 'CO' },

  // Dirt & Terrains
  'minecraft:grass_block': { color: '#597d28', nameFr: "Bloc d'herbe", nameEn: 'Grass Block', initials: 'GB' },
  'minecraft:dirt': { color: '#866043', nameFr: 'Terre', nameEn: 'Dirt', initials: 'DR' },
  'minecraft:coarse_dirt': { color: '#77553b', nameFr: 'Terre stérile', nameEn: 'Coarse Dirt', initials: 'CD' },
  'minecraft:podzol': { color: '#5b3f27', nameFr: 'Podzol', nameEn: 'Podzol', initials: 'PZ' },
  'minecraft:dirt_path': { color: '#91713d', nameFr: 'Chemin de terre', nameEn: 'Dirt Path', initials: 'DP' },
  'minecraft:farmland': { color: '#4d301b', nameFr: 'Terre labourée', nameEn: 'Farmland', initials: 'FL' },
  'minecraft:mud': { color: '#3c393d', nameFr: 'Boue', nameEn: 'Mud', initials: 'MD' },
  'minecraft:packed_mud': { color: '#8e6c53', nameFr: 'Boue compactée', nameEn: 'Packed Mud', initials: 'PM' },
  'minecraft:mud_bricks': { color: '#89674f', nameFr: 'Briques de boue', nameEn: 'Mud Bricks', initials: 'MB' },
  'minecraft:sand': { color: '#d8cb9a', nameFr: 'Sable', nameEn: 'Sand', initials: 'SD' },
  'minecraft:red_sand': { color: '#b95d28', nameFr: 'Sable rouge', nameEn: 'Red Sand', initials: 'RS' },
  'minecraft:sandstone': { color: '#d7c997', nameFr: 'Grès', nameEn: 'Sandstone', initials: 'SS' },
  'minecraft:red_sandstone': { color: '#ba5e28', nameFr: 'Grès rouge', nameEn: 'Red Sandstone', initials: 'RS' },
  'minecraft:gravel': { color: '#7d7a78', nameFr: 'Gravier', nameEn: 'Gravel', initials: 'GV' },
  'minecraft:clay': { color: '#9da4b0', nameFr: 'Argile', nameEn: 'Clay', initials: 'CL' },

  // Wood & Planks
  'minecraft:oak_planks': { color: '#a78550', nameFr: 'Planches de chêne', nameEn: 'Oak Planks', initials: 'OP' },
  'minecraft:spruce_planks': { color: '#684e31', nameFr: 'Planches de sapin', nameEn: 'Spruce Planks', initials: 'SP' },
  'minecraft:birch_planks': { color: '#c4b077', nameFr: 'Planches de bouleau', nameEn: 'Birch Planks', initials: 'BP' },
  'minecraft:jungle_planks': { color: '#a07454', nameFr: 'Planches d’acajou', nameEn: 'Jungle Planks', initials: 'JP' },
  'minecraft:acacia_planks': { color: '#a85a32', nameFr: 'Planches d’acacia', nameEn: 'Acacia Planks', initials: 'AP' },
  'minecraft:dark_oak_planks': { color: '#422a15', nameFr: 'Planches de chêne noir', nameEn: 'Dark Oak Planks', initials: 'DP' },
  'minecraft:mangrove_planks': { color: '#743534', nameFr: 'Planches de palétuvier', nameEn: 'Mangrove Planks', initials: 'MP' },
  'minecraft:cherry_planks': { color: '#e4b2af', nameFr: 'Planches de cerisier', nameEn: 'Cherry Planks', initials: 'CP' },
  'minecraft:bamboo_planks': { color: '#c0a34e', nameFr: 'Planches de bambou', nameEn: 'Bamboo Planks', initials: 'BP' },
  'minecraft:crimson_planks': { color: '#653046', nameFr: 'Planches carmin', nameEn: 'Crimson Planks', initials: 'KP' },
  'minecraft:warped_planks': { color: '#2b6863', nameFr: 'Planches biscornues', nameEn: 'Warped Planks', initials: 'WP' },

  // Logs
  'minecraft:oak_log': { color: '#6a5231', nameFr: 'Bûche de chêne', nameEn: 'Oak Log', initials: 'OL' },
  'minecraft:spruce_log': { color: '#3b2611', nameFr: 'Bûche de sapin', nameEn: 'Spruce Log', initials: 'SL' },
  'minecraft:birch_log': { color: '#ded7cd', nameFr: 'Bûche de bouleau', nameEn: 'Birch Log', initials: 'BL' },
  'minecraft:jungle_log': { color: '#554319', nameFr: 'Bûche d’acajou', nameEn: 'Jungle Log', initials: 'JL' },
  'minecraft:acacia_log': { color: '#68615b', nameFr: 'Bûche d’acacia', nameEn: 'Acacia Log', initials: 'AL' },
  'minecraft:dark_oak_log': { color: '#372b1c', nameFr: 'Bûche de chêne noir', nameEn: 'Dark Oak Log', initials: 'DL' },
  'minecraft:mangrove_log': { color: '#542624', nameFr: 'Bûche de palétuvier', nameEn: 'Mangrove Log', initials: 'ML' },
  'minecraft:cherry_log': { color: '#362128', nameFr: 'Bûche de cerisier', nameEn: 'Cherry Log', initials: 'CL' },

  // Leaves
  'minecraft:oak_leaves': { color: '#3a5f1e', nameFr: 'Feuilles de chêne', nameEn: 'Oak Leaves', initials: 'LV' },
  'minecraft:spruce_leaves': { color: '#3b553a', nameFr: 'Feuilles de sapin', nameEn: 'Spruce Leaves', initials: 'LV' },
  'minecraft:birch_leaves': { color: '#596e38', nameFr: 'Feuilles de bouleau', nameEn: 'Birch Leaves', initials: 'LV' },
  'minecraft:jungle_leaves': { color: '#3a6616', nameFr: 'Feuilles d’acajou', nameEn: 'Jungle Leaves', initials: 'LV' },
  'minecraft:acacia_leaves': { color: '#4e631b', nameFr: 'Feuilles d’acacia', nameEn: 'Acacia Leaves', initials: 'LV' },
  'minecraft:dark_oak_leaves': { color: '#274b10', nameFr: 'Feuilles de chêne noir', nameEn: 'Dark Oak Leaves', initials: 'LV' },
  'minecraft:cherry_leaves': { color: '#ea91ab', nameFr: 'Feuilles de cerisier', nameEn: 'Cherry Leaves', initials: 'CL' },

  // Glass & Ice
  'minecraft:glass': { color: '#c7e9ee', nameFr: 'Verre', nameEn: 'Glass', initials: 'GL' },
  'minecraft:glass_pane': { color: '#c7e9ee', nameFr: 'Vitre', nameEn: 'Glass Pane', initials: 'GP' },
  'minecraft:ice': { color: '#90b4fe', nameFr: 'Glace', nameEn: 'Ice', initials: 'IC' },
  'minecraft:packed_ice': { color: '#8da6e4', nameFr: 'Glace compactée', nameEn: 'Packed Ice', initials: 'PI' },
  'minecraft:blue_ice': { color: '#74a7fd', nameFr: 'Glace bleue', nameEn: 'Blue Ice', initials: 'BI' },

  // Ores & Minerals
  'minecraft:coal_ore': { color: '#686868', nameFr: 'Minerai de charbon', nameEn: 'Coal Ore', initials: 'CO' },
  'minecraft:iron_ore': { color: '#877b73', nameFr: 'Minerai de fer', nameEn: 'Iron Ore', initials: 'IO' },
  'minecraft:copper_ore': { color: '#7e7b72', nameFr: 'Minerai de cuivre', nameEn: 'Copper Ore', initials: 'CU' },
  'minecraft:gold_ore': { color: '#8b8465', nameFr: 'Minerai d’or', nameEn: 'Gold Ore', initials: 'GO' },
  'minecraft:redstone_ore': { color: '#855f5f', nameFr: 'Minerai de redstone', nameEn: 'Redstone Ore', initials: 'RO' },
  'minecraft:lapis_ore': { color: '#5b6982', nameFr: 'Minerai de lapis', nameEn: 'Lapis Ore', initials: 'LO' },
  'minecraft:diamond_ore': { color: '#5d8888', nameFr: 'Minerai de diamant', nameEn: 'Diamond Ore', initials: 'DO' },
  'minecraft:emerald_ore': { color: '#598565', nameFr: 'Minerai d’émeraude', nameEn: 'Emerald Ore', initials: 'EO' },
  'minecraft:coal_block': { color: '#161616', nameFr: 'Bloc de charbon', nameEn: 'Block of Coal', initials: 'CB' },
  'minecraft:iron_block': { color: '#d8d8d8', nameFr: 'Bloc de fer', nameEn: 'Block of Iron', initials: 'IB' },
  'minecraft:copper_block': { color: '#bf6c4f', nameFr: 'Bloc de cuivre', nameEn: 'Block of Copper', initials: 'CB' },
  'minecraft:gold_block': { color: '#f5d033', nameFr: 'Bloc d’or', nameEn: 'Block of Gold', initials: 'GB' },
  'minecraft:diamond_block': { color: '#61e9df', nameFr: 'Bloc de diamant', nameEn: 'Block of Diamond', initials: 'DB' },
  'minecraft:netherite_block': { color: '#443f41', nameFr: 'Bloc de netherite', nameEn: 'Block of Netherite', initials: 'NB' },
  'minecraft:emerald_block': { color: '#27bd50', nameFr: 'Bloc d’émeraude', nameEn: 'Block of Emerald', initials: 'EB' },
  'minecraft:lapis_block': { color: '#1b439c', nameFr: 'Bloc de lapis-lazuli', nameEn: 'Block of Lapis Lazuli', initials: 'LB' },
  'minecraft:redstone_block': { color: '#aa1109', nameFr: 'Bloc de redstone', nameEn: 'Block of Redstone', initials: 'RB' },

  // Bricks & Nether
  'minecraft:bricks': { color: '#975949', nameFr: 'Briques', nameEn: 'Bricks', initials: 'BR' },
  'minecraft:netherrack': { color: '#65292a', nameFr: 'Netherrack', nameEn: 'Netherrack', initials: 'NR' },
  'minecraft:nether_bricks': { color: '#2c151a', nameFr: 'Briques du Nether', nameEn: 'Nether Bricks', initials: 'NB' },
  'minecraft:red_nether_bricks': { color: '#450709', nameFr: 'Briques rouges du Nether', nameEn: 'Red Nether Bricks', initials: 'RN' },
  'minecraft:soul_sand': { color: '#513e32', nameFr: 'Sable des âmes', nameEn: 'Soul Sand', initials: 'SS' },
  'minecraft:soul_soil': { color: '#49372d', nameFr: 'Terre des âmes', nameEn: 'Soul Soil', initials: 'SS' },
  'minecraft:basalt': { color: '#4f4f53', nameFr: 'Basalte', nameEn: 'Basalt', initials: 'BA' },
  'minecraft:polished_basalt': { color: '#56565a', nameFr: 'Basalte poli', nameEn: 'Polished Basalt', initials: 'PB' },
  'minecraft:blackstone': { color: '#2a242c', nameFr: 'Roche noire', nameEn: 'Blackstone', initials: 'BS' },
  'minecraft:polished_blackstone': { color: '#332c37', nameFr: 'Roche noire polie', nameEn: 'Polished Blackstone', initials: 'PB' },
  'minecraft:polished_blackstone_bricks': { color: '#2d2631', nameFr: 'Briques de roche noire polie', nameEn: 'Polished Blackstone Bricks', initials: 'BB' },
  'minecraft:glowstone': { color: '#ad7e3e', nameFr: 'Pierre lumineuse', nameEn: 'Glowstone', initials: 'GS' },
  'minecraft:shroomlight': { color: '#f09146', nameFr: 'Campanule lumineuse', nameEn: 'Shroomlight', initials: 'SL' },
  'minecraft:sea_lantern': { color: '#accdcb', nameFr: 'Lanterne aquatique', nameEn: 'Sea Lantern', initials: 'SL' },

  // Wool & Colors
  'minecraft:white_wool': { color: '#e9ecec', nameFr: 'Laine blanche', nameEn: 'White Wool', initials: 'WW' },
  'minecraft:orange_wool': { color: '#f07613', nameFr: 'Laine orange', nameEn: 'Orange Wool', initials: 'OW' },
  'minecraft:magenta_wool': { color: '#bd44b3', nameFr: 'Laine magenta', nameEn: 'Magenta Wool', initials: 'MW' },
  'minecraft:light_blue_wool': { color: '#3aaad8', nameFr: 'Laine bleu clair', nameEn: 'Light Blue Wool', initials: 'LW' },
  'minecraft:yellow_wool': { color: '#f8c527', nameFr: 'Laine jaune', nameEn: 'Yellow Wool', initials: 'YW' },
  'minecraft:lime_wool': { color: '#70b919', nameFr: 'Laine vert clair', nameEn: 'Lime Wool', initials: 'LW' },
  'minecraft:pink_wool': { color: '#ed8dac', nameFr: 'Laine rose', nameEn: 'Pink Wool', initials: 'PW' },
  'minecraft:gray_wool': { color: '#3e4447', nameFr: 'Laine grise', nameEn: 'Gray Wool', initials: 'GW' },
  'minecraft:light_gray_wool': { color: '#8e8e86', nameFr: 'Laine gris clair', nameEn: 'Light Gray Wool', initials: 'LG' },
  'minecraft:cyan_wool': { color: '#158991', nameFr: 'Laine cyan', nameEn: 'Cyan Wool', initials: 'CW' },
  'minecraft:purple_wool': { color: '#792aac', nameFr: 'Laine violette', nameEn: 'Purple Wool', initials: 'PW' },
  'minecraft:blue_wool': { color: '#35399d', nameFr: 'Laine bleue', nameEn: 'Blue Wool', initials: 'BW' },
  'minecraft:brown_wool': { color: '#724728', nameFr: 'Laine marron', nameEn: 'Brown Wool', initials: 'BW' },
  'minecraft:green_wool': { color: '#546d1b', nameFr: 'Laine verte', nameEn: 'Green Wool', initials: 'GW' },
  'minecraft:red_wool': { color: '#a12722', nameFr: 'Laine rouge', nameEn: 'Red Wool', initials: 'RW' },
  'minecraft:black_wool': { color: '#141519', nameFr: 'Laine noire', nameEn: 'Black Wool', initials: 'BW' },

  // Redstone & Utility
  'minecraft:redstone_wire': { color: '#aa1109', nameFr: 'Poudre de redstone', nameEn: 'Redstone Wire', initials: 'RS' },
  'minecraft:redstone_torch': { color: '#ff2200', nameFr: 'Torche de redstone', nameEn: 'Redstone Torch', initials: 'RT' },
  'minecraft:repeater': { color: '#a0a0a0', nameFr: 'Répéteur de redstone', nameEn: 'Redstone Repeater', initials: 'RP' },
  'minecraft:comparator': { color: '#a8a8a8', nameFr: 'Comparateur de redstone', nameEn: 'Redstone Comparator', initials: 'CP' },
  'minecraft:target': { color: '#e5dcd6', nameFr: 'Cible', nameEn: 'Target', initials: 'TG' },
  'minecraft:lever': { color: '#564434', nameFr: 'Levier', nameEn: 'Lever', initials: 'LV' },
  'minecraft:piston': { color: '#97825b', nameFr: 'Piston', nameEn: 'Piston', initials: 'PI' },
  'minecraft:sticky_piston': { color: '#73954f', nameFr: 'Piston collant', nameEn: 'Sticky Piston', initials: 'SP' },
  'minecraft:observer': { color: '#5b5b5c', nameFr: 'Observateur', nameEn: 'Observer', initials: 'OB' },
  'minecraft:hopper': { color: '#4b4b4b', nameFr: 'Entonnoir', nameEn: 'Hopper', initials: 'HP' },
  'minecraft:dispenser': { color: '#707070', nameFr: 'Distributeur', nameEn: 'Dispenser', initials: 'DP' },
  'minecraft:dropper': { color: '#747474', nameFr: 'Dropper', nameEn: 'Dropper', initials: 'DR' },
  'minecraft:crafting_table': { color: '#7d5c36', nameFr: 'Établi', nameEn: 'Crafting Table', initials: 'CT' },
  'minecraft:furnace': { color: '#6d6d6d', nameFr: 'Fourneau', nameEn: 'Furnace', initials: 'FN' },
  'minecraft:blast_furnace': { color: '#4b4b4d', nameFr: 'Haut fourneau', nameEn: 'Blast Furnace', initials: 'BF' },
  'minecraft:smoker': { color: '#524335', nameFr: 'Fumoir', nameEn: 'Smoker', initials: 'SM' },
  'minecraft:chest': { color: '#88622c', nameFr: 'Coffre', nameEn: 'Chest', initials: 'CH' },
  'minecraft:trapped_chest': { color: '#895e26', nameFr: 'Coffre piégé', nameEn: 'Trapped Chest', initials: 'TC' },
  'minecraft:barrel': { color: '#87653b', nameFr: 'Tonneau', nameEn: 'Barrel', initials: 'BR' },
  'minecraft:bookshelf': { color: '#725533', nameFr: 'Bibliothèque', nameEn: 'Bookshelf', initials: 'BS' },
  'minecraft:enchanting_table': { color: '#7a2228', nameFr: 'Table d’enchantement', nameEn: 'Enchanting Table', initials: 'ET' },
  'minecraft:anvil': { color: '#434343', nameFr: 'Enclume', nameEn: 'Anvil', initials: 'AN' },
  'minecraft:beacon': { color: '#55bbaa', nameFr: 'Balise', nameEn: 'Beacon', initials: 'BC' },
  'minecraft:torch': { color: '#ffd24c', nameFr: 'Torche', nameEn: 'Torch', initials: 'TC' },
  'minecraft:lantern': { color: '#4f5053', nameFr: 'Lanterne', nameEn: 'Lantern', initials: 'LT' },
  'minecraft:soul_lantern': { color: '#45565f', nameFr: 'Lanterne des âmes', nameEn: 'Soul Lantern', initials: 'SL' },

  // Water & Fluids
  'minecraft:water': { color: '#2c5be8', nameFr: 'Eau', nameEn: 'Water', initials: 'W' },
  'minecraft:lava': { color: '#d94b0d', nameFr: 'Lave', nameEn: 'Lava', initials: 'L' },

  // Air
  'minecraft:air': { color: '#00000000', nameFr: 'Air', nameEn: 'Air', initials: '' },
  'minecraft:cave_air': { color: '#00000000', nameFr: 'Air de caverne', nameEn: 'Cave Air', initials: '' },
  'minecraft:void_air': { color: '#00000000', nameFr: 'Air du vide', nameEn: 'Void Air', initials: '' },
};

/**
 * Returns visual metadata for a block, with procedural fallback if unknown.
 */
export function getBlockVisualMeta(blockId: string): BlockVisualMeta {
  const cleanId = blockId.split('[')[0];

  if (BLOCK_META_MAP[cleanId]) {
    return BLOCK_META_MAP[cleanId];
  }

  // Derive initials and consistent color from hash
  const shortName = cleanId.replace(/^minecraft:/, '');
  const parts = shortName.split('_');
  const initials = parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : shortName.slice(0, 2).toUpperCase();

  // Consistent color hash
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) {
    hash = cleanId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const color = `hsl(${hue}, 45%, 45%)`;

  const nameEn = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

  return {
    color,
    nameFr: nameEn,
    nameEn,
    initials,
  };
}
