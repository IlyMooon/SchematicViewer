import assert from 'node:assert';
import { parseLegacySchematic } from '../src/parsers/legacySchematic';
import { parseSpongeSchematic } from '../src/parsers/spongeSchem';
import { parseLitematic } from '../src/parsers/litematic';
import { legacyToModernBlock } from '../src/parsers/legacyBlockMap';
import { parseSchematicFile } from '../src/parsers/unifiedParser';
import { NBTData, write } from 'nbtify';
import { gzipSync } from 'fflate';

async function runTestSuite() {
  console.log('=== LANCEMENT DE LA SUITE DE TESTS AUTOMATISÉE ===\n');

  // TEST 1: Legacy Block Mapping
  console.log('1. Test: Mappage des IDs legacy vers moderne 1.20+');
  assert.strictEqual(legacyToModernBlock(0, 0), 'minecraft:air');
  assert.strictEqual(legacyToModernBlock(1, 0), 'minecraft:stone');
  assert.strictEqual(legacyToModernBlock(1, 1), 'minecraft:granite');
  assert.strictEqual(legacyToModernBlock(5, 0), 'minecraft:oak_planks');
  assert.strictEqual(legacyToModernBlock(5, 1), 'minecraft:spruce_planks');
  assert.strictEqual(legacyToModernBlock(35, 14), 'minecraft:red_wool');
  assert.strictEqual(legacyToModernBlock(98, 0), 'minecraft:stone_bricks');
  console.log('   ✅ Mappage des blocs legacy validé avec succès.');

  // TEST 2: Parsing .schematic legacy (MCEdit)
  console.log('2. Test: Parsing format .schematic (MCEdit legacy)');
  const W = 2, H = 2, L = 2; // 8 blocks
  // Block indices: (y * L + z) * W + x
  // Let (0, 0, 0) = Stone (1), (0, 0, 1) = Oak Planks (5)
  const blocks = new Int8Array(W * H * L);
  blocks[0] = 1; // Stone
  blocks[1] = 5; // Oak Planks
  const schematicNBT = {
    Width: W,
    Height: H,
    Length: L,
    Materials: 'Alpha',
    Blocks: blocks,
    Data: new Int8Array(W * H * L),
  };

  const parsedSchematic = parseLegacySchematic(schematicNBT, 'test_build.schematic');
  assert.strictEqual(parsedSchematic.width, 2);
  assert.strictEqual(parsedSchematic.height, 2);
  assert.strictEqual(parsedSchematic.length, 2);
  assert.strictEqual(parsedSchematic.grid[0][0][0], 'minecraft:stone');
  assert.strictEqual(parsedSchematic.grid[0][0][1], 'minecraft:oak_planks');
  assert.strictEqual(parsedSchematic.totalSolidBlocks, 2);
  console.log('   ✅ Parsing .schematic legacy et normalisation 3D grid validés.');

  // TEST 3: Parsing .schem Sponge (VarInt + Palette)
  console.log('3. Test: Parsing format .schem (Sponge v1/v2/v3)');
  // Palette: air=0, stone=1, red_wool=2
  const spongePalette = {
    'minecraft:air': 0,
    'minecraft:stone': 1,
    'minecraft:red_wool': 2,
  };
  // Sponge index = x + z*width + y*width*length
  // For 2x2x2: 8 blocks
  // Block 0: x=0, z=0, y=0 -> 1 (stone)
  // Block 1: x=1, z=0, y=0 -> 2 (red_wool)
  // Others: 0 (air)
  // VarInt byte encoding: 1, 2, 0, 0, 0, 0, 0, 0
  const blockData = new Int8Array([1, 2, 0, 0, 0, 0, 0, 0]);
  const spongeNBT = {
    Width: 2,
    Height: 2,
    Length: 2,
    Version: 2,
    Palette: spongePalette,
    BlockData: blockData,
  };

  const parsedSponge = parseSpongeSchematic(spongeNBT, 'test_sponge.schem');
  assert.strictEqual(parsedSponge.width, 2);
  assert.strictEqual(parsedSponge.height, 2);
  assert.strictEqual(parsedSponge.grid[0][0][0], 'minecraft:stone');
  assert.strictEqual(parsedSponge.grid[0][0][1], 'minecraft:red_wool');
  assert.strictEqual(parsedSponge.totalSolidBlocks, 2);
  console.log('   ✅ Parsing .schem Sponge et décodage VarInt validés.');

  // TEST 4: Parsing .litematic (BigInt Bit-unpacking)
  console.log('4. Test: Parsing format .litematic (Litematica)');
  // Palette: 0=air, 1=diamond_block, 2=gold_block
  // Palette size = 3 -> bitsPerBlock = Math.max(2, ceil(log2(3))) = 2 bits
  // 8 blocks for 2x2x2 volume
  // Block 0: 1 (diamond), Block 1: 2 (gold), rest 0
  // Packed 64-bit BigInt: (1n) | (2n << 2n) = 1 | 8 = 9n
  const litematicNBT = {
    MinecraftDataVersion: 3465,
    Metadata: {
      Name: 'Test Litematic',
      EnclosingSize: { x: 2, y: 2, z: 2 },
    },
    Regions: {
      Main: {
        Position: { x: 0, y: 0, z: 0 },
        Size: { x: 2, y: 2, z: 2 },
        BlockStatePalette: [
          { Name: 'minecraft:air' },
          { Name: 'minecraft:diamond_block' },
          { Name: 'minecraft:gold_block' },
        ],
        BlockStates: [9n], // 64-bit packed long
      },
    },
  };

  const parsedLitematic = parseLitematic(litematicNBT, 'test_litematic.litematic');
  assert.strictEqual(parsedLitematic.width, 2);
  assert.strictEqual(parsedLitematic.height, 2);
  assert.strictEqual(parsedLitematic.length, 2);
  assert.strictEqual(parsedLitematic.grid[0][0][0], 'minecraft:diamond_block');
  assert.strictEqual(parsedLitematic.grid[0][0][1], 'minecraft:gold_block');
  assert.strictEqual(parsedLitematic.totalSolidBlocks, 2);
  console.log('   ✅ Parsing .litematic et décompactage binaire BigInt validés.');

  // TEST 5: Unified Parser with compressed NBT file buffer
  console.log('5. Test: Parser unifié avec décompression NBT complète');
  const nbtObj = new NBTData(spongeNBT, { name: 'Schematic' });
  const rawBytes = await write(nbtObj);
  const gzipped = gzipSync(rawBytes);

  const unifiedResult = await parseSchematicFile(gzipped, 'my_house.schem');
  assert.strictEqual(unifiedResult.format, 'schem');
  assert.strictEqual(unifiedResult.grid[0][0][0], 'minecraft:stone');
  assert.strictEqual(unifiedResult.grid[0][0][1], 'minecraft:red_wool');
  console.log('   ✅ Parser unifié et détection automatique validés.');

  // TEST 6: Stack and Shulker calculations
  console.log('6. Test: Calculateur de Stacks et Boîtes de Shulker');
  const stoneItem = unifiedResult.materials.find(m => m.id === 'minecraft:stone');
  assert.ok(stoneItem);
  assert.strictEqual(stoneItem.count, 1);
  assert.strictEqual(stoneItem.stacks, 0);
  assert.strictEqual(stoneItem.remainder, 1);
  console.log('   ✅ Calculateur de nomenclature validé.');

  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !');
}

runTestSuite().catch((err) => {
  console.error('❌ Échec des tests:', err);
  process.exit(1);
});
