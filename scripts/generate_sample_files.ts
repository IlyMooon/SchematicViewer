import fs from 'node:fs';
import path from 'node:path';
import { NBTData, write } from 'nbtify';
import { gzipSync } from 'fflate';
import { getSampleOakHouse, getSampleMedievalTower, getSampleSacredBeacon } from '../src/samples/sampleData';

async function generate() {
  const outDir = path.resolve('public/samples');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Generate .schem (Sponge format)
  const house = getSampleOakHouse();
  const spongePalette: Record<string, number> = {};
  house.palette.forEach((id, idx) => {
    spongePalette[id] = idx;
  });

  // VarInt byte array
  const varints: number[] = [];
  const W = house.width;
  const H = house.height;
  const L = house.length;
  const total = W * H * L;

  for (let idx = 0; idx < total; idx++) {
    const x = idx % W;
    const rem = Math.floor(idx / W);
    const z = rem % L;
    const y = Math.floor(rem / L);

    const blockId = house.grid[y]?.[z]?.[x] || 'minecraft:air';
    let pId = spongePalette[blockId] ?? 0;

    // encode varint
    while (pId >= 0x80) {
      varints.push((pId & 0x7f) | 0x80);
      pId >>>= 7;
    }
    varints.push(pId);
  }

  const spongeNBT = {
    Width: W,
    Height: H,
    Length: L,
    Version: 2,
    DataVersion: 3465,
    Metadata: {
      Author: 'SpongeArchitect',
      Description: 'Maison en chêne avec mobilier et toit biseauté',
    },
    Palette: spongePalette,
    BlockData: new Int8Array(varints),
  };

  const spongeRaw = await write(new NBTData(spongeNBT, { name: 'Schematic' }));
  const spongeGzip = gzipSync(spongeRaw);
  fs.writeFileSync(path.join(outDir, 'maison_chene.schem'), spongeGzip);
  console.log('✅ Generated public/samples/maison_chene.schem');

  // 2. Generate .schematic (Legacy MCEdit format)
  const tower = getSampleMedievalTower();
  const TW = tower.width, TH = tower.height, TL = tower.length;
  const tBlocks = new Int8Array(TW * TH * TL);
  const tData = new Int8Array(TW * TH * TL);

  // Simple mapping modern -> legacy numeric
  const modernToLegacy: Record<string, number> = {
    'minecraft:air': 0,
    'minecraft:stone': 1,
    'minecraft:cobblestone': 4,
    'minecraft:oak_planks': 5,
    'minecraft:stone_bricks': 98,
    'minecraft:mossy_stone_bricks': 98,
    'minecraft:ladder': 65,
    'minecraft:iron_bars': 101,
    'minecraft:cobblestone_wall': 139,
    'minecraft:torch': 50,
  };

  for (let y = 0; y < TH; y++) {
    for (let z = 0; z < TL; z++) {
      for (let x = 0; x < TW; x++) {
        const idx = (y * TL + z) * TW + x;
        const b = tower.grid[y]?.[z]?.[x] || 'minecraft:air';
        tBlocks[idx] = modernToLegacy[b] ?? 1;
        if (b === 'minecraft:mossy_stone_bricks') {
          tData[idx] = 1; // variant data
        }
      }
    }
  }

  const schematicNBT = {
    Width: TW,
    Height: TH,
    Length: TL,
    Materials: 'Alpha',
    Blocks: tBlocks,
    Data: tData,
    Author: 'MCEditBuilder',
  };

  const schemRaw = await write(new NBTData(schematicNBT, { name: 'Schematic' }));
  const schemGzip = gzipSync(schemRaw);
  fs.writeFileSync(path.join(outDir, 'tour_medievale.schematic'), schemGzip);
  console.log('✅ Generated public/samples/tour_medievale.schematic');

  // 3. Generate .litematic
  const beacon = getSampleSacredBeacon();
  const BW = beacon.width, BH = beacon.height, BL = beacon.length;
  const bPalette = beacon.palette.map(id => ({ Name: id }));
  const bBits = Math.max(2, Math.ceil(Math.log2(bPalette.length)));
  const bLongCount = Math.ceil((BW * BH * BL * bBits) / 64);
  const bLongs = new Array(bLongCount).fill(0n);

  for (let y = 0; y < BH; y++) {
    for (let z = 0; z < BL; z++) {
      for (let x = 0; x < BW; x++) {
        const bIdx = (y * BW * BL) + (z * BW) + x;
        const blockId = beacon.grid[y]?.[z]?.[x] || 'minecraft:air';
        const pIdx = BigInt(beacon.palette.indexOf(blockId));

        const startBit = BigInt(bIdx * bBits);
        const lIdx = Number(startBit / 64n);
        const bOff = startBit % 64n;

        bLongs[lIdx] = bLongs[lIdx] | (pIdx << bOff);
        if (bOff + BigInt(bBits) > 64n && lIdx + 1 < bLongCount) {
          const bitsLeft = 64n - bOff;
          bLongs[lIdx + 1] = bLongs[lIdx + 1] | (pIdx >> bitsLeft);
        }
      }
    }
  }

  const litematicNBT = {
    Version: 5,
    MinecraftDataVersion: 3465,
    Metadata: {
      Name: 'Balise cérémoniale',
      Author: 'LitematicaArchitect',
      Description: 'Structure pyramidale cérémoniale avec balise et lanternes',
      EnclosingSize: { x: BW, y: BH, z: BL },
      TotalBlocks: beacon.totalSolidBlocks,
    },
    Regions: {
      Main: {
        Position: { x: 0, y: 0, z: 0 },
        Size: { x: BW, y: BH, z: BL },
        BlockStatePalette: bPalette,
        BlockStates: bLongs,
      },
    },
  };

  const liteRaw = await write(new NBTData(litematicNBT, { name: 'Litematica' }));
  const liteGzip = gzipSync(liteRaw);
  fs.writeFileSync(path.join(outDir, 'balise_ceremoniale.litematic'), liteGzip);
  console.log('✅ Generated public/samples/balise_ceremoniale.litematic');
}

generate().catch(console.error);
