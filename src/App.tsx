import React, { useState, useEffect, useCallback } from 'react';
import type { NormalizedSchematic } from './types/schematic';
import { Header } from './components/Header/Header';
import { CanvasViewer } from './components/CanvasViewer/CanvasViewer';
import { LayerControls } from './components/LayerControls/LayerControls';
import { BillOfMaterials } from './components/BillOfMaterials/BillOfMaterials';
import { parseSchematicFile } from './parsers/unifiedParser';
import { textureManager } from './textures/textureManager';
import {
  getSampleOakHouse,
  getSampleMedievalTower,
  getSampleSacredBeacon,
} from './samples/sampleData';
import { AlertTriangle, X, UploadCloud } from 'lucide-react';
import './App.css';

export const App: React.FC = () => {
  // Start with Oak House demo immediately loaded
  const [schematic, setSchematic] = useState<NormalizedSchematic>(getSampleOakHouse());
  const [currentY, setCurrentY] = useState<number>(0);
  const [showGhostLayer, setShowGhostLayer] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Preload textures whenever schematic changes
  useEffect(() => {
    if (schematic) {
      textureManager.preload(schematic.palette);
      // Reset layer Y to 0 or 1
      setCurrentY(0);
      setResetTrigger((prev) => prev + 1);
    }
  }, [schematic]);

  // Handle uploaded file (File object from input or drop)
  const handleProcessFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parseSchematicFile(buffer, file.name);
      setSchematic(parsed);
      setCurrentY(0);
      setResetTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Erreur lors du parsing du schematic:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Impossible de lire le fichier de schematic. Assurez-vous qu’il s’agit d’un format .schem, .schematic ou .litematic valide.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle sample selection
  const handleLoadSample = (sampleKey: 'house_schem' | 'tower_schematic' | 'beacon_litematic') => {
    if (sampleKey === 'house_schem') {
      setSchematic(getSampleOakHouse());
    } else if (sampleKey === 'tower_schematic') {
      setSchematic(getSampleMedievalTower());
    } else if (sampleKey === 'beacon_litematic') {
      setSchematic(getSampleSacredBeacon());
    }
    setCurrentY(0);
    setResetTrigger((prev) => prev + 1);
  };

  // Drag and drop listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only deactivate if leaving outer window
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  return (
    <div
      className="minecraft-app"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <Header
        schematic={schematic}
        onFileUpload={handleProcessFile}
        onLoadSample={handleLoadSample}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="main-viewport">
        {/* Center: Canvas Viewer + Bottom Layer Navigation */}
        <section className="viewer-section">
          <div className="canvas-wrapper">
            <CanvasViewer
              schematic={schematic}
              currentY={currentY}
              showGhostLayer={showGhostLayer}
              showGrid={showGrid}
              zoom={zoom}
              onZoomChange={setZoom}
              onResetView={() => setResetTrigger((prev) => prev + 1)}
              resetTrigger={resetTrigger}
            />
          </div>

          <LayerControls
            currentY={currentY}
            height={schematic.height}
            onLayerChange={setCurrentY}
            showGhostLayer={showGhostLayer}
            onToggleGhostLayer={() => setShowGhostLayer((prev) => !prev)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((prev) => !prev)}
            zoom={zoom}
            onZoomChange={setZoom}
            onResetView={() => setResetTrigger((prev) => prev + 1)}
          />
        </section>

        {/* Right Sidebar: Bill of Materials */}
        <aside className="sidebar-section">
          <BillOfMaterials
            schematic={schematic}
            currentY={currentY}
          />
        </aside>
      </main>

      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-modal mc-panel">
            <UploadCloud size={48} className="drag-icon" />
            <h3 className="drag-title">Déposez votre schematic Minecraft</h3>
            <p className="drag-subtitle">Formats supportés : .schem, .schematic, .litematic</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="error-modal-backdrop">
          <div className="error-dialog mc-panel">
            <div className="error-dialog-header">
              <div className="error-title-wrap">
                <AlertTriangle size={18} color="#ff5555" />
                <span>Erreur d'importation</span>
              </div>
              <button
                className="mc-button icon-btn small"
                onClick={() => setErrorMessage(null)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="error-dialog-body">
              <p>{errorMessage}</p>
            </div>
            <div className="error-dialog-footer">
              <button
                className="mc-button primary-btn"
                onClick={() => setErrorMessage(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
