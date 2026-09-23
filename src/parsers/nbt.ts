import { read as nbtRead, type NBTData } from 'nbtify';
import { gunzipSync, unzlibSync } from 'fflate';

/**
 * Safely parses any NBT file buffer (GZIP, ZLIB, or uncompressed raw NBT).
 */
export async function parseNBT(buffer: ArrayBuffer | Uint8Array): Promise<any> {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // 1. Try standard nbtify read
  try {
    const result = await nbtRead(bytes);
    return (result as NBTData).data ?? result;
  } catch (err) {
    // 2. Fallback: manual decompression with fflate
    try {
      // Check magic bytes: 0x1f, 0x8b = gzip
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        const decompressed = gunzipSync(bytes);
        const result = await nbtRead(decompressed);
        return (result as NBTData).data ?? result;
      }

      // Check zlib header: 0x78
      if (bytes[0] === 0x78) {
        const decompressed = unzlibSync(bytes);
        const result = await nbtRead(decompressed);
        return (result as NBTData).data ?? result;
      }
    } catch (decompError) {
      console.warn('Decompression fallback failed:', decompError);
    }

    throw new Error(`Échec de lecture NBT: ${err instanceof Error ? err.message : String(err)}`);
  }
}
