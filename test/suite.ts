import assert from 'node:assert';
import { parseLegacySchematic } from '../src/parsers/legacySchematic';
import { parseSpongeSchematic } from '../src/parsers/spongeSchem';
import { parseLitematic } from '../src/parsers/litematic';
import { parseVanillaStructure } from '../src/parsers/vanillaStructure';
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

  // TEST 3: Parsing .schem Sponge v1/v2 (VarInt + Palette at root)
  console.log('3. Test: Parsing format .schem (Sponge v1/v2)');
  const spongePalette = {
    'minecraft:air': 0,
    'minecraft:stone': 1,
    'minecraft:red_wool': 2,
  };
  const blockData = new Int8Array([1, 2, 0, 0, 0, 0, 0, 0]);
  const spongeV2NBT = {
    Width: 2,
    Height: 2,
    Length: 2,
    Version: 2,
    Palette: spongePalette,
    BlockData: blockData,
  };

  const parsedSpongeV2 = parseSpongeSchematic(spongeV2NBT, 'test_sponge_v2.schem');
  assert.strictEqual(parsedSpongeV2.width, 2);
  assert.strictEqual(parsedSpongeV2.height, 2);
  assert.strictEqual(parsedSpongeV2.grid[0][0][0], 'minecraft:stone');
  assert.strictEqual(parsedSpongeV2.grid[0][0][1], 'minecraft:red_wool');
  assert.strictEqual(parsedSpongeV2.totalSolidBlocks, 2);
  console.log('   ✅ Parsing .schem Sponge v1/v2 validé.');

  // TEST 4: Parsing .schem Sponge v3 (Nested Blocks.Palette & Blocks.Data)
  console.log('4. Test: Parsing format .schem Sponge v3 (Blocks.Palette & Blocks.Data)');
  const spongeV3NBT = {
    Width: 2,
    Height: 2,
    Length: 2,
    Version: 3,
    DataVersion: 3465,
    Blocks: {
      Palette: {
        'minecraft:air': 0,
        'minecraft:deepslate': 1,
        'minecraft:emerald_block': 2,
      },
      Data: new Int8Array([1, 2, 0, 0, 0, 0, 0, 0]),
    },
  };

  const parsedSpongeV3 = parseSpongeSchematic(spongeV3NBT, 'test_sponge_v3.schem');
  assert.strictEqual(parsedSpongeV3.width, 2);
  assert.strictEqual(parsedSpongeV3.height, 2);
  assert.strictEqual(parsedSpongeV3.grid[0][0][0], 'minecraft:deepslate');
  assert.strictEqual(parsedSpongeV3.grid[0][0][1], 'minecraft:emerald_block');
  assert.strictEqual(parsedSpongeV3.totalSolidBlocks, 2);
  console.log('   ✅ Parsing .schem Sponge v3 (Blocks.Palette) résolu et validé !');

  // TEST 5: Legacy MCEdit schematic with .schem file extension
  console.log('5. Test: Fichier legacy MCEdit ayant l\'extension .schem');
  const legacyWithSchemExtNBT = {
    Width: 2,
    Height: 2,
    Length: 2,
    Materials: 'Alpha',
    Blocks: blocks,
    Data: new Int8Array(W * H * L),
  };
  const gzippedLegacy = gzipSync(await write(new NBTData(legacyWithSchemExtNBT, { name: 'Schematic' })));
  const parsedLegacySchem = await parseSchematicFile(gzippedLegacy, 'renamed_legacy.schem');
  assert.strictEqual(parsedLegacySchem.grid[0][0][0], 'minecraft:stone');
  assert.strictEqual(parsedLegacySchem.grid[0][0][1], 'minecraft:oak_planks');
  console.log('   ✅ Fichier legacy avec extension .schem correctement redirigé sans erreur Palette !');

  // TEST 6: Vanilla Minecraft Structure Template format (.nbt or renamed .schem)
  console.log('6. Test: Format Structure Template Vanilla Minecraft');
  const vanillaStructureNBT = {
    size: [2, 2, 2],
    palette: [
      { Name: 'minecraft:air' },
      { Name: 'minecraft:obsidian' },
      { Name: 'minecraft:gold_block' },
    ],
    blocks: [
      { pos: [0, 0, 0], state: 1 },
      { pos: [1, 0, 0], state: 2 },
    ],
  };
  const gzippedVanilla = gzipSync(await write(new NBTData(vanillaStructureNBT, { name: '' })));
  const parsedVanilla = await parseSchematicFile(gzippedVanilla, 'structure_template.schem');
  assert.strictEqual(parsedVanilla.width, 2);
  assert.strictEqual(parsedVanilla.height, 2);
  assert.strictEqual(parsedVanilla.grid[0][0][0], 'minecraft:obsidian');
  assert.strictEqual(parsedVanilla.grid[0][0][1], 'minecraft:gold_block');
  assert.strictEqual(parsedVanilla.totalSolidBlocks, 2);
  console.log('   ✅ Format Structure Vanilla (.nbt / .schem) supporté et validé !');

  // TEST 7: Parsing .litematic (BigInt Bit-unpacking)
  console.log('7. Test: Parsing format .litematic (Litematica)');
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

  // TEST 8: Stack and Shulker calculations
  console.log('8. Test: Calculateur de Stacks et Boîtes de Shulker');
  const stoneItem = parsedSchematic.materials.find(m => m.id === 'minecraft:stone');
  assert.ok(stoneItem);
  assert.strictEqual(stoneItem.count, 1);
  assert.strictEqual(stoneItem.stacks, 0);
  assert.strictEqual(stoneItem.remainder, 1);
  console.log('   ✅ Calculateur de nomenclature validé.');

  console.log('\n🎉 TOUS LES 8 TESTS SONT PASSÉS AVEC SUCCÈS !');
}

runTestSuite().catch((err) => {
  console.error('❌ Échec des tests:', err);
  process.exit(1);
});
