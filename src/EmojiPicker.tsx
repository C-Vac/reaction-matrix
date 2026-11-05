"use client";

import React, { useState } from 'react';
import { FEATURED_ARCHETYPE_IDS, PICKER_ARCHETYPES, type Archetype } from './math';
import { Face } from './Face';

export interface EmojiPickerProps {
  selectedId?: string | null;
  onPick: (archetype: Archetype) => void;
  disabled?: boolean;
  className?: string;
}

const FEATURED = PICKER_ARCHETYPES.slice(0, FEATURED_ARCHETYPE_IDS.length);

/** The eight featured reactions, with the other corners and Unmoved behind "More". */
export function EmojiPicker({ selectedId, onPick, disabled = false, className = '' }: EmojiPickerProps) {
  const [expanded, setExpanded] = useState(() => Boolean(selectedId && !FEATURED_ARCHETYPE_IDS.includes(selectedId)));
  const shown = expanded ? PICKER_ARCHETYPES : FEATURED;
  return (
    <div className={`rm-emoji ${className}`}>
      <div className="rm-emoji__grid" role="group" aria-label="Reactions">
        {shown.map((a) => (
          <button
            key={a.id}
            type="button"
            className="rm-emoji__item"
            aria-pressed={a.id === selectedId}
            title={`${a.name}: ${a.gloss}`}
            disabled={disabled}
            onClick={() => onPick(a)}
          >
            <span className="rm-emoji__glyph" aria-hidden="true">
              <Face archetype={a} size={32} />
            </span>
            <span className="rm-emoji__name">{a.name}</span>
          </button>
        ))}
      </div>
      <button type="button" className="rm-chip rm-emoji__more" aria-expanded={expanded} onClick={() => setExpanded((e) => !e)}>
        {expanded ? 'Fewer' : `More (${PICKER_ARCHETYPES.length - FEATURED.length})`}
      </button>
    </div>
  );
}
