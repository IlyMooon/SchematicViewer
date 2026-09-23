<div align="center">

# 🧱 MINECRAFT SCHEMATIC VIEWER

**A high-performance, browser-native 2D layer-by-layer Minecraft structure blueprint visualizer & material calculator.**

[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Minecraft Formats](https://img.shields.io/badge/Formats-.schem%20%7C%20.schematic%20%7C%20.litematic%20%7C%20.nbt-55ff55?style=for-the-badge)](https://minecraft.wiki/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[**Live Demo**](http://localhost:5173/) • [**Features**](#-features) • [**Supported Formats**](#-supported-formats) • [**Keyboard Shortcuts**](#-keyboard-shortcuts) • [**Getting Started**](#-getting-started) • [**Server CLI**](#-server-management-script)

---

</div>

## 🌟 Overview

**Minecraft Schematic Viewer** is a client-side desktop web application designed for Minecraft builders, survival players, and server admins. It allows you to drag-and-drop any `.schem`, `.schematic`, `.litematic`, or vanilla `.nbt` structure file, instantly extract the complete Bill of Materials (converted into stacks and Shulker boxes), and view the structure layer-by-layer along the Y-axis on an interactive 2D canvas with official vanilla textures.

Everything runs **100% locally in your browser**—no server-side uploads or file size limits.

---

## ✨ Features

### 1. 🔍 Universal Multi-Format NBT Parser
- **Pure Client-Side**: GZIP and ZLIB decompression executed entirely within the browser via `fflate` and `nbtify`.
- **Content-First Heuristics**: Automatically inspects NBT byte headers, compound structures, and palettes to accurately decode files even if their file extensions were renamed.
- **Unified 3D Grid**: Normalizes all structures into a standardized `grid[y][z][x]` array with dimension bounds $(X \times Y \times Z)$.

### 2. 🗺️ Interactive 2D Layer-by-Layer Viewer (HTML5 Canvas)
- **Auto-Fit & Centering**: Dynamically calculates viewport bounds and adjusts zoom level to present any structure with comfortable padding.
- **Smooth Navigation**: Pan via middle-click or mouse drag; zoom smoothly from 0.2x to 8.0x anchored directly to the mouse cursor.
- **Ghost Layer Mode**: Displays the layer directly below ($Y - 1$) in semi-transparency ($\alpha = 0.35$), providing an essential construction reference when placing blocks in survival mode.
- **Pixel-Art Sharpness**: Rendered with `imageSmoothingEnabled = false` and CSS pixelation to preserve crisp block textures without blurry subpixel artifacts.
- **Interactive Tooltip**: Hovering over any cell highlights the block with an authentic yellow-white selection box, displaying local coordinates $(X, Y, Z)$, block name (French & English), and blockstate properties.

### 3. 🎨 Authentic Official Textures & Procedural Fallback
- **935+ Exact Vanilla Mappings**: Complete lookup dictionary covering building blocks, slabs, stairs, fences, gates, doors, trapdoors, redstone components, and utility blocks.
- **Local Offline Cache**: Top common building blocks bundled directly in `public/textures/blocks/` for instant 0ms offline rendering.
- **Dynamic CDN Streaming**: Uncached textures stream asynchronously from official PrismarineJS / jsDelivr CDNs and are cached in memory.
- **Procedural Pixel-Art Fallback**: Unknown, modded, or untextured blocks are rendered with authentic Minecraft-style 3D bevels, representative dominant color, and contrast initials.

### 4. 📦 Bill of Materials (BOM) & Inventory Calculator
- **Stack Converter**: Automatically calculates totals in standard 64-item stacks (e.g., $258 \text{ blocks} \rightarrow 4 \text{ stacks} + 2 \text{ blocks}$).
- **Shulker Box Converter**: Automatically groups quantities exceeding 27 stacks into Shulker boxes (e.g., $1,800 \text{ blocks} \rightarrow 1 \text{ Shulker box} + 1 \text{ stack} + 8 \text{ blocks}$).
- **Dual Scope Mode**: Toggle between **Global Structure** total or **Current Layer** requirements to prepare your inventory tier by tier.
- **Instant Search & Sort**: Filter by block name or ID; sort by descending count or alphabetical order.
- **Clipboard Export**: One-click copy formatted summary to clipboard for sharing in chat or external build planning.

### 5. 🎮 Vanilla Minecraft UI & Retro Art Direction
- Authentic Minecraft inventory palette: `#c6c6c6`, `#373737`, `#8b8b8b`, and `#1e1e1e`.
- Classic 3D beveled retro borders with light source highlights and inset press states.
- Embedded pixel-art typography (`Silkscreen`, `VT323`).

---

## 📁 Supported Formats

| Format | Origin | Specifications Handled |
| :--- | :--- | :--- |
| **`.schem`** | WorldEdit / Sponge / FAWE | **v1, v2, v3** supported. Reads VarInt byte streams, top-level `Palette`, and Sponge v3 nested `Blocks.Palette` / `Blocks.Data`. |
| **`.schematic`** | MCEdit Legacy | Reads legacy numeric Block IDs (0–255), metadata nibbles, and `AddBlocks` for IDs > 255; converts them to modern 1.20+ blockstates. |
| **`.litematic`** | Litematica / Fabric | Reads multiple regions, enclosing volume, and bit-packed `BlockStates` (`BigInt` bitstream traversing 64-bit boundaries). |
| **`.nbt`** | Minecraft Structure Blocks | Reads vanilla structure templates (`size: [x,y,z]`, `palette: [...]`, `blocks: [...]`). |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>E</kbd> or <kbd>↑</kbd> | Move to **Next Layer** (Y + 1) |
| <kbd>A</kbd> or <kbd>↓</kbd> | Move to **Previous Layer** (Y - 1) |
| <kbd>G</kbd> | Toggle **Ghost Layer** on/off |
| <kbd>R</kbd> | **Reset & Center View** on the canvas |
| <kbd>Scroll Wheel</kbd> | **Zoom in / Zoom out** anchored to mouse pointer |
| <kbd>Click + Drag</kbd> | **Pan** across the layer grid |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v20 & v24)
- npm v9+

