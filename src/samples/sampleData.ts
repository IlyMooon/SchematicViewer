import type { NormalizedSchematic, BOMItem } from '../types/schematic';
import { formatBlockName } from '../parsers/legacySchematic';

function createNormalized(
  name: string,
  format: 'schem' | 'schematic' | 'litematic',
  width: number,
  height: number,
  length: number,
  grid: string[][][],
  author: string,
  description: string
): NormalizedSchematic {
  const counts = new Map<string, number>();
  const paletteSet = new Set<string>();
  paletteSet.add('minecraft:air');
  let totalSolidBlocks = 0;

  for (let y = 0; y < height; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        const id = grid[y][z][x] || 'minecraft:air';
        paletteSet.add(id);
        const baseId = id.split('[')[0];
        if (
          baseId !== 'minecraft:air' &&
          baseId !== 'minecraft:cave_air' &&
          baseId !== 'minecraft:void_air'
        ) {
          totalSolidBlocks++;
          counts.set(baseId, (counts.get(baseId) || 0) + 1);
        }
      }
    }
  }

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
    name,
    format,
    width,
    height,
    length,
    totalBlocks: width * height * length,
    totalSolidBlocks,
    grid,
    palette: Array.from(paletteSet),
    materials,
    metadata: {
      name,
      format,
      author,
      description,
    },
  };
}

/**
 * 1. Cozy Oak House (.schem format)
 */
export function getSampleOakHouse(): NormalizedSchematic {
  const W = 7, H = 6, L = 7;
  const grid: string[][][] = Array.from({ length: H }, () =>
    Array.from({ length: L }, () => new Array(W).fill('minecraft:air'))
  );

  // Y=0: Floor
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W - 1 || z === 0 || z === L - 1) {
        grid[0][z][x] = 'minecraft:cobblestone';
      } else {
        grid[0][z][x] = 'minecraft:oak_planks';
      }
    }
  }

  // Y=1: Walls and furniture
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === L - 1);
      const isWall = x === 0 || x === W - 1 || z === 0 || z === L - 1;

      if (isCorner) {
        grid[1][z][x] = 'minecraft:oak_log';
      } else if (isWall) {
        // Door opening at x=3, z=0
        if (x === 3 && z === 0) {
          grid[1][z][x] = 'minecraft:oak_door';
        } else {
          grid[1][z][x] = 'minecraft:oak_planks';
        }
      }
    }
  }
  // Furniture
  grid[1][5][1] = 'minecraft:crafting_table';
  grid[1][5][2] = 'minecraft:furnace';
  grid[1][1][5] = 'minecraft:chest';
  grid[1][1][4] = 'minecraft:red_bed';

  // Y=2: Walls, Windows and Torches
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === L - 1);
      const isWall = x === 0 || x === W - 1 || z === 0 || z === L - 1;

      if (isCorner) {
        grid[2][z][x] = 'minecraft:oak_log';
      } else if (isWall) {
        // Windows
        if ((z === 3 && (x === 0 || x === W - 1)) || (x === 3 && z === L - 1)) {
          grid[2][z][x] = 'minecraft:glass_pane';
        } else if (x === 3 && z === 0) {
          grid[2][z][x] = 'minecraft:air'; // Door upper
        } else {
          grid[2][z][x] = 'minecraft:oak_planks';
        }
      }
    }
  }
  grid[2][1][1] = 'minecraft:torch';
  grid[2][5][5] = 'minecraft:torch';

  // Y=3: Ceiling & Top beam
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      const isCorner = (x === 0 || x === W - 1) && (z === 0 || z === L - 1);
      const isWall = x === 0 || x === W - 1 || z === 0 || z === L - 1;

      if (isCorner || isWall) {
        grid[3][z][x] = 'minecraft:oak_log';
      } else {
        grid[3][z][x] = 'minecraft:oak_planks';
      }
    }
  }

  // Y=4: Roof border
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      if (x === 0 || x === W - 1 || z === 0 || z === L - 1) {
        grid[4][z][x] = 'minecraft:stone_bricks';
      } else if (x === 1 || x === W - 2 || z === 1 || z === L - 2) {
        grid[4][z][x] = 'minecraft:oak_planks';
      }
    }
  }

  // Y=5: Roof peak
  for (let z = 2; z <= 4; z++) {
    for (let x = 2; x <= 4; x++) {
      grid[5][z][x] = 'minecraft:stone_brick_slab';
    }
  }

  return createNormalized(
    'Maison en chêne',
    'schem',
    W,
    H,
    L,
    grid,
    'SpongeBuilder',
    'Petite maisonnette en bois avec mobilier complet et toit biseauté'
  );
}

/**
 * 2. Medieval Watchtower (.schematic format)
 */
