import React, { useState } from 'react';
import {
  Gamepad2,
  X,
  Swords,
  Shield,
  MapPin,
  Users,
  Target,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { FREE_FIRE_MODES, FreeFireModeMetadata } from '../data/modes';
import { FreeFireMode } from '../types';

interface FreeFireModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode?: (mode: FreeFireMode) => void;
}

export const FreeFireModesModal: React.FC<FreeFireModesModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'Battle Royale' | 'Clash & Tactical' | 'Duels & 1v1' | 'Arcade & Scrims'
  >('all');
  const [activeMode, setActiveMode] = useState<FreeFireModeMetadata>(FREE_FIRE_MODES[0]);

  if (!isOpen) return null;

  const categories = [
    'all',
    'Battle Royale',
    'Clash & Tactical',
    'Duels & 1v1',
    'Arcade & Scrims',
  ] as const;

  const displayedModes =
    selectedCategory === 'all'
      ? FREE_FIRE_MODES
      : FREE_FIRE_MODES.filter((m) => m.category === selectedCategory);

  return (
    <div
      id="free-fire-modes-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="free-fire-modes-modal"
        className="w-full max-w-4xl bg-[#0c0e17] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              ESPORTS COMPETITIVE CODEX
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-wide uppercase text-white">
              FREE FIRE GAME MODES ({FREE_FIRE_MODES.length})
            </h2>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-white/5 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-[#151825] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Modes (14)' : cat}
            </button>
          ))}
        </div>

        {/* Content: Left Modes List, Right Mode Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto flex-1 pr-1">
          {/* Modes List (Left Column) */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto max-h-[50vh] md:max-h-[55vh] pr-1">
            {displayedModes.map((mode) => {
              const isSelected = activeMode.mode === mode.mode;
              return (
                <div
                  key={mode.mode}
                  onClick={() => setActiveMode(mode)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-transparent border-amber-500/60 shadow-md shadow-amber-500/5'
                      : 'bg-[#111422] border-white/5 hover:border-white/20 hover:bg-[#15192c]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase text-white">
                      {mode.mode}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold uppercase ${mode.badgeColor}`}
                    >
                      {mode.shortName}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                    {mode.tagline}
                  </div>
                  <div className="flex items-center space-x-3 mt-2 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3 h-3 text-amber-500/70" />
                      <span>{mode.playersPerTeam} P / Team</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-blue-400/70" />
                      <span>{mode.recommendedMaps.length} Maps</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Mode Deep Dive (Right Column) */}
          <div className="md:col-span-7 bg-[#111422] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Mode Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-md border font-mono font-bold uppercase ${activeMode.badgeColor}`}
                >
                  {activeMode.category}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">
                  {activeMode.playersPerTeam} Players / Squad • {activeMode.teamsPerMatch} Squads
                </span>
              </div>

              <h3 className="text-xl font-black font-heading uppercase text-white">
                {activeMode.mode}
              </h3>
              <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                {activeMode.tagline}
              </p>

              <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                {activeMode.description}
              </p>

              {/* Recommended Maps */}
              <div className="mt-4">
                <div className="text-[11px] uppercase font-mono text-gray-400 font-bold mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Esports Approved Maps</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeMode.recommendedMaps.map((map) => (
                    <span
                      key={map}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-semibold"
                    >
                      {map}
                    </span>
                  ))}
                </div>
              </div>

              {/* Competitive Ruleset */}
              <div className="mt-4">
                <div className="text-[11px] uppercase font-mono text-gray-400 font-bold mb-1.5 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Standard Tournament Rules</span>
                </div>
                <ul className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-gray-300">
                  {activeMode.defaultRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-[11px] text-gray-400">
                100% Free Entry • Non-monetary VP rankings
              </div>
              {onSelectMode && (
                <button
                  onClick={() => {
                    onSelectMode(activeMode.mode);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs font-heading uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Filter Cups By This Mode</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
