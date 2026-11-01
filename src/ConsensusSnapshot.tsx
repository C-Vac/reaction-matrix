"use client";

import React, { useEffect, useRef } from 'react';
import { consensusVertices, cornerCounts, type ReactionSummary, type Rotation4D } from './math';
import { drawFigure, readPalette } from './draw';

export interface ConsensusSnapshotProps {
  summary?: ReactionSummary;
  /** CSS pixels. */
  size?: number;
  className?: string;
}

/** A fixed three-quarter view, so every snapshot on a page is comparable at a glance. */
const SNAPSHOT_ROTATION: Rotation4D = { xy: 0.3, xz: 0.4, xw: 0.2, yz: 0.1, yw: 0.15, zw: 0.05 };

/**
 * A still of the consensus figure, drawn once in the browser after mount (and again when the
 * votes change). Decorative: the host labels whatever wraps it.
 */
export function ConsensusSnapshot({ summary, size = 40, className = '' }: ConsensusSnapshotProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFigure(ctx, {
      size,
      rotation: SNAPSHOT_ROTATION,
      vertices: consensusVertices(summary),
      counts: size >= 64 ? cornerCounts(summary) : undefined,
      palette: readPalette(canvas),
      weight: size < 64 ? 0.8 : 1,
      zoom: 1.6,
    });
  }, [summary, size]);

  return (
    <canvas
      ref={ref}
      className={`rm-snapshot ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
