"use client";

import React, { useId, useRef, useState } from 'react';
import { TesseractCanvas } from './TesseractCanvas';
import { EmojiPicker } from './EmojiPicker';
import { Face } from './Face';
import {
  AXES,
  DEFAULT_INTENSITIES,
  MIN_AXIS_INTENSITY,
  ORIGIN,
  PICKER_ARCHETYPES,
  UNMOVED,
  archetypeById,
  consensusVertices,
  cornerCounts,
  cornerVector,
  intensitiesOf,
  measureDisorientation,
  readVector,
  topArchetypes,
  type Archetype,
  type ReactionDraft,
  type ReactionSummary,
  type Vector4D,
} from './math';

export interface ReactionMatrixPanelProps {
  /** The person's previous reaction, to revise it. */
  initial?: Pick<ReactionDraft, 'vector' | 'archetypeId'> | null;
  /** Everyone's reactions: they bend the figure and fill the tally. */
  summary?: ReactionSummary;
  /** True when the person is revising an earlier reaction. Only changes the wording. */
  revising?: boolean;
  /** Called with the locked reaction. The panel shows "Locked" until it settles. */
  onLock: (draft: ReactionDraft) => void | Promise<void>;
  onCancel?: () => void;
}

/** Fill from the left edge to the thumb (intensity runs from barely to totally). */
function sliderFill(value: number): React.CSSProperties {
  const pos = ((value - MIN_AXIS_INTENSITY) / (1 - MIN_AXIS_INTENSITY)) * 100;
  return { '--rm-from': '0%', '--rm-to': `${pos}%` } as React.CSSProperties;
}

export function ReactionMatrixPanel({ initial, summary, revising = false, onLock, onCancel }: ReactionMatrixPanelProps) {
  const id = useId();
  const [picked, setPicked] = useState<Archetype | null>(() => (initial ? archetypeById(initial.archetypeId) ?? null : null));
  const [intensities, setIntensities] = useState<Vector4D>(() =>
    initial && initial.archetypeId !== UNMOVED.id ? intensitiesOf(initial.vector) : DEFAULT_INTENSITIES
  );
  const [state, setState] = useState<'idle' | 'locking' | 'locked' | 'error'>('idle');

  // The disorientation reading is decoration; interaction totals live in refs.
  const stats = useRef({ tumble: 0, adjustments: 0, startedAt: Date.now() });
  const measure = () =>
    measureDisorientation({
      tumble: stats.current.tumble,
      adjustments: stats.current.adjustments,
      elapsedMs: Date.now() - stats.current.startedAt,
    });
  const [disorientation, setDisorientation] = useState(measure);
  const touch = () => {
    stats.current.adjustments += 1;
    setDisorientation(measure());
  };

  const vector = picked ? cornerVector(picked.id, intensities) : ORIGIN;
  const reading = readVector(vector);
  const sliderOff = !picked || picked.id === UNMOVED.id;

  const pick = (a: Archetype) => {
    setPicked(a);
    if (state !== 'locking') setState('idle');
    touch();
  };

  const scramble = () => {
    const r = () => Math.round((MIN_AXIS_INTENSITY + Math.random() * (1 - MIN_AXIS_INTENSITY)) * 100) / 100;
    setPicked(PICKER_ARCHETYPES[Math.floor(Math.random() * (PICKER_ARCHETYPES.length - 1))]);
    setIntensities({ x: r(), y: r(), z: r(), w: r() });
    touch();
  };

  const lock = async () => {
    if (!picked) return;
    setState('locking');
    try {
      await onLock({ vector, archetypeId: picked.id, disorientation: measure().index });
      setState('locked');
    } catch {
      setState('error');
    }
  };

  const top = summary ? topArchetypes(summary, PICKER_ARCHETYPES.length) : [];
  const topMax = top[0]?.count ?? 1;

  return (
    <div className="rm-panel">
      <TesseractCanvas
        value={vector}
        vertices={consensusVertices(summary)}
        counts={cornerCounts(summary)}
        onPickCorner={pick}
        onTumble={(radians) => {
          stats.current.tumble += radians;
          setDisorientation(measure());
        }}
      />

      <div className="rm-panel__side">
        <section>
          <p className="rm-eyebrow">Pick one</p>
          <EmojiPicker selectedId={picked?.id} onPick={pick} />
        </section>

        <section aria-live="polite" className="rm-reading">
          <p className="rm-eyebrow">Reads as</p>
          <p className="rm-reading__name">
            {picked ? (
              <>
                <Face archetype={picked} size={22} /> {picked.name}
              </>
            ) : (
              'Nothing yet'
            )}
          </p>
          <p className="rm-reading__gloss">
            {picked ? picked.gloss : 'Choose a reaction above, or click a corner of the figure.'}
          </p>
          {picked && picked.id !== UNMOVED.id && <p className="rm-reading__meta">{reading.intensityLabel}</p>}
        </section>

        <div className="rm-axes" aria-disabled={sliderOff}>
          {AXES.map((axis) => {
            const pole = picked && picked.vector[axis.key] < 0 ? axis.negative : axis.positive;
            const value = intensities[axis.key];
            return (
              <div key={axis.key} className="rm-axis">
                <label htmlFor={`${id}-${axis.key}`} className="rm-axis__head">
                  <span className="rm-axis__name">{sliderOff ? axis.name : pole}</span>
                  <span className="rm-mono">{sliderOff ? '—' : value.toFixed(2)}</span>
                </label>
                <input
                  id={`${id}-${axis.key}`}
                  className="rm-range"
                  type="range"
                  min={MIN_AXIS_INTENSITY}
                  max={1}
                  step={0.05}
                  value={value}
                  disabled={sliderOff}
                  style={sliderFill(value)}
                  aria-valuetext={`${pole} intensity ${value.toFixed(2)}`}
                  onChange={(e) => {
                    setIntensities({ ...intensities, [axis.key]: parseFloat(e.target.value) });
                    touch();
                  }}
                />
              </div>
            );
          })}
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
          {onCancel && (
            <button type="button" className="rm-btn rm-btn--quiet" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            type="button"
            className="rm-btn rm-btn--primary"
            onClick={lock}
            disabled={!picked || state === 'locking' || state === 'locked'}
          >
            {state === 'locked'
              ? 'Locked'
              : state === 'locking'
                ? 'Locking…'
                : !picked
                  ? 'Pick a reaction'
                  : (
                    <>
                      {revising ? 'Revise:' : 'Lock in'} <Face archetype={picked} /> {picked.name}
                    </>
                  )}
          </button>
        </div>
        {state === 'error' && (
          <p role="alert" className="rm-error">
            Could not lock that in. Try again.
          </p>
        )}

        {summary && summary.count > 0 && (
          <details className="rm-others" open>
            <summary>Everyone ({summary.count})</summary>
            <ul className="rm-bars">
              {top.map(({ archetype, count }) => (
                <li key={archetype.id}>
                  <span>
                    <Face archetype={archetype} /> {archetype.name}
                  </span>
                  <span className="rm-bars__track">
                    <span style={{ width: `${(count / topMax) * 100}%` }} />
                  </span>
                  <span className="rm-mono">{count}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
