export type SchematicFormat = 'schematic' | 'schem' | 'litematic';

export interface SchematicMetadata {
  name: string;
  format: SchematicFormat;
  author?: string;
  description?: string;
  minecraftDataVersion?: number;
  date?: string;
  source?: string;
}

export interface BOMItem {
  id: string; // e.g. "minecraft:oak_planks"
  displayName: string; // e.g. "Planches de chêne (Oak Planks)"
  count: number;
  stacks: number;
  remainder: number;
  shulkers?: number;
  shulkerStacksRemainder?: number;
}

export interface NormalizedSchematic {
  name: string;
  format: SchematicFormat;
  width: number;  // X axis (largeur)
  height: number; // Y axis (hauteur / couches)
  length: number; // Z axis (profondeur)
  totalBlocks: number;
  totalSolidBlocks: number;
  
  // 3D access: grid[y][z][x] -> modern block identifier string
  grid: string[][][];
  
  // Quick access helper
  palette: string[];
  
  // Bill of Materials
  materials: BOMItem[];
  
  metadata: SchematicMetadata;
}

export interface LayerStats {
  layerIndex: number; // 0-based Y
  totalBlocksInLayer: number;
  solidBlocksInLayer: number;
}
