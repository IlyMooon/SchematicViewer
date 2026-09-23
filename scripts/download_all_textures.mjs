import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('public/textures/blocks');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Fetching file list from PrismarineJS/minecraft-assets...');
  const res = await fetch('https://api.github.com/repos/PrismarineJS/minecraft-assets/git/trees/master?recursive=1');
  const tree = await res.json();

  const files26 = tree.tree
    .filter(f => f.path.startsWith('data/26.1/blocks/') && f.path.endsWith('.png'))
    .map(f => ({
      name: f.path.replace('data/26.1/blocks/', ''),
      url: `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/26.1/blocks/${f.path.replace('data/26.1/blocks/', '')}`
    }));

  const files120 = [
    { name: 'chain.png', url: 'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/chain.png' },
    { name: 'grass.png', url: 'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/grass.png' }
  ];

  const allFiles = [...files26, ...files120];
  console.log(`Found ${allFiles.length} textures to sync.`);

  // Filter out what we already have
  const toDownload = allFiles.filter(f => !fs.existsSync(path.join(outDir, f.name)));
  console.log(`Need to download ${toDownload.length} textures.`);

  const CONCURRENCY = 25;
  let downloaded = 0;
  let failed = 0;

  async function worker(items) {
    for (const item of items) {
      const dest = path.join(outDir, item.name);
      try {
        const resp = await fetch(item.url);
        if (resp.ok) {
          const buffer = Buffer.from(await resp.arrayBuffer());
          fs.writeFileSync(dest, buffer);
          downloaded++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
      if ((downloaded + failed) % 100 === 0 || (downloaded + failed) === toDownload.length) {
        process.stdout.write(`Progress: ${downloaded + failed}/${toDownload.length} (${downloaded} ok, ${failed} fail)\r`);
      }
    }
  }

  // Partition into CONCURRENCY chunks
  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  toDownload.forEach((item, index) => {
    chunks[index % CONCURRENCY].push(item);
  });

  await Promise.all(chunks.map(chunk => worker(chunk)));
  console.log(`\nDone! Successfully saved ${downloaded} textures (Failed: ${failed}). Total files in ${outDir}: ${fs.readdirSync(outDir).length}`);
}

run().catch(console.error);
