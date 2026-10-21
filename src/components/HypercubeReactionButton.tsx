/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * HypercubeReactionButton: Standalone Drop-in 4D Reaction Button Component.
 * Replaces primitive 1D upvotes and 2D emoji reactions with an interactive 4D Tesseract of Emotions.
 */

import React, { useState, useId } from 'react';
import confetti from 'canvas-confetti';
import {
  Vector4D,
  ReactionRecord,
  EmotionalArchetype,
  classifyEmotionalVector,
  averageVectors4D,
  GOBLIN_ARCHETYPES,
} from '../utils/tesseractMath';
import { TesseractSimulation } from './TesseractSimulation';
import { playLockVectorSound, playGoblinPop } from '../utils/goblinAudio';
import {
  Sparkles,
  X,
  Check,
  Compass,
  Layers,
} from 'lucide-react';

export interface HypercubeReactionButtonProps {
  /** Unique ID of the content being reacted to (post, comment, trinket, etc.) */
  targetId: string;
  /** Current reaction records for this target */
  reactions?: ReactionRecord[];
  /** Callback fired when a human or goblin locks in a new 4D emotional vector */
  onReact?: (reaction: ReactionRecord) => void;
  /** Size of the button trigger */
  size?: 'sm' | 'md' | 'lg';
  /** Button visual style */
  variant?: 'goblin' | 'compact' | 'luminous';
  /** Optional custom button label */
  label?: string;
  /** Whether to show reaction count and breakdown pills */
  showStats?: boolean;
  className?: string;
}

