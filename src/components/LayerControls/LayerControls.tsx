import React, { useEffect } from 'react';
import { ChevronUp, ChevronDown, Eye, Grid, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import './LayerControls.css';

interface LayerControlsProps {
  currentY: number;
  height: number;
  onLayerChange: (newY: number) => void;
  showGhostLayer: boolean;
  onToggleGhostLayer: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onResetView: () => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  currentY,
  height,
  onLayerChange,
  showGhostLayer,
  onToggleGhostLayer,
  showGrid,
  onToggleGrid,
  zoom,
  onZoomChange,
  onResetView,
}) => {
  const canGoPrev = currentY > 0;
  const canGoNext = currentY < height - 1;

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if focus is in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'e' || e.key === 'E' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (currentY < height - 1) {
          onLayerChange(currentY + 1);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentY > 0) {
          onLayerChange(currentY - 1);
        }
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onToggleGhostLayer();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onResetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentY, height, onLayerChange, onToggleGhostLayer, onResetView]);

  return (
    <div className="layer-controls-panel mc-panel">
      {/* Layer Navigation Group */}
      <div className="layer-nav-section">
        <button
          className="mc-button icon-btn"
          disabled={!canGoPrev}
          onClick={() => onLayerChange(currentY - 1)}
          title="Couche inférieure (Touche A ou Bas)"
        >
          <ChevronDown size={16} />
        </button>

        <div className="layer-indicator">
          <span className="layer-label">COUCHE</span>
          <span className="layer-numbers">
            <strong>{currentY + 1}</strong> / {height}
          </span>
          <span className="layer-y-coord">(Y = {currentY})</span>
        </div>

        <button
          className="mc-button icon-btn"
          disabled={!canGoNext}
          onClick={() => onLayerChange(currentY + 1)}
          title="Couche supérieure (Touche E ou Haut)"
        >
          <ChevronUp size={16} />
        </button>
      </div>

      {/* Scrubbing Slider */}
      <div className="layer-slider-container">
        <input
          type="range"
          min={0}
          max={Math.max(0, height - 1)}
          value={currentY}
          onChange={(e) => onLayerChange(Number(e.target.value))}
          className="mc-slider"
          aria-label="Sélectionner la couche Y"
        />
        <div className="slider-ticks">
          <span>Y=0</span>
          <span>Y={Math.max(0, height - 1)}</span>
        </div>
      </div>

      {/* Visual Toggles & Zoom Group */}
      <div className="layer-toggles-section">
        {/* Ghost Layer Toggle */}
        <button
          className={`mc-toggle-button ${showGhostLayer ? 'active' : ''}`}
          onClick={onToggleGhostLayer}
          title="Afficher la couche sous-jacente en transparence (Touche G)"
        >
          <Eye size={15} />
          <span>Ghost Layer (Y-1)</span>
        </button>

        {/* Grid Lines Toggle */}
        <button
          className={`mc-toggle-button ${showGrid ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Afficher le quadrillage des blocs"
        >
          <Grid size={15} />
          <span>Grille</span>
        </button>

        {/* Zoom Controls */}
        <div className="zoom-actions">
          <button
            className="mc-button icon-btn small"
            onClick={() => onZoomChange(Math.max(zoom * 0.8, 0.2))}
            title="Zoom arrière"
          >
            <ZoomOut size={14} />
          </button>
          <span className="zoom-level-badge">{Math.round(zoom * 100)}%</span>
          <button
            className="mc-button icon-btn small"
            onClick={() => onZoomChange(Math.min(zoom * 1.25, 8.0))}
            title="Zoom avant"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className="mc-button icon-btn small"
            onClick={onResetView}
            title="Centrer la vue (Touche R)"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
