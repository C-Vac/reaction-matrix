/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReactionRecord, Vector4D, averageVectors4D } from '../utils/tesseractMath';
import { Sparkles, Globe2, Compass, BarChart3, Radio } from 'lucide-react';

interface VectorManifoldViewProps {
  reactions: ReactionRecord[];
}

export const VectorManifoldView: React.FC<VectorManifoldViewProps> = ({ reactions }) => {
  const [activePlane, setActivePlane] = useState<'xy' | 'xw' | 'yw' | 'zw'>('xw');
  const [hoveredReaction, setHoveredReaction] = useState<ReactionRecord | null>(null);

  const avg = averageVectors4D(reactions.map((r) => r.vector));

  // Determine plane axes labels
  const planeConfigs = {
    xy: {
      horiz: 'Axis X (Spite <-> Greed)',
      vert: 'Axis Y (Mold Dread <-> Bog Bliss)',
      getCoords: (v: Vector4D) => ({ h: v.x, v: v.y }),
    },
    xw: {
      horiz: 'Axis X (Spite <-> Greed)',
      vert: 'Axis W (Feral Hiss <-> Shiny Hypnosis)',
      getCoords: (v: Vector4D) => ({ h: v.x, v: v.w }),
    },
    yw: {
      horiz: 'Axis Y (Mold Dread <-> Bog Bliss)',
      vert: 'Axis W (Feral Hiss <-> Shiny Hypnosis)',
      getCoords: (v: Vector4D) => ({ h: v.y, v: v.w }),
    },
    zw: {
      horiz: 'Axis Z (Hermit <-> Mischief)',
      vert: 'Axis W (Feral Hiss <-> Shiny Hypnosis)',
      getCoords: (v: Vector4D) => ({ h: v.z, v: v.w }),
    },
  };

  const currentConfig = planeConfigs[activePlane];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#0c1a12] border border-[#1e3c2b] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#142d1f] border border-[#2d6645] flex items-center justify-center text-2xl shadow-inner">
            🧮
          </div>
          <div>
            <span className="text-xs text-[#a7f3d0]/75 uppercase tracking-wide font-semibold block">
              Total 4D Vectors Locked
            </span>
            <span className="text-2xl font-bold font-mono text-[#facc15]">
              {reactions.length}
            </span>
          </div>
        </div>

        {/* Metric 2: Mean Greed/Spite */}
        <div className="p-4 rounded-2xl bg-[#0c1a12] border border-[#1e3c2b] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#142d1f] border border-[#2d6645] flex items-center justify-center text-2xl shadow-inner">
            🪙
          </div>
          <div>
            <span className="text-xs text-[#a7f3d0]/75 uppercase tracking-wide font-semibold block">
              Axis X (Spite/Greed)
            </span>
            <span className="text-lg font-bold font-mono text-[#d1fae5]">
              {avg.x >= 0 ? `+${avg.x} Greed` : `${avg.x} Spite`}
            </span>
          </div>
        </div>

        {/* Metric 3: Mean Bog Euphoria */}
        <div className="p-4 rounded-2xl bg-[#0c1a12] border border-[#1e3c2b] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#142d1f] border border-[#2d6645] flex items-center justify-center text-2xl shadow-inner">
            🐸
          </div>
          <div>
            <span className="text-xs text-[#a7f3d0]/75 uppercase tracking-wide font-semibold block">
              Axis Y (Bog Bliss)
            </span>
            <span className="text-lg font-bold font-mono text-[#34d399]">
              {avg.y >= 0 ? `+${avg.y} Bliss` : `${avg.y} Dread`}
            </span>
          </div>
        </div>

        {/* Metric 4: Mean 4D Shiny Hypnosis */}
        <div className="p-4 rounded-2xl bg-[#0c1a12] border border-[#1e3c2b] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#142d1f] border border-[#2d6645] flex items-center justify-center text-2xl shadow-inner">
            ✨
          </div>
          <div>
            <span className="text-xs text-[#a7f3d0]/75 uppercase tracking-wide font-semibold block">
              Axis W (4D Depth)
            </span>
            <span className="text-lg font-bold font-mono text-[#fbbf24]">
              {avg.w >= 0 ? `+${avg.w} Hypnotized` : `${avg.w} Feral`}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2D Cross-Section Scatter Plot */}
      <div className="p-6 rounded-3xl bg-[#0a1610] border border-[#1e3c2b] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b3827]">
          <div>
            <h3 className="text-lg font-bold text-[#facc15] font-serif flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#34d399]" />
              The Emotional Hyper-Scatter Field
            </h3>
            <p className="text-xs text-[#a7f3d0]/80">
              Interactive 2-axis slicing of 4-dimensional community sentiment
            </p>
          </div>

          {/* Plane Selector */}
          <div className="flex items-center gap-1.5 bg-[#060e09] p-1 rounded-xl border border-[#173022]">
            {(['xw', 'xy', 'yw', 'zw'] as const).map((plane) => (
              <button
                key={plane}
                type="button"
                onClick={() => setActivePlane(plane)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition ${
                  activePlane === plane
                    ? 'bg-[#34d399] text-neutral-950 shadow-sm'
                    : 'text-[#a7f3d0]/70 hover:text-white'
                }`}
              >
                {plane.toUpperCase()} Slice
              </button>
            ))}
          </div>
        </div>

        {/* 2D Coordinate Grid */}
        <div className="relative mt-6 w-full max-w-xl mx-auto aspect-square rounded-2xl bg-[#050b07] border border-[#193625] overflow-hidden p-6 flex items-center justify-center">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-[#34d399]/40" />
            ))}
          </div>

          {/* Center axes */}
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#34d399]/40 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#34d399]/40 pointer-events-none" />

          {/* Axis Labels */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#facc15] bg-[#050b07]/80 px-2 py-0.5 rounded">
            +1.0 {currentConfig.vert.split(' ')[2]}
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#facc15] bg-[#050b07]/80 px-2 py-0.5 rounded">
            -1.0 {currentConfig.vert.split(' ')[0]}
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#34d399] bg-[#050b07]/80 px-2 py-0.5 rounded">
            +1.0
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#34d399] bg-[#050b07]/80 px-2 py-0.5 rounded">
            -1.0
          </span>

          {/* Plotted Points */}
          <div className="relative w-full h-full">
            {reactions.map((rx) => {
              const { h, v } = currentConfig.getCoords(rx.vector);
              // Normalize -1..1 to 0..100%
              const leftPercent = ((h + 1) / 2) * 100;
              const topPercent = ((1 - v) / 2) * 100;

              return (
                <button
                  key={rx.id}
                  type="button"
                  onMouseEnter={() => setHoveredReaction(rx)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  onClick={() => setHoveredReaction(rx)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-1 group cursor-pointer focus:outline-none"
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  aria-label={`Reaction by ${rx.author}: ${rx.archetype.name}`}
                >
                  <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#142d1f] border border-[#34d399] text-xs shadow-md group-hover:scale-150 transition-transform group-hover:z-20">
                    {rx.archetype.glyph}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hovered Point Inspector Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#0e1f16] border border-[#214a33] min-h-[70px] flex items-center justify-between">
          {hoveredReaction ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{hoveredReaction.archetype.glyph}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {hoveredReaction.author}
                  </span>
                  <span className="text-xs text-[#facc15] font-semibold">
                    {hoveredReaction.archetype.name}
                  </span>
                </div>
                <p className="text-xs text-[#a7f3d0]/80 italic">
                  "{hoveredReaction.archetype.goblinQuote}"
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">
              Hover over or click any emotional node in the scatter field to inspect its 4D coordinates and goblin transmission.
            </p>
          )}

          {hoveredReaction && (
            <div className="text-right font-mono text-xs">
              <span className="text-[#34d399] block font-bold">
                [{hoveredReaction.vector.x}, {hoveredReaction.vector.y}, {hoveredReaction.vector.z}, {hoveredReaction.vector.w}]
              </span>
              <span className="text-[10px] text-neutral-400">
                {hoveredReaction.confusionLevel}% confusion
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