export const HypercubeReactionButton: React.FC<HypercubeReactionButtonProps> = ({
  targetId,
  reactions = [],
  onReact,
  size = 'md',
  variant = 'goblin',
  label,
  showStats = true,
  className = '',
}) => {
  const modalId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVector, setSelectedVector] = useState<Vector4D>({
    x: 0.65,
    y: 0.75,
    z: 0.4,
    w: 0.8,
  });
  const [currentArchetype, setCurrentArchetype] = useState<EmotionalArchetype>(() =>
    classifyEmotionalVector({ x: 0.65, y: 0.75, z: 0.4, w: 0.8 })
  );
  const [confusionLevel, setConfusionLevel] = useState<number>(45);
  const [authorName, setAuthorName] = useState<string>('Curious Bog-Dweller');
  const [reactionNote, setReactionNote] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'picker' | 'history' | 'archetypes'>('picker');

  // Compute aggregate vector if reactions exist
  const avgVector = reactions.length > 0 ? averageVectors4D(reactions.map((r) => r.vector)) : null;
  const avgArchetype = avgVector ? classifyEmotionalVector(avgVector) : null;

  // Handle vector change from the 4D canvas simulation
  const handleVectorChange = (
    newVec: Vector4D,
    archetype: EmotionalArchetype,
    confusion: number
  ) => {
    setSelectedVector(newVec);
    setCurrentArchetype(archetype);
    setConfusionLevel(confusion);
  };

  // Submit and lock in emotional vector
  const handleLockInVector = () => {
    playLockVectorSound();

    // Spore / shiny confetti explosion!
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#fbbf24', '#10b981', '#f59e0b', '#a855f7'],
    });

    const newReaction: ReactionRecord = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      targetId,
      author: authorName.trim() || 'Anonymous Goblin',
      timestamp: Date.now(),
      vector: selectedVector,
      archetype: currentArchetype,
      confusionLevel,
      comment: reactionNote.trim() || undefined,
    };

    setIsLocked(true);

    if (onReact) {
      onReact(newReaction);
    }

    setTimeout(() => {
      setIsLocked(false);
      setIsOpen(false);
      setReactionNote('');
    }, 1400);
  };

  // Size styling maps
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* The Single Drop-in Button Trigger */}
      <button
        type="button"
        onClick={() => {
          playGoblinPop();
          setIsOpen(true);
        }}
        className={`group relative inline-flex items-center font-medium rounded-xl transition-all duration-200 border cursor-pointer select-none active:scale-[0.98] ${
          sizeClasses[size]
        } ${
          variant === 'luminous'
            ? 'bg-gradient-to-r from-[#142d1f] to-[#1c3f2b] text-[#fef08a] border-[#fbbf24]/50 shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:border-[#fbbf24] hover:shadow-[0_0_22px_rgba(251,191,36,0.4)]'
            : variant === 'compact'
            ? 'bg-[#0f1f17] text-[#a7f3d0] border-[#1e3d2c] hover:bg-[#14281e] hover:border-[#34d399]/60'
            : 'bg-[#102318] text-[#d1fae5] border-[#224b33] hover:bg-[#163323] hover:border-[#34d399] shadow-md hover:shadow-[#10b981]/15'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`4D Emotional Tesseract Reaction button for ${targetId}. Current count: ${reactions.length}`}
      >
        {/* Animated Mini 4D Tesseract Glyph */}
        <span className="relative flex items-center justify-center w-5 h-5 text-sm group-hover:scale-110 transition-transform">
          {avgArchetype ? (
            <span>{avgArchetype.glyph}</span>
          ) : (
            <span className="text-[#34d399] font-mono font-bold text-xs">⬡4D</span>
          )}
        </span>

        {/* Button Label */}
        <span className="font-semibold tracking-wide">
          {label || (avgArchetype ? avgArchetype.name : 'React in 4D')}
        </span>

        {/* Reaction Count Badge */}
        {showStats && (
          <span className="ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#08120b] border border-[#1b3d29] text-[#86efac]">
            {reactions.length}
          </span>
        )}

        {/* Subtle 4D coordinate preview pill if reactions exist */}
        {avgVector && showStats && size !== 'sm' && (
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#facc15]/80 ml-1">
            [{avgVector.x > 0 ? '+' : ''}{avgVector.x}, {avgVector.w > 0 ? '+' : ''}{avgVector.w}]
          </span>
        )}
      </button>

      {/* POPUP: The Extradimensional 4D Hypercube Simulation Lightbox */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${modalId}-title`}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl bg-[#09140e] border border-[#235338] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[#1b3c29] bg-[#0c1c13] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#142d1f] border border-[#2d6645] flex items-center justify-center text-lg shadow-inner">
                  🔮
                </div>
                <div>
                  <h2
                    id={`${modalId}-title`}
                    className="text-base font-bold text-[#facc15] font-serif flex items-center gap-2"
                  >
                    4D Emotional Hypercube
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#163826] text-[#34d399] border border-[#25573b]">
                      Tesseract Engine
                    </span>
                  </h2>
                  <p className="text-xs text-[#a7f3d0]/75">
                    Drag the hypercube. Calibrate 4 axes. Confuse humanity.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#9ca3af] hover:text-white bg-[#142b1e] hover:bg-[#1e422f] rounded-xl transition cursor-pointer"
                aria-label="Close 4D Hypercube reaction dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-[#1b3c29] bg-[#08120b] text-xs font-semibold px-5">
              <button
                type="button"
                onClick={() => setActiveTab('picker')}
                className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'picker'
                    ? 'border-[#34d399] text-[#34d399]'
                    : 'border-transparent text-[#9ca3af] hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>4D Tesseract Simulation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('archetypes')}
                className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'archetypes'
                    ? 'border-[#34d399] text-[#34d399]'
                    : 'border-transparent text-[#9ca3af] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>16 Goblin Archetypes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-[#34d399] text-[#34d399]'
                    : 'border-transparent text-[#9ca3af] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Reaction Ledger ({reactions.length})</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {activeTab === 'picker' && (
                <TesseractSimulation
                  initialVector={selectedVector}
                  onVectorChange={handleVectorChange}
                >
                  {/* Embedded Right Column: Lock-in Form */}
                  <div className="p-3.5 rounded-2xl bg-[#0c1c14] border border-[#214732] space-y-2.5">
                    <div className="flex items-center justify-between gap-2 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentArchetype.glyph}</span>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#34d399] font-bold block">
                            Calculated Emotion:
                          </span>
                          <span className="text-xs font-bold text-[#facc15] block">
                            {currentArchetype.name}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-[#a7f3d0]/80 font-mono bg-[#08120b] px-2 py-0.5 rounded border border-[#1a3826] whitespace-nowrap">
                        [{selectedVector.x.toFixed(2)}, {selectedVector.y.toFixed(2)}, {selectedVector.z.toFixed(2)}, {selectedVector.w.toFixed(2)}]
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <label
                          htmlFor={`${modalId}-author`}
                          className="block text-[10px] font-semibold text-[#a7f3d0] mb-0.5"
                        >
                          Goblin / Human Handle:
                        </label>
                        <input
                          id={`${modalId}-author`}
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="e.g. Snot-Weaver Grog"
                          className="w-full text-xs px-2.5 py-1.5 bg-[#08120b] border border-[#1b3d28] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${modalId}-note`}
                          className="block text-[10px] font-semibold text-[#a7f3d0] mb-0.5"
                        >
                          Transmission Whisper (Optional):
                        </label>
                        <input
                          id={`${modalId}-note`}
                          type="text"
                          value={reactionNote}
                          onChange={(e) => setReactionNote(e.target.value)}
                          placeholder="e.g. The W-axis vibrates nicely"
                          className="w-full text-xs px-2.5 py-1.5 bg-[#08120b] border border-[#1b3d28] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
                        />
                      </div>
                    </div>

                    {/* Lock In Button */}
                    <button
                      type="button"
                      onClick={handleLockInVector}
                      disabled={isLocked}
                      className={`w-full mt-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                        isLocked
                          ? 'bg-[#10b981] text-neutral-950 scale-[0.99]'
                          : 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#facc15] hover:to-[#fbbf24] text-neutral-950 shadow-lg shadow-[#fbbf24]/20 hover:shadow-[#fbbf24]/35 active:scale-[0.98]'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                          <span>4D VECTOR LOCKED IN!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-neutral-950" />
                          <span>Lock Emotional Vector ({currentArchetype.name})</span>
                        </>
                      )}
                    </button>
                  </div>
                </TesseractSimulation>
              )}

              {activeTab === 'archetypes' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#0a1710] rounded-xl border border-[#1a3826] text-xs text-[#a7f3d0]">
                    <span className="font-bold text-[#facc15]">The 16 Canonical Vertices:</span> Each vertex represents an extreme pole in 4-space (±1, ±1, ±1, ±1). Click any archetype to instantly snap your 4D coordinates to it!
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(GOBLIN_ARCHETYPES).map(([coordKey, arch]) => (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => {
                          handleVectorChange(arch.vector, arch, confusionLevel + 10);
                          setActiveTab('picker');
                        }}
                        className="p-3 rounded-xl bg-[#0c1a12] border border-[#1e3c2b] hover:border-[#34d399] text-left transition flex items-start gap-2.5 group cursor-pointer"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {arch.glyph}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#d1fae5] group-hover:text-[#facc15] truncate">
                              {arch.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#86efac]/70">
                              [{arch.vector.x}, {arch.vector.y}, {arch.vector.z}, {arch.vector.w}]
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a7f3d0]/80 line-clamp-2 mt-0.5">
                            "{arch.goblinQuote}"
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#a7f3d0]">
                    <span>Recorded Extradimensional Reactions:</span>
                    <span className="font-mono font-bold text-[#facc15]">
                      {reactions.length} total entries
                    </span>
                  </div>

                  {reactions.length === 0 ? (
                    <div className="p-8 text-center bg-[#0a1710] rounded-2xl border border-[#1a3826]">
                      <p className="text-sm text-neutral-400">
                        No 4D emotional vectors locked for this item yet. Be the first goblin or human to warp reality!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reactions.map((rx) => (
                        <div
                          key={rx.id}
                          className="p-3 rounded-xl bg-[#0c1a12] border border-[#1c3a2a] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{rx.archetype.glyph}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {rx.author}
                                </span>
                                <span className="text-[10px] text-[#facc15] font-semibold">
                                  {rx.archetype.name}
                                </span>
                              </div>
                              {rx.comment && (
                                <p className="text-xs text-[#a7f3d0]/80 italic mt-0.5">
                                  "{rx.comment}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-[#34d399] block">
                              [{rx.vector.x.toFixed(2)}, {rx.vector.y.toFixed(2)}, {rx.vector.z.toFixed(2)}, {rx.vector.w.toFixed(2)}]
                            </span>
                            <span className="text-[9px] text-[#9ca3af]">
                              {rx.confusionLevel}% confused
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 border-t border-[#1b3c29] bg-[#07110a] flex items-center justify-between text-xs text-[#9ca3af]">
              <span>Target ID: <code className="text-[#34d399]">{targetId}</code></span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition cursor-pointer"
              >
                Close simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
