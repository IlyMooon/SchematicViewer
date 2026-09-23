import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { NormalizedSchematic } from '../../types/schematic';
import { textureManager } from '../../textures/textureManager';
import { getBlockVisualMeta } from '../../textures/blockColors';
import './CanvasViewer.css';

interface CanvasViewerProps {
  schematic: NormalizedSchematic;
  currentY: number;
  showGhostLayer: boolean;
  showGrid: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onResetView: () => void;
  resetTrigger: number;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({
  schematic,
  currentY,
  showGhostLayer,
  showGrid,
  zoom,
  onZoomChange,
  resetTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan offsets (in screen pixels)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hover state
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    z: number;
    blockId: string;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Base cell size at 1x zoom (32px looks great for pixel art)
  const BASE_CELL_SIZE = 32;

  // Fit to screen and center schematic
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !schematic) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const margin = 48;
    const availWidth = Math.max(100, clientWidth - margin * 2);
    const availHeight = Math.max(100, clientHeight - margin * 2);

    const fullWidthPx = schematic.width * BASE_CELL_SIZE;
    const fullLengthPx = schematic.length * BASE_CELL_SIZE;

    const scaleX = availWidth / fullWidthPx;
    const scaleZ = availHeight / fullLengthPx;
    const initialZoom = Math.min(Math.max(Math.min(scaleX, scaleZ), 0.25), 3.0);

    onZoomChange(initialZoom);

    // Center schematic
    const centeredX = Math.round((clientWidth - fullWidthPx * initialZoom) / 2);
    const centeredY = Math.round((clientHeight - fullLengthPx * initialZoom) / 2);
    setPan({ x: centeredX, y: centeredY });
  }, [schematic, onZoomChange]);

  // Reset view when schematic changes or resetTrigger fires
  useEffect(() => {
    fitToScreen();
  }, [schematic, resetTrigger, fitToScreen]);

  // Subscribe to texture load notifications to repaint canvas
  useEffect(() => {
    const unsubscribe = textureManager.subscribe(() => {
      drawCanvas();
    });
    return () => unsubscribe();
  }, [schematic, currentY, showGhostLayer, showGrid, zoom, pan, hoveredCell]);

  // Main Draw Routine
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !schematic) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // Background: Dark Minecraft inventory grid background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const bgStep = 16;
    for (let x = 0; x < width; x += bgStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += bgStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const cellSize = BASE_CELL_SIZE * zoom;
    const currentLayer = schematic.grid[currentY];
    const prevLayer = currentY > 0 ? schematic.grid[currentY - 1] : null;

    // Schematic boundary background
    const schemPxWidth = schematic.width * cellSize;
    const schemPxLength = schematic.length * cellSize;

    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(pan.x, pan.y, schemPxWidth, schemPxLength);

    // 1. Draw Ghost Layer (layer Y-1) if enabled
    if (showGhostLayer && prevLayer) {
      for (let z = 0; z < schematic.length; z++) {
        for (let x = 0; x < schematic.width; x++) {
          const blockId = prevLayer[z]?.[x];
          if (blockId && !textureManager.isAir(blockId)) {
            const cellX = pan.x + x * cellSize;
            const cellY = pan.y + z * cellSize;

            // Only draw visible cells
            if (
              cellX + cellSize >= 0 &&
              cellX <= width &&
              cellY + cellSize >= 0 &&
              cellY <= height
            ) {
              textureManager.drawBlock(ctx, blockId, cellX, cellY, cellSize, 0.35);
            }
          }
        }
      }
    }

    // 2. Draw Current Active Layer (layer Y)
    if (currentLayer) {
      for (let z = 0; z < schematic.length; z++) {
        for (let x = 0; x < schematic.width; x++) {
          const blockId = currentLayer[z]?.[x];
          const cellX = pan.x + x * cellSize;
          const cellY = pan.y + z * cellSize;

          if (
            cellX + cellSize >= 0 &&
            cellX <= width &&
            cellY + cellSize >= 0 &&
            cellY <= height
          ) {
            if (blockId && !textureManager.isAir(blockId)) {
              textureManager.drawBlock(ctx, blockId, cellX, cellY, cellSize, 1.0);
            }
          }
        }
      }
    }

    // 3. Draw Grid Lines if enabled
    if (showGrid && cellSize >= 6) {
      ctx.strokeStyle = cellSize > 20 ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= schematic.width; x++) {
        const lineX = Math.floor(pan.x + x * cellSize) + 0.5;
        if (lineX >= 0 && lineX <= width) {
          ctx.beginPath();
          ctx.moveTo(lineX, Math.max(0, pan.y));
          ctx.lineTo(lineX, Math.min(height, pan.y + schemPxLength));
          ctx.stroke();
        }
      }

      // Horizontal lines
      for (let z = 0; z <= schematic.length; z++) {
        const lineY = Math.floor(pan.y + z * cellSize) + 0.5;
        if (lineY >= 0 && lineY <= height) {
          ctx.beginPath();
          ctx.moveTo(Math.max(0, pan.x), lineY);
          ctx.lineTo(Math.min(width, pan.x + schemPxWidth), lineY);
          ctx.stroke();
        }
      }
    }

    // Outer border of the schematic
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(pan.x, pan.y, schemPxWidth, schemPxLength);

    // 4. Draw Hover Highlight Box
    if (hoveredCell) {
      const hx = pan.x + hoveredCell.x * cellSize;
      const hz = pan.y + hoveredCell.z * cellSize;

      ctx.save();
      // Minecraft-style yellow-white selection box
      ctx.strokeStyle = '#ffff55';
      ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.08));
      ctx.strokeRect(hx + 1, hz + 1, cellSize - 2, cellSize - 2);

      ctx.fillStyle = 'rgba(255, 255, 85, 0.2)';
      ctx.fillRect(hx + 1, hz + 1, cellSize - 2, cellSize - 2);
      ctx.restore();
    }

    ctx.restore();
  }, [schematic, currentY, showGhostLayer, showGrid, zoom, pan, hoveredCell]);

  // Request Animation Frame / Redraw on changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  // Wheel Zoom (centered around mouse cursor)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom multiplier
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 8.0);

    // Adjust pan so the point under cursor remains fixed
    const scaleRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * scaleRatio;
    const newPanY = mouseY - (mouseY - pan.y) * scaleRatio;

    onZoomChange(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Mouse Drag / Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Left click (0) or Middle click (1)
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
      setHoveredCell(null);
      return;
    }

    // Hover detection
    const cellSize = BASE_CELL_SIZE * zoom;
    const gridX = Math.floor((mouseX - pan.x) / cellSize);
    const gridZ = Math.floor((mouseY - pan.y) / cellSize);

    if (
      gridX >= 0 &&
      gridX < schematic.width &&
      gridZ >= 0 &&
      gridZ < schematic.length
    ) {
      const blockId = schematic.grid[currentY]?.[gridZ]?.[gridX] || 'minecraft:air';
      setHoveredCell({
        x: gridX,
        z: gridZ,
        blockId,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredCell(null);
  };

  const hoveredMeta = hoveredCell ? getBlockVisualMeta(hoveredCell.blockId) : null;

  return (
    <div
      ref={containerRef}
      className="canvas-viewer-container"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className={`layer-canvas ${isDragging ? 'dragging' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      />

      {/* Floating Minecraft Tooltip */}
      {hoveredCell && hoveredMeta && (
        <div
          className="minecraft-tooltip"
          style={{
            left: `${hoveredCell.screenX + 16}px`,
            top: `${hoveredCell.screenY + 16}px`,
          }}
        >
          <div className="tooltip-header">
            <div
              className="tooltip-swatch"
              style={{
                backgroundColor: hoveredMeta.color,
                backgroundImage: `url(${textureManager.getPreviewUrl(hoveredCell.blockId)})`,
                backgroundSize: 'cover',
                imageRendering: 'pixelated',
              }}
            />
            <div className="tooltip-title-wrap">
              <span className="tooltip-name-fr">{hoveredMeta.nameFr}</span>
              <span className="tooltip-name-en">{hoveredMeta.nameEn}</span>
            </div>
          </div>

          <div className="tooltip-details">
            <div className="tooltip-row">
              <span className="tooltip-label">ID :</span>
              <span className="tooltip-val-id">{hoveredCell.blockId.replace(/^minecraft:/, '')}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">Coordonnées :</span>
              <span className="tooltip-val-coords">
                X: <strong>{hoveredCell.x}</strong> | Y: <strong>{currentY}</strong> | Z: <strong>{hoveredCell.z}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Overlay Controls: Coordinate origin tag */}
      <div className="canvas-coords-tag">
        <span>Origine: (0, {currentY}, 0)</span>
        <span>Dimensions: {schematic.width} × {schematic.length}</span>
      </div>
    </div>
  );
};
