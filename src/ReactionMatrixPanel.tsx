"use client";

/**
 * @file ReactionMatrixPanel.tsx
 * @description The picker without the button or dialog: hypercube, a reading of what the current
 * point means, four axis sliders, the disorientation meter, a lock-in button and an optional
 * read-out of everyone else's reactions. Use it directly to embed the picker inline in a page,
 * or let {@link ReactionMatrixButton} put it in a dialog for you.
 */

import React, { useId, useRef, useState } from 'react';
import { TesseractCanvas } from './TesseractCanvas';
import {
  AXES,
  ORIGIN,
  clampVector,
  measureDisorientation,
  meanVector,
  readVector,
  topArchetypes,
  type Archetype,
  type ReactionDraft,
  type ReactionSummary,
  type Vector4D,
} from './math';

/** Props for {@link ReactionMatrixPanel}. */
export interface ReactionMatrixPanelProps {
  /** Where the point starts. Pass the person's previous reaction to let them revise it. */
  initialVector?: Vector4D | null;
  /** Everyone else's reactions, shown as a collapsed read-out under the form. */
  summary?: ReactionSummary;
  /** True when the person is revising an earlier reaction. Only changes the wording. */
  revising?: boolean;
  /** Called with the locked reaction. The panel shows "Locked" until it settles. */
  onLock: (draft: ReactionDraft) => void | Promise<void>;
  onCancel?: () => void;
}

/** Fill from the middle of the track out to the thumb. */
function sliderFill(value: number): React.CSSProperties {
  const pos = ((value + 1) / 2) * 100;
  return { '--rm-from': `${Math.min(50, pos)}%`, '--rm-to': `${Math.max(50, pos)}%` } as React.CSSProperties;
}

const fmt = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n).toFixed(2);

/** Inline picker. Holds the working vector and interaction stats; the host owns persistence. */
export function ReactionMatrixPanel({
  initialVector,
  summary,
  revising = false,
  onLock,
  onCancel,
}: ReactionMatrixPanelProps) {
  const id = useId();
  const [vector, setVector] = useState<Vector4D>(() => (initialVector ? clampVector(initialVector) : ORIGIN));
  const [state, setState] = useState<'idle' | 'locking' | 'locked' | 'error'>('idle');

  // Interaction totals feed the disorientation reading. Refs, with one state copy for display.
  const stats = useRef({ tumble: 0, adjustments: 0, startedAt: Date.now() });
  const measure = () =>
    measureDisorientation({
      tumble: stats.current.tumble,
      adjustments: stats.current.adjustments,
      elapsedMs: Date.now() - stats.current.startedAt,
    });
  const [disorientation, setDisorientation] = useState(measure);

  const reading = readVector(vector);

  const change = (next: Vector4D) => {
    stats.current.adjustments += 1;
    setVector(clampVector(next));
    setDisorientation(measure());
  };

  const snapTo = (corner: Archetype) => change(corner.vector);
  const scramble = () => {
    const r = () => Math.round((Math.random() * 2 - 1) * 100) / 100;
    change({ x: r(), y: r(), z: r(), w: r() });
  };

  const lock = async () => {
    setState('locking');
    try {
      await onLock({
        vector,
        archetypeId: reading.archetype.id,
        disorientation: measure().index,
      });
      setState('locked');
    } catch {
      setState('error');
    }
  };

  const mean = summary ? meanVector(summary) : null;
  const consensus = mean ? readVector(mean) : null;
  const top = summary ? topArchetypes(summary) : [];
  const topMax = top[0]?.count ?? 1;

  return (
    <div className="rm-panel">
      <TesseractCanvas
        value={vector}
        onPickCorner={snapTo}
        onTumble={(radians) => {
          stats.current.tumble += radians;
          setDisorientation(measure());
        }}
      />

      <div className="rm-panel__side">
        <section aria-live="polite" className="rm-reading">
          <p className="rm-eyebrow">Reads as</p>
          <p className="rm-reading__name">{reading.archetype.name}</p>
          <p className="rm-reading__gloss">{reading.archetype.gloss}</p>
          <p className="rm-reading__meta">
            <span>{reading.intensityLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="rm-mono">
              [{fmt(vector.x)} {fmt(vector.y)} {fmt(vector.z)} {fmt(vector.w)}]
            </span>
          </p>
        </section>

        <div className="rm-axes">
          {AXES.map((axis) => (
            <div key={axis.key} className="rm-axis">
              <label htmlFor={`${id}-${axis.key}`} className="rm-axis__head">
                <span>{axis.negative}</span>
                <span className="rm-axis__name">
                  {axis.name} <span className="rm-mono">{fmt(vector[axis.key])}</span>
                </span>
                <span>{axis.positive}</span>
              </label>
              <input
                id={`${id}-${axis.key}`}
                className="rm-range"
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={vector[axis.key]}
                style={sliderFill(vector[axis.key])}
                aria-valuetext={`${axis.name} ${fmt(vector[axis.key])}, between ${axis.negative} and ${axis.positive}`}
                onChange={(e) => change({ ...vector, [axis.key]: parseFloat(e.target.value) })}
              />
            </div>
          ))}
        </div>

        <div className="rm-disorientation" data-severity={disorientation.severity}>
          <div className="rm-disorientation__row">
            <span className="rm-eyebrow">Disorientation</span>
            <span className="rm-mono">
              {disorientation.index}% {disorientation.label}
            </span>
          </div>
          <div
            className="rm-meter"
            role="meter"
            aria-label="Disorientation"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={disorientation.index}
          >
            <span style={{ width: `${disorientation.index}%` }} />
          </div>
          <p className="rm-disorientation__remark">{disorientation.remark}</p>
        </div>

        <div className="rm-actions">
          <button type="button" className="rm-btn rm-btn--quiet" onClick={scramble} disabled={state === 'locking'}>
            Scramble
          </button>
          <button
            type="button"
            className="rm-btn rm-btn--quiet"
            onClick={() => change(ORIGIN)}
            disabled={state === 'locking'}
          >
            Reset
          </button>
          {onCancel && (
            <button type="button" className="rm-btn rm-btn--quiet" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="rm-btn rm-btn--primary"
            onClick={lock}
            disabled={state === 'locking' || state === 'locked'}
          >
            {state === 'locked'
              ? 'Locked'
              : state === 'locking'
                ? 'Locking…'
                : revising
                  ? `Revise: ${reading.archetype.name}`
                  : `Lock in ${reading.archetype.name}`}
          </button>
        </div>
        {state === 'error' && (
          <p role="alert" className="rm-error">
            Could not lock that in. Try again.
          </p>
        )}

        {summary && summary.count > 0 && consensus && (
          <details className="rm-others">
            <summary>
              Everyone else ({summary.count}) <span className="rm-others__lead">{consensus.archetype.name}</span>
            </summary>
            <ul className="rm-bars">
              {top.map(({ archetype, count }) => (
                <li key={archetype.id}>
                  <span>{archetype.name}</span>
                  <span className="rm-bars__track">
                    <span style={{ width: `${(count / topMax) * 100}%` }} />
                  </span>
                  <span className="rm-mono">{count}</span>
                </li>
              ))}
            </ul>
            {mean && (
              <p className="rm-others__mean rm-mono">
                mean [{fmt(mean.x)} {fmt(mean.y)} {fmt(mean.z)} {fmt(mean.w)}]
              </p>
            )}
          </details>
        )}
      </div>
    </div>
  );
}
