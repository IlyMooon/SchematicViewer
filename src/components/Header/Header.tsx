import React, { useRef } from 'react';
import { Upload, Layers } from 'lucide-react';
import type { NormalizedSchematic } from '../../types/schematic';
import './Header.css';

interface HeaderProps {
  schematic: NormalizedSchematic | null;
  onFileUpload: (file: File) => void;
  onLoadSample: (sampleKey: 'house_schem' | 'tower_schematic' | 'beacon_litematic') => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  schematic,
  onFileUpload,
  onLoadSample,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // Reset input value so same file can be re-uploaded if desired
      e.target.value = '';
    }
  };

  return (
    <header className="mc-header">
      {/* Brand / Logo */}
      <div className="header-brand">
        <div className="mc-logo-cube">
          <div className="cube-face top" />
          <div className="cube-face front" />
          <div className="cube-face right" />
        </div>
        <div className="brand-text">
          <h1 className="mc-title">SCHEMATIC VIEWER</h1>
          <span className="mc-subtitle">Édition Web 2D • .schem • .schematic • .litematic</span>
        </div>
      </div>

      {/* Schematic Stats Badge */}
      {schematic && (
        <div className="schematic-stats-bar">
          <div className="stat-pill">
            <span className="stat-label">FICHIER :</span>
            <span className="stat-value name" title={schematic.name}>
              {schematic.name}
            </span>
          </div>

          <div className="stat-pill">
            <span className="stat-badge format-badge">{schematic.format.toUpperCase()}</span>
          </div>

          <div className="stat-pill">
            <Layers size={13} className="stat-icon" />
            <span className="stat-value">
              {schematic.width} × {schematic.height} × {schematic.length}
            </span>
          </div>

          <div className="stat-pill">
            <span className="stat-label">BLOCS :</span>
            <span className="stat-value gold">
              {schematic.totalSolidBlocks.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Actions: Import & Samples */}
      <div className="header-actions">
        {/* Sample Schematics Dropdown */}
        <div className="sample-select-wrapper">
          <select
            className="mc-select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value as any;
              if (val) {
                onLoadSample(val);
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>
              ⚡ Charger un exemple...
            </option>
            <option value="house_schem">Maison en chêne (.schem)</option>
            <option value="tower_schematic">Tour médiévale (.schematic)</option>
            <option value="beacon_litematic">Balise cérémoniale (.litematic)</option>
          </select>
        </div>

        {/* Download Samples Dropdown */}
        <div className="sample-select-wrapper">
          <select
            className="mc-select"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const link = document.createElement('a');
                link.href = val;
                link.download = val.split('/').pop() || 'sample';
                link.click();
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>
              💾 Télécharger un .schem/.schematic/.litematic...
            </option>
            <option value="/samples/maison_chene.schem">Télécharger maison_chene.schem</option>
            <option value="/samples/tour_medievale.schematic">Télécharger tour_medievale.schematic</option>
            <option value="/samples/balise_ceremoniale.litematic">Télécharger balise_ceremoniale.litematic</option>
          </select>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".schem,.schematic,.litematic"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Upload Button */}
        <button
          className="mc-button primary-btn"
          disabled={isLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          <span>{isLoading ? 'Chargement...' : 'Importer un fichier'}</span>
        </button>
      </div>
    </header>
  );
};
