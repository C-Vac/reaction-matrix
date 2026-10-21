"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  CORNER_AT_VERTEX,
  EDGES,
  VERTICES,
  project,
  rotate,
  readVector,
  vertexIndexOf,
  type Archetype,
  type Rotation4D,
  type Vector4D,
} from './math';

export interface TesseractCanvasProps {
  /** The reaction point, drawn inside the figure. */
  value: Vector4D;
  /** Fired when the person clicks or taps a corner. */
  onPickCorner?: (corner: Archetype) => void;
  /** Fired with the angular size of every user-driven rotation, for the disorientation reading. */
  onTumble?: (radians: number) => void;
  className?: string;
}

type Plane = '3D' | 'XW' | 'YW' | 'ZW';
const PLANES: readonly Plane[] = ['3D', 'XW', 'YW', 'ZW'];

const DRAG_SENSITIVITY = 0.012;
const KEY_STEP = 0.12;
const CLICK_SLOP_PX = 5;
const HIT_RADIUS_PX = 16;
const DISTANCE_4D = 2.5;
const DISTANCE_3D = 3.2;
/** Zoom relative to canvas size: the projected figure is only ~0.26 of this wide. */
const ZOOM = 1.05;

/** Theme colors come from CSS custom properties on the canvas so the host owns the palette. */
interface Palette {
  rapt: string;
  feral: string;
  point: string;
  ink: string;
  surface: string;
}

const FALLBACK: Palette = {
  rapt: '#39ff14',
  feral: '#b026ff',
  point: '#f5f5dc',
  ink: '#d6e4d6',
  surface: '#0a120c',
};

