"use client";

import React, { useEffect, useId, useRef, useState } from 'react';
import { ReactionMatrixPanel } from './ReactionMatrixPanel';
import { ConsensusSnapshot } from './ConsensusSnapshot';
import { EmojiPicker } from './EmojiPicker';
import {
  DEFAULT_INTENSITIES,
  UNMOVED,
  archetypeById,
  cornerVector,
  intensitiesOf,
  topArchetypes,
  type Archetype,
  type ReactionDraft,
  type ReactionSummary,
} from './math';

export interface ReactionMatrixButtonProps {
  /** What is being reacted to. Used for the accessible name only; the host decides where data goes. */
  targetId: string;
  targetLabel?: string;
  /** Everyone's reactions so far. */
  summary?: ReactionSummary;
  /** The current person's locked reaction, if any. */
  mine?: ReactionDraft | null;
  /** Called when the person reacts. Resolve on success; reject to show an error. */
  onReact?: (draft: ReactionDraft) => void | Promise<void>;
  /** Return false to stop the person reacting, e.g. to ask them to sign in first. */
  onBeforeOpen?: () => boolean | void;
  size?: 'sm' | 'md';
  /** Replaces the default "React" label on the add button when nobody has reacted. */
  label?: string;
  className?: string;
}

const CLOSE_AFTER_LOCK_MS = 650;

/**
 * The inline reaction row: a still of the consensus figure (opens the hypercube dialog), a tally
 * chip per emoji people picked (tap to pick it too), and an add button with the emoji picker.
 */
export function ReactionMatrixButton({
  targetId,
  targetLabel,
  summary,
  mine,
  onReact,
  onBeforeOpen,
  size = 'md',
  label = 'React',
  className = '',
}: ReactionMatrixButtonProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // The picker closes on a click outside the row or on Escape.
  useEffect(() => {
    if (!picking) return;
    const away = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPicking(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPicking(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [picking]);

  const allowed = () => onBeforeOpen?.() !== false;
  const count = summary?.count ?? 0;
  const subject = targetLabel ?? targetId;
  const mineArchetype = mine ? archetypeById(mine.archetypeId) : undefined;

  const chips = summary ? topArchetypes(summary, size === 'sm' ? 3 : 5) : [];
  if (mineArchetype && !chips.some((c) => c.archetype.id === mineArchetype.id)) {
    chips.push({ archetype: mineArchetype, count: summary?.archetypeCounts[mineArchetype.id] ?? 1 });
  }

  /** One tap: that emoji's corner, at the person's previous intensities if they had any. */
  const quickReact = async (a: Archetype) => {
    setPicking(false);
    if (busy || a.id === mine?.archetypeId || !allowed()) return;
    const intensities = mine && mine.archetypeId !== UNMOVED.id ? intensitiesOf(mine.vector) : DEFAULT_INTENSITIES;
    setBusy(true);
    setFailed(false);
    try {
      await onReact?.({ vector: cornerVector(a.id, intensities), archetypeId: a.id, disorientation: 0 });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const handleLock = async (draft: ReactionDraft) => {
    await onReact?.(draft);
    window.setTimeout(() => setOpen(false), CLOSE_AFTER_LOCK_MS);
  };

  return (
    <span ref={rootRef} className={`rm-root rm-row rm-row--${size} ${className}`} aria-busy={busy || undefined}>
      <button
        type="button"
        className="rm-figure-btn"
        aria-haspopup="dialog"
        aria-label={`Open the reaction hypercube for ${subject}${count ? `, bent by ${count} reactions` : ''}`}
        title="Open the hypercube"
        onClick={() => {
          if (allowed()) setOpen(true);
        }}
      >
        <ConsensusSnapshot summary={summary} size={size === 'sm' ? 26 : 34} />
      </button>

      {chips.map(({ archetype, count: n }) => (
        <button
          key={archetype.id}
          type="button"
          className="rm-tally"
          aria-pressed={archetype.id === mine?.archetypeId}
          aria-label={`${archetype.name}: ${n}${archetype.id === mine?.archetypeId ? ', your reaction' : ''}`}
          title={archetype.name}
          disabled={busy}
          onClick={() => quickReact(archetype)}
        >
          <span aria-hidden="true">{archetype.emoji}</span>
          <span className="rm-mono">{n}</span>
        </button>
      ))}

      <span className="rm-add-wrap">
        <button
          type="button"
          className="rm-add"
          aria-expanded={picking}
          aria-label={mineArchetype ? `Change your reaction to ${subject}` : `${label} to ${subject}`}
          disabled={busy}
          onClick={() => {
            if (picking) setPicking(false);
            else if (allowed()) setPicking(true);
          }}
        >
          <span aria-hidden="true">＋</span>
          {count === 0 && <span>{label}</span>}
        </button>
        {picking && (
          <span className="rm-popover">
            <EmojiPicker selectedId={mine?.archetypeId} onPick={quickReact} disabled={busy} />
          </span>
        )}
      </span>

      {failed && (
        <span role="alert" className="rm-error">
          Not saved.
        </span>
      )}

      <dialog
        ref={dialogRef}
        className="rm-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        {open && (
          <div className="rm-dialog__body">
            <header className="rm-dialog__head">
              <div>
                <h2 id={titleId} className="rm-dialog__title">
                  {mine ? 'Revise your reaction' : 'Register a reaction'}
                </h2>
                <p className="rm-dialog__sub">
                  The figure is bent by everyone&apos;s reactions. Pick yours, set how strongly, lock it in.
                </p>
              </div>
              <button type="button" className="rm-btn rm-btn--quiet" onClick={() => setOpen(false)} aria-label="Close">
                Close
              </button>
            </header>
            <ReactionMatrixPanel initial={mine} summary={summary} revising={Boolean(mine)} onLock={handleLock} />
          </div>
        )}
      </dialog>
    </span>
  );
}