### Installation

```bash
# Clone the repository
git clone https://github.com/IlyMooon/SchematicViewer.git
cd SchematicViewer

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

---

## 🖥️ Server Management Script

A standalone management script [`server.sh`](./server.sh) is provided at the root of the project to control the server lifecycle in the background:

```bash
# Start the server as a background daemon
./server.sh start

# Check server status and current port/PID
./server.sh status

# Stop the server and free the port
./server.sh stop

# Restart the server
./server.sh restart
```

*(You can also use `npm run server:start`, `npm run server:stop`, and `npm run server:status`)*.

---

## 🧪 Testing & Validation

The project includes an automated test suite verifying all 4 formats, bit-unpacking routines, VarInt decoders, and stack calculators:

```bash
npm test
```

### Test Coverage:
- ✅ Legacy block ID conversion to modern 1.20+ identifiers
- ✅ MCEdit `.schematic` legacy parsing
- ✅ Sponge `.schem` v1/v2 parsing (root palette)
- ✅ Sponge `.schem` v3 parsing (nested `Blocks.Palette` and `Blocks.Data`)
- ✅ Renamed legacy files with `.schem` extension
- ✅ Vanilla Minecraft structure templates (`.nbt` / `.schem`)
- ✅ Litematica `.litematic` bit-unpacking via 64-bit `BigInt`
- ✅ Stack & Shulker box conversion arithmetic

---

## 🏗️ Project Architecture

```
SchematicViewer/
├── public/
│   ├── samples/                 # Sample Minecraft test files (.schem, .schematic, .litematic)
│   └── textures/blocks/         # Bundled offline vanilla block textures (16x16 PNGs)
├── src/
│   ├── types/                   # Normalized schematic & BOM TypeScript interfaces
│   ├── parsers/                 # Universal client-side NBT decoders
│   │   ├── nbt.ts               # GZIP/ZLIB decompression & NBT reader
│   │   ├── legacyBlockMap.ts    # Legacy numeric ID -> modern block mapping
│   │   ├── legacySchematic.ts   # .schematic (MCEdit) parser
│   │   ├── spongeSchem.ts       # .schem (Sponge v1, v2, v3) parser
│   │   ├── litematic.ts         # .litematic (Fabric) parser
│   │   ├── vanillaStructure.ts  # .nbt (Structure block) parser
│   │   └── unifiedParser.ts     # Content auto-detector & normalizer
│   ├── textures/                # Texture management & resolution
│   │   ├── blockColors.ts       # Fallback colors, initials & FR/EN names
│   │   ├── textureMapping.ts    # 935+ block texture mappings & candidate URLs
│   │   └── textureManager.ts    # Hybrid texture cache & canvas painter
│   ├── components/              # React UI components
│   │   ├── Header/              # Navigation bar, stats & sample picker
│   │   ├── CanvasViewer/        # 2D layer canvas, pan/zoom & hover tooltip
│   │   ├── LayerControls/       # Y-axis scrubber, buttons & toggles
│   │   └── BillOfMaterials/     # Material list, stack calculator & search
│   ├── App.tsx                  # Root application coordinator
│   ├── App.css                  # Layout styling & modals
│   └── index.css                # Minecraft design system tokens
├── server.sh                    # Server start/stop/status CLI script
└── package.json
```

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
Minecraft is a trademark of Mojang Synergies AB. This project is not affiliated with Mojang or Microsoft.
