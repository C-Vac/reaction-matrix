"use client";

import React, { useEffect, useId, useRef, useState } from 'react';
import { ReactionMatrixPanel } from './ReactionMatrixPanel';
import { archetypeById, meanVector, readVector, type ReactionDraft, type ReactionSummary } from './math';

export interface ReactionMatrixButtonProps {
  /** What is being reacted to. Used for the accessible name only; the host decides where data goes. */
  targetId: string;
  targetLabel?: string;
  /** Everyone's reactions so far. */
  summary?: ReactionSummary;
  /** The current person's locked reaction, if any. Opens the dialog in revise mode. */
  mine?: ReactionDraft | null;
  /** Called when the person locks in. Resolve to close the dialog; reject to show an error. */
  onReact?: (draft: ReactionDraft) => void | Promise<void>;
  /** Return false to stop the dialog opening, e.g. to ask the person to sign in first. */
  onBeforeOpen?: () => boolean | void;
  size?: 'sm' | 'md';
  /** Replaces the default "React" label when nobody has reacted. */
  label?: string;
  className?: string;
}

/** Four-dimensional cube drawn the old way: two squares and the lines between their corners. */
function Mark() {
  return (
    <svg className="rm-mark" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="13" height="13" />
      <rect x="5" y="5" width="6" height="6" />
      <path d="M1.5 1.5 5 5M14.5 1.5 11 5M1.5 14.5 5 11M14.5 14.5 11 11" />
    </svg>
  );
}

const CLOSE_AFTER_LOCK_MS = 650;

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const count = summary?.count ?? 0;
  const mean = summary ? meanVector(summary) : null;
  const mineName = mine ? archetypeById(mine.archetypeId)?.name : undefined;
  const text = mineName ?? (mean ? readVector(mean).archetype.name : label);
  const subject = targetLabel ?? targetId;
  const name = mineName
    ? `Your reaction to ${subject}: ${mineName}. ${count} total. Revise.`
    : `${label} to ${subject}${count ? `. Consensus: ${text}. ${count} so far` : ''}`;

  const handleLock = async (draft: ReactionDraft) => {
    await onReact?.(draft);
    window.setTimeout(() => setOpen(false), CLOSE_AFTER_LOCK_MS);
  };

  return (
    <span className={`rm-root ${className}`}>
      <button
        type="button"
        className={`rm-button rm-button--${size}`}
        data-locked={mine ? 'true' : undefined}
        aria-haspopup="dialog"
        aria-label={name}
        onClick={() => {
          if (onBeforeOpen?.() === false) return;
          setOpen(true);
        }}
      >
        <Mark />
        <span className="rm-button__text">{text}</span>
        {count > 0 && <span className="rm-button__count">{count}</span>}
      </button>

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
                <p className="rm-dialog__sub">Rotate the figure. Move the point. Lock it in.</p>
              </div>
              <button type="button" className="rm-btn rm-btn--quiet" onClick={() => setOpen(false)} aria-label="Close">
                Close
              </button>
            </header>
            <ReactionMatrixPanel
              initialVector={mine?.vector}
              summary={summary}
              revising={Boolean(mine)}
              onLock={handleLock}
            />
          </div>
        )}
      </dialog>
    </span>
  );
}
