import { getBlockVisualMeta } from './blockColors';

type TextureState = 'loading' | 'loaded' | 'error';

interface TextureEntry {
  img: HTMLImageElement | null;
  state: TextureState;
}

/**
 * High-performance texture manager with CDN streaming, memory caching,
 * and procedural pixel-art fallback rendering.
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
   * Resolves block ID to a texture name.
   * e.g. "minecraft:oak_planks" -> "oak_planks"
   */
  private cleanName(blockId: string): string {
    const raw = blockId.split('[')[0];
    return raw.replace(/^minecraft:/, '');
  }

  /**
   * CDN URLs to try for official 1.20.2 textures.
   */
  private getTextureUrls(blockId: string): string[] {
    const name = this.cleanName(blockId);
    return [
      `https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.20.2/blocks/${name}.png`,
      `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.2/blocks/${name}.png`,
    ];
  }

  /**
   * Request loading of a block texture.
   */
  public loadTexture(blockId: string): void {
    if (this.isAir(blockId)) return;

    const key = this.cleanName(blockId);
    if (this.cache.has(key)) return;

    const urls = this.getTextureUrls(blockId);
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
    const key = this.cleanName(blockId);
    if (this.proceduralCache.has(key)) {
      return this.proceduralCache.get(key)!;
    }

    const meta = getBlockVisualMeta(blockId);
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Base fill
      ctx.fillStyle = meta.color;
      ctx.fillRect(0, 0, 16, 16);

      // Subtle 3D Minecraft beveled border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 0, 1, 16);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillRect(15, 0, 1, 16);

      // Centered block initials if space permits
      if (meta.initials) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 7px Silkscreen, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Drop shadow
        ctx.fillText(meta.initials, 8.5, 9);
        // Foreground
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

    const key = this.cleanName(blockId);
    const entry = this.cache.get(key);

    ctx.save();
    if (opacity < 1.0) {
      ctx.globalAlpha = opacity;
    }

    // High quality pixelated scaling
    ctx.imageSmoothingEnabled = false;

    if (entry && entry.state === 'loaded' && entry.img) {
      ctx.drawImage(entry.img, x, y, size, size);
    } else {
      // Trigger lazy load if not requested yet
      if (!entry) {
        this.loadTexture(blockId);
      }
      // Render procedural fallback
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
    const key = this.cleanName(blockId);
    const entry = this.cache.get(key);
    if (entry && entry.state === 'loaded' && entry.img) {
      return entry.img.src;
    }
    this.loadTexture(blockId);
    return this.getProceduralTexture(blockId).toDataURL();
  }
}

export const textureManager = new TextureManager();