export function getSampleMedievalTower(): NormalizedSchematic {
  const W = 5, H = 9, L = 5;
  const grid: string[][][] = Array.from({ length: H }, () =>
    Array.from({ length: L }, () => new Array(W).fill('minecraft:air'))
  );

  // Y=0: Base
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      grid[0][z][x] = (x === 0 || x === W - 1 || z === 0 || z === L - 1)
        ? 'minecraft:cobblestone'
        : 'minecraft:stone_bricks';
    }
  }

  // Y=1 to Y=5: Tower shaft
  for (let y = 1; y <= 5; y++) {
    for (let z = 0; z < L; z++) {
      for (let x = 0; x < W; x++) {
        const isWall = x === 0 || x === W - 1 || z === 0 || z === L - 1;
        if (isWall) {
          // Door opening at y=1,2, x=2, z=0
          if ((y === 1 || y === 2) && x === 2 && z === 0) {
            grid[y][z][x] = 'minecraft:air';
          } else if (y === 3 && ((x === 2 && (z === 0 || z === L - 1)) || (z === 2 && (x === 0 || x === W - 1)))) {
            // Arrow slits
            grid[y][z][x] = 'minecraft:iron_bars';
          } else {
            grid[y][z][x] = (y + x + z) % 4 === 0 ? 'minecraft:mossy_stone_bricks' : 'minecraft:stone_bricks';
          }
        }
      }
    }
    // Ladder in corner
    grid[y][1][1] = 'minecraft:ladder';
  }

  // Y=6: Platform floor
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      if (x === 1 && z === 1) {
        grid[6][z][x] = 'minecraft:air'; // Ladder trapdoor
      } else {
        grid[6][z][x] = 'minecraft:oak_planks';
      }
    }
  }

  // Y=7: Battlements lower
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      const isEdge = x === 0 || x === W - 1 || z === 0 || z === L - 1;
      if (isEdge) {
        grid[7][z][x] = 'minecraft:cobblestone_wall';
      }
    }
  }

  // Y=8: Crenellations & Torches
  grid[8][0][0] = 'minecraft:torch';
  grid[8][0][W - 1] = 'minecraft:torch';
  grid[8][L - 1][0] = 'minecraft:torch';
  grid[8][L - 1][W - 1] = 'minecraft:torch';

  return createNormalized(
    'Tour médiévale',
    'schematic',
    W,
    H,
    L,
    grid,
    'MCEditMaster',
    'Tour de guet médiévale fortifiée avec créneaux et meurtrières'
  );
}

/**
 * 3. Sacred Beacon (.litematic format)
 */
export function getSampleSacredBeacon(): NormalizedSchematic {
  const W = 7, H = 8, L = 7;
  const grid: string[][][] = Array.from({ length: H }, () =>
    Array.from({ length: L }, () => new Array(W).fill('minecraft:air'))
  );

  // Y=0: Base 7x7 Netherite & Crying Obsidian
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      if ((x === 0 || x === W - 1) && (z === 0 || z === L - 1)) {
        grid[0][z][x] = 'minecraft:crying_obsidian';
      } else {
        grid[0][z][x] = 'minecraft:netherite_block';
      }
    }
  }

  // Y=1: 5x5 Diamond & Sea Lanterns
  for (let z = 1; z <= 5; z++) {
    for (let x = 1; x <= 5; x++) {
      if ((x === 1 || x === 5) && (z === 1 || z === 5)) {
        grid[1][z][x] = 'minecraft:sea_lantern';
      } else {
        grid[1][z][x] = 'minecraft:diamond_block';
      }
    }
  }

  // Y=2: 3x3 Gold blocks
  for (let z = 2; z <= 4; z++) {
    for (let x = 2; x <= 4; x++) {
      grid[2][z][x] = 'minecraft:gold_block';
    }
  }

  // Y=3: Emerald & Center Beacon
  for (let z = 2; z <= 4; z++) {
    for (let x = 2; x <= 4; x++) {
      if (x === 3 && z === 3) {
        grid[3][z][x] = 'minecraft:beacon';
      } else {
        grid[3][z][x] = 'minecraft:emerald_block';
      }
    }
  }

  // Corner pillars (Polished blackstone & End rods)
  for (let y = 1; y <= 6; y++) {
    grid[y][0][0] = 'minecraft:polished_blackstone_bricks';
    grid[y][0][W - 1] = 'minecraft:polished_blackstone_bricks';
    grid[y][L - 1][0] = 'minecraft:polished_blackstone_bricks';
    grid[y][L - 1][W - 1] = 'minecraft:polished_blackstone_bricks';
  }
  grid[7][0][0] = 'minecraft:lantern';
  grid[7][0][W - 1] = 'minecraft:lantern';
  grid[7][L - 1][0] = 'minecraft:lantern';
  grid[7][L - 1][W - 1] = 'minecraft:lantern';

  // Light beam (Glass)
  for (let y = 4; y < H; y++) {
    grid[y][3][3] = 'minecraft:cyan_stained_glass';
  }

  return createNormalized(
    'Balise cérémoniale',
    'litematic',
    W,
    H,
    L,
    grid,
    'LitematicaArchitect',
    'Pyramide de balise quadri-niveau avec piliers de roche noire et lanterne'
  );
}
