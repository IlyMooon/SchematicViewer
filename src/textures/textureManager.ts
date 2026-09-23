import { getBlockVisualMeta } from './blockColors';
import { resolveBlockTexture, getTextureCandidateUrls } from './textureMapping';

type TextureState = 'loading' | 'loaded' | 'error';

interface TextureEntry {
  img: HTMLImageElement | null;
  state: TextureState;
}

/**
 * High-performance texture manager with local caching, CDN streaming,
 * candidate fallback chains, and pixel-perfect rendering.
 */
class TextureManager {
  private cache = new Map<string, TextureEntry>();
  private proceduralCache = new Map<string, HTMLCanvasElement>();
  private listeners = new Set<() => void>();

  /**
   * Subscribe to texture load events to trigger Canvas repaints.
   */
  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Resolves block ID to a canonical texture key.
   */
  public getResolvedTextureName(blockId: string): string {
    return resolveBlockTexture(blockId);
  }

  /**
   * Returns list of candidate URLs for a block.
   */
  private getCandidateUrls(blockId: string): string[] {
    const primaryName = resolveBlockTexture(blockId);
    const urls = getTextureCandidateUrls(primaryName);

    // If block is a special variant (like stairs, slab, wall, door, bed, chest),
    // add secondary fallback URLs
    const clean = blockId.split('[')[0].replace(/^minecraft:/, '');
    if (clean.includes('chest')) {
      urls.push(...getTextureCandidateUrls('oak_planks'));
    } else if (clean.endsWith('_bed') || clean.endsWith('_carpet')) {
      urls.push(...getTextureCandidateUrls('white_wool'));
    } else if (clean.endsWith('_stairs') || clean.endsWith('_slab')) {
      urls.push(...getTextureCandidateUrls('stone'));
      urls.push(...getTextureCandidateUrls('oak_planks'));
    }

    return urls;
  }

  /**
   * Request loading of a block texture.
   */
  public loadTexture(blockId: string): void {
    if (this.isAir(blockId)) return;

    const key = this.getResolvedTextureName(blockId);
    if (this.cache.has(key)) return;

    const urls = this.getCandidateUrls(blockId);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    this.cache.set(key, { img, state: 'loading' });

    let currentUrlIdx = 0;

    const tryNextUrl = () => {
      if (currentUrlIdx < urls.length) {
        img.src = urls[currentUrlIdx++];
      } else {
        const entry = this.cache.get(key);
        if (entry) entry.state = 'error';
        this.notify();
      }
    };

    img.onload = () => {
      const entry = this.cache.get(key);
      if (entry) {
        entry.state = 'loaded';
        this.notify();
      }
    };

    img.onerror = () => {
      tryNextUrl();
    };

    tryNextUrl();
  }

  /**
   * Preload a list of block IDs.
   */
  public preload(blockIds: string[]): void {
    for (const id of blockIds) {
      this.loadTexture(id);
    }
  }

  /**
   * Returns a procedural 16x16 canvas fallback for this block.
   */
  public getProceduralTexture(blockId: string): HTMLCanvasElement {
    const key = blockId.split('[')[0].replace(/^minecraft:/, '');
    if (this.proceduralCache.has(key)) {
      return this.proceduralCache.get(key)!;
    }

    const meta = getBlockVisualMeta(blockId);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base fill with block dominant color
      ctx.fillStyle = meta.color;
      ctx.fillRect(0, 0, 16, 16);

      // Procedural pixel texture variation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(2, 2, 4, 4);
      ctx.fillRect(10, 8, 4, 4);
      ctx.fillRect(4, 11, 3, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(8, 2, 4, 3);
      ctx.fillRect(2, 8, 3, 3);

      // 3D Minecraft beveled border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(15, 0, 1, 16);

      // Centered block initials in pixel font
      if (meta.initials) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.font = 'bold 7px Silkscreen, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.initials, 8.5, 9);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(meta.initials, 8, 8.5);
      }
    }

    this.proceduralCache.set(key, canvas);
    return canvas;
  }

  /**
   * Draws a block at the specified pixel coordinates.
   */
  public drawBlock(
    ctx: CanvasRenderingContext2D,
    blockId: string,
    x: number,
    y: number,
    size: number,
    opacity: number = 1.0
  ): void {
    if (this.isAir(blockId)) return;

    const key = this.getResolvedTextureName(blockId);
    const entry = this.cache.get(key);

    ctx.save();
    if (opacity < 1.0) {
      ctx.globalAlpha = opacity;
    }

    ctx.imageSmoothingEnabled = false;

    if (entry && entry.state === 'loaded' && entry.img) {
      ctx.drawImage(entry.img, x, y, size, size);
    } else {
      // Trigger lazy load if not requested yet
      if (!entry) {
        this.loadTexture(blockId);
      }
      const proceduralCanvas = this.getProceduralTexture(blockId);
      ctx.drawImage(proceduralCanvas, x, y, size, size);
    }

    ctx.restore();
  }

  public isAir(blockId: string): boolean {
    const clean = blockId.split('[')[0];
    return clean === 'minecraft:air' || clean === 'minecraft:cave_air' || clean === 'minecraft:void_air';
  }

  /**
   * Get image source url or data uri for UI previews (e.g. BOM icons).
   */
  public getPreviewUrl(blockId: string): string {
    const key = this.getResolvedTextureName(blockId);
    const entry = this.cache.get(key);
    if (entry && entry.state === 'loaded' && entry.img) {
      return entry.img.src;
    }
    this.loadTexture(blockId);
    return this.getProceduralTexture(blockId).toDataURL();
  }
}

export const textureManager = new TextureManager();
