import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Copy, Check, Layers, Box } from 'lucide-react';
import type { NormalizedSchematic, BOMItem } from '../../types/schematic';
import { textureManager } from '../../textures/textureManager';
import { getBlockVisualMeta } from '../../textures/blockColors';
import { formatBlockName } from '../../parsers/legacySchematic';
import './BillOfMaterials.css';

interface BillOfMaterialsProps {
  schematic: NormalizedSchematic;
  currentY: number;
}

export const BillOfMaterials: React.FC<BillOfMaterialsProps> = ({
  schematic,
  currentY,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'name'>('count');
  const [sortAsc, setSortAsc] = useState(false);
  const [scope, setScope] = useState<'all' | 'layer'>('all');
  const [copied, setCopied] = useState(false);
  const [, setTextureVersion] = useState(0);

  // Subscribe to texture load notifications to update BOM thumbnails
  React.useEffect(() => {
    const unsub = textureManager.subscribe(() => {
      setTextureVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Compute BOM based on scope (Global or Current Layer)
  const items: BOMItem[] = useMemo(() => {
    if (scope === 'all') {
      return schematic.materials;
    }

    // Compute for current layer only
    const counts = new Map<string, number>();
    const layer = schematic.grid[currentY];
    if (layer) {
      for (let z = 0; z < schematic.length; z++) {
        for (let x = 0; x < schematic.width; x++) {
          const fullBlockId = layer[z]?.[x];
          if (fullBlockId && !textureManager.isAir(fullBlockId)) {
            const baseId = fullBlockId.split('[')[0];
            counts.set(baseId, (counts.get(baseId) || 0) + 1);
          }
        }
      }
    }

    return Array.from(counts.entries()).map(([id, count]) => {
      const stacks = Math.floor(count / 64);
      const remainder = count % 64;
      const shulkers = Math.floor(stacks / 27);
      const shulkerStacksRemainder = stacks % 27;

      return {
        id,
        displayName: formatBlockName(id),
        count,
        stacks,
        remainder,
        shulkers: shulkers > 0 ? shulkers : undefined,
        shulkerStacksRemainder: shulkers > 0 ? shulkerStacksRemainder : undefined,
      };
    });
  }, [schematic, currentY, scope]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let res = items.filter((item) => {
      const meta = getBlockVisualMeta(item.id);
      return (
        item.id.toLowerCase().includes(q) ||
        item.displayName.toLowerCase().includes(q) ||
        meta.nameFr.toLowerCase().includes(q) ||
        meta.nameEn.toLowerCase().includes(q)
      );
    });

    res.sort((a, b) => {
      if (sortBy === 'count') {
        return sortAsc ? a.count - b.count : b.count - a.count;
      } else {
        return sortAsc
          ? a.displayName.localeCompare(b.displayName)
          : b.displayName.localeCompare(a.displayName);
      }
    });

    return res;
  }, [items, searchQuery, sortBy, sortAsc]);

  // Totals
  const totalBlocks = useMemo(() => {
    return filteredItems.reduce((acc, it) => acc + it.count, 0);
  }, [filteredItems]);

  const totalStacks = Math.floor(totalBlocks / 64);
  const totalRemainder = totalBlocks % 64;
  const totalShulkers = Math.floor(totalStacks / 27);
  const totalShulkerStacks = totalStacks % 27;

  // Copy BOM to clipboard
  const handleCopy = () => {
    const lines = filteredItems.map((item) => {
      const meta = getBlockVisualMeta(item.id);
      let desc = `${meta.nameFr} (${item.id}): ${item.count} blocs`;
      if (item.shulkers && item.shulkers > 0) {
        desc += ` [${item.shulkers} Shulker(s) + ${item.shulkerStacksRemainder} stacks + ${item.remainder}]`;
      } else if (item.stacks > 0) {
        desc += ` [${item.stacks} stacks + ${item.remainder}]`;
      }
      return desc;
    });

    const summary = [
      `=== Liste des Matériaux Minecraft (${scope === 'all' ? 'Structure complète' : `Couche ${currentY + 1}`}) ===`,
      `Structure: ${schematic.name} (${schematic.width}x${schematic.height}x${schematic.length})`,
      `Total blocs solides: ${totalBlocks}`,
      `Total stacks: ${totalStacks} stacks + ${totalRemainder} blocs`,
      totalShulkers > 0 ? `Total Shulkers: ${totalShulkers} boîte(s) + ${totalShulkerStacks} stacks` : '',
      '--------------------------------------------------',
      ...lines,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bom-container mc-panel">
      {/* Header */}
      <div className="bom-header">
        <div className="bom-title-wrap">
          <Box size={18} className="mc-gold-icon" />
          <h2 className="bom-title">Matériaux requis</h2>
        </div>

        {/* Scope selector */}
        <div className="bom-scope-toggle">
          <button
            className={`mc-tab ${scope === 'all' ? 'active' : ''}`}
            onClick={() => setScope('all')}
          >
            Total
          </button>
          <button
            className={`mc-tab ${scope === 'layer' ? 'active' : ''}`}
            onClick={() => setScope('layer')}
          >
            <Layers size={13} />
            Couche {currentY + 1}
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bom-summary-box">
        <div className="summary-row">
          <span>Types de blocs :</span>
          <strong>{filteredItems.length}</strong>
        </div>
        <div className="summary-row">
          <span>Total blocs :</span>
          <strong className="text-gold">{totalBlocks.toLocaleString()}</strong>
        </div>
        <div className="summary-row">
          <span>Équivalent :</span>
          <span className="summary-stack-calc">
            {totalShulkers > 0 && (
              <span className="shulker-badge">
                {totalShulkers} Shulker{totalShulkers > 1 ? 's' : ''} +{' '}
              </span>
            )}
            {totalShulkers > 0 ? totalShulkerStacks : totalStacks} stack{totalStacks > 1 ? 's' : ''}
            {totalRemainder > 0 ? ` + ${totalRemainder} bloc${totalRemainder > 1 ? 's' : ''}` : ''}
          </span>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="bom-toolbar">
        <div className="bom-search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="mc-input bom-search-input"
            placeholder="Rechercher un bloc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="mc-button icon-btn"
          onClick={() => {
            if (sortBy === 'count') {
              setSortAsc(!sortAsc);
            } else {
              setSortBy('count');
              setSortAsc(false);
            }
          }}
          title={`Trier par quantité (${sortAsc ? 'croissant' : 'décroissant'})`}
        >
          <ArrowUpDown size={14} />
        </button>

        <button
          className={`mc-button icon-btn ${copied ? 'copied-btn' : ''}`}
          onClick={handleCopy}
          title="Copier la nomenclature dans le presse-papier"
        >
          {copied ? <Check size={14} color="#55ff55" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Materials List */}
      <div className="bom-list custom-mc-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="bom-empty">Aucun bloc correspondant</div>
        ) : (
          filteredItems.map((item) => {
            const meta = getBlockVisualMeta(item.id);
            return (
              <div key={item.id} className="bom-item-row mc-slot-card">
                {/* Block Icon / Swatch */}
                <div className="bom-slot-icon">
                  <div
                    className="block-pixel-thumb"
                    style={{
                      backgroundColor: meta.color,
                      backgroundImage: `url(${textureManager.getPreviewUrl(item.id)})`,
                      backgroundSize: 'cover',
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>

                {/* Block Info */}
                <div className="bom-item-details">
                  <div className="bom-item-names">
                    <span className="bom-name-fr">{meta.nameFr}</span>
                    <span className="bom-name-en">{meta.nameEn}</span>
                  </div>

                  {/* Stack & Shulker breakdown */}
                  <div className="bom-stack-breakdown">
                    {item.shulkers && item.shulkers > 0 ? (
                      <span className="badge-shulker">
                        {item.shulkers} Shulker{item.shulkers > 1 ? 's' : ''} + {item.shulkerStacksRemainder} st. + {item.remainder}
                      </span>
                    ) : item.stacks > 0 ? (
                      <span className="badge-stacks">
                        {item.stacks} stack{item.stacks > 1 ? 's' : ''}{item.remainder > 0 ? ` + ${item.remainder}` : ''}
                      </span>
                    ) : (
                      <span className="badge-exact">{item.count} bloc{item.count > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                {/* Total count badge */}
                <div className="bom-item-count">
                  <span>{item.count.toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