function readPalette(el: Element): Palette {
  const css = getComputedStyle(el);
  const get = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    rapt: get('--rm-rapt', FALLBACK.rapt),
    feral: get('--rm-feral', FALLBACK.feral),
    point: get('--rm-point', FALLBACK.point),
    ink: get('--rm-ink', FALLBACK.ink),
    surface: get('--rm-surface', FALLBACK.surface),
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function TesseractCanvas({ value, onPickCorner, onTumble, className = '' }: TesseractCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spin, setSpin] = useState(() => !prefersReducedMotion());
  const [plane, setPlane] = useState<Plane>('3D');

  // Everything the render loop reads lives in refs so the loop never restarts.
  const rotation = useRef<Rotation4D>({ xy: 0.3, xz: 0.4, xw: 0.2, yz: 0.1, yw: 0.15, zw: 0.05 });
  const valueRef = useRef(value);
  const spinRef = useRef(spin);
  const planeRef = useRef(plane);
  const hover = useRef<number | null>(null);
  const dirty = useRef(true);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const onTumbleRef = useRef(onTumble);
  const onPickRef = useRef(onPickCorner);
  const screen = useRef<{ x: number; y: number }[]>([]);

  valueRef.current = value;
  spinRef.current = spin;
  planeRef.current = plane;
  onTumbleRef.current = onTumble;
  onPickRef.current = onPickCorner;

  useEffect(() => {
    dirty.current = true;
  }, [value, spin, plane]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let size = 0;
    let frame = 0;
    let raf = 0;
    let last = performance.now();
    let palette = readPalette(canvas);

    const resize = () => {
      const css = Math.floor(wrap.clientWidth);
      if (!css || css === size) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size = css;
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      dirty.current = true;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.1, (time - last) / 1000);
      last = time;

      if (spinRef.current && !drag.current) {
        const r = rotation.current;
        const step = dt * 0.2;
        r.xy += step * 0.9;
        r.xz += step * 0.7;
        r.xw += step * 0.8;
        r.yw += step * 0.5;
        r.zw += step * 0.3;
        dirty.current = true;
      }
      if (!dirty.current || !size) return;
      dirty.current = false;

      if (frame++ % 60 === 0) palette = readPalette(canvas);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = canvas.width / size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const opts = { distance4D: DISTANCE_4D, distance3D: DISTANCE_3D, size, zoom: size * ZOOM };
      const rot = rotation.current;
      const corners = VERTICES.map((v) => {
        const r = rotate(v, rot);
        return { w: r.w, p: project(r, opts) };
      });
      screen.current = corners.map((c) => c.p);

      // Edges: tinted by where they sit along w, so the Rapt and Feral halves read as two bodies.
      ctx.lineCap = 'round';
      for (const [a, b] of EDGES) {
        const A = corners[a];
        const B = corners[b];
        const grad = ctx.createLinearGradient(A.p.x, A.p.y, B.p.x, B.p.y);
        grad.addColorStop(0, A.w >= 0 ? palette.rapt : palette.feral);
        grad.addColorStop(1, B.w >= 0 ? palette.rapt : palette.feral);
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.28 + 0.4 * ((A.w + B.w + 2) / 4);
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(A.p.x, A.p.y);
        ctx.lineTo(B.p.x, B.p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const point = project(rotate(valueRef.current, rot), opts);
      // At the origin nothing is resolved yet, so there is no corner to tether to or label.
      const unmoved = readVector(valueRef.current).archetype.id === 'unmoved';
      const resolvedVertex = unmoved ? -1 : vertexIndexOf(valueRef.current);

      // Tether from the point to the corner it currently reads as.
      if (resolvedVertex >= 0) {
        const t = corners[resolvedVertex].p;
        ctx.save();
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = palette.point;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
        ctx.restore();
      }

      corners.forEach((c, i) => {
        const hot = i === hover.current || i === resolvedVertex;
        ctx.fillStyle = c.w >= 0 ? palette.rapt : palette.feral;
        ctx.globalAlpha = hot ? 1 : 0.55 + 0.25 * ((c.w + 1) / 2);
        ctx.beginPath();
        ctx.arc(c.p.x, c.p.y, hot ? 4.5 : 2.75, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Labels only for the corner under the pointer and the corner the point resolves to.
      ctx.font = '600 11px var(--font-jetbrains, ui-monospace, monospace)';
      ctx.textBaseline = 'middle';
      const labelled = new Set<number>([resolvedVertex]);
      if (hover.current !== null) labelled.add(hover.current);
      labelled.forEach((i) => {
        if (i < 0) return;
        const name = CORNER_AT_VERTEX[i].name;
        const c = corners[i].p;
        const width = ctx.measureText(name).width;
        const left = Math.min(size - width - 10, Math.max(4, c.x + 9));
        const top = Math.min(size - 11, Math.max(11, c.y));
        ctx.fillStyle = palette.surface;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(left - 4, top - 9, width + 8, 18);
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.ink;
        ctx.fillText(name, left, top);
      });

      // The reaction point: a solid dot and a ring. Quiet on purpose.
      ctx.fillStyle = palette.point;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.point;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const tumble = (dx: number, dy: number, shift: boolean) => {
    const r = rotation.current;
    const current = planeRef.current;
    if (current === '3D' && !shift) {
      r.xy += dx;
      r.xz += dy;
    } else if (current === 'YW') {
      r.yw += dy;
      r.zw += dx;
    } else if (current === 'ZW') {
      r.zw += dx;
      r.xw += dy;
    } else {
      r.xw += dx;
      r.yw += dy;
    }
    onTumbleRef.current?.(Math.hypot(dx, dy));
    dirty.current = true;
  };

  const hitCorner = (clientX: number, clientY: number): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    let best: number | null = null;
    let bestDist = HIT_RADIUS_PX;
    screen.current.forEach((p, i) => {
      const d = Math.hypot(p.x - px, p.y - py);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    return best;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d) {
      const hit = hitCorner(e.clientX, e.clientY);
      if (hit !== hover.current) {
        hover.current = hit;
        dirty.current = true;
        e.currentTarget.style.cursor = hit === null ? 'grab' : 'pointer';
      }
      return;
    }
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    d.moved += Math.hypot(dx, dy);
    if (d.moved > CLICK_SLOP_PX) {
      setSpin(false);
      tumble(dx * DRAG_SENSITIVITY, dy * DRAG_SENSITIVITY, e.shiftKey);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d || d.moved > CLICK_SLOP_PX) return;
    const hit = hitCorner(e.clientX, e.clientY);
    if (hit === null) return;
    onPickRef.current?.(CORNER_AT_VERTEX[hit]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setSpin(false);
    tumble(move[0], move[1], e.shiftKey);
  };

  return (
    <div className={`rm-canvas ${className}`}>
      <div ref={wrapRef} className="rm-canvas__stage">
        <canvas
          ref={canvasRef}
          className="rm-canvas__surface"
          tabIndex={0}
          role="application"
          aria-roledescription="rotatable hypercube"
          aria-label="Hypercube of reactions. Arrow keys rotate it; the sliders set your reaction."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => {
            if (hover.current !== null) {
              hover.current = null;
              dirty.current = true;
            }
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      <div className="rm-canvas__bar">
        <button
          type="button"
          className="rm-chip"
          aria-pressed={spin}
          onClick={() => setSpin((s) => !s)}
        >
          {spin ? 'Pause' : 'Spin'}
        </button>
        <div className="rm-segment" role="group" aria-label="Rotation plane">
          <span className="rm-segment__label" aria-hidden="true">
            Rotate in
          </span>
          {PLANES.map((p) => (
            <button
              key={p}
              type="button"
              className="rm-chip"
              aria-pressed={plane === p}
              onClick={() => setPlane(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
