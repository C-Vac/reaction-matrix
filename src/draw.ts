/**
 * @file draw.ts
 * @description Canvas drawing shared by the live figure (TesseractCanvas) and the inline snapshot
 * (ConsensusSnapshot). Browser only, but no React.
 */
import { CORNER_AT_VERTEX, EDGES, project, rotate, type Rotation4D, type Vector4D } from './math';

/** Theme colors come from CSS custom properties on the canvas so the host owns the palette. */
export interface Palette {
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

export function readPalette(el: Element): Palette {
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

export const DISTANCE_4D = 2.5;
export const DISTANCE_3D = 3.2;
/**
 * Zoom relative to canvas size: the projected figure is only ~0.26 of this wide. The consensus
 * figure never exceeds the unit hypercube, so this leaves headroom for any rotation.
 */
export const ZOOM = 1.3;

export interface FigureOptions {
  /** CSS pixels; the canvas is square. */
  size: number;
  rotation: Rotation4D;
  /** Corner positions, indexed like VERTICES (the consensus figure, or the plain hypercube). */
  vertices: readonly Vector4D[];
  /** Votes per corner, indexed like VERTICES. Corners with votes show their emoji. */
  counts?: readonly number[];
  palette: Palette;
  /** Line and dot scale, for small canvases. */
  weight?: number;
  /** Overrides ZOOM, e.g. to fill a small snapshot. */
  zoom?: number;
}

export interface DrawnFigure {
  /** Screen position of each corner. */
  screen: { x: number; y: number; w: number }[];
}

/** Clears the canvas and draws the figure's edges, corners and corner emoji. */
export function drawFigure(ctx: CanvasRenderingContext2D, o: FigureOptions): DrawnFigure {
  const weight = o.weight ?? 1;
  ctx.clearRect(0, 0, o.size, o.size);
  const opts = { distance4D: DISTANCE_4D, distance3D: DISTANCE_3D, size: o.size, zoom: o.size * (o.zoom ?? ZOOM) };
  const corners = o.vertices.map((v) => {
    const r = rotate(v, o.rotation);
    return { w: r.w, p: project(r, opts) };
  });

  // Edges: tinted by where they sit along w, so the Rapt and Feral halves read as two bodies.
  ctx.lineCap = 'round';
  for (const [a, b] of EDGES) {
    const A = corners[a];
    const B = corners[b];
    const grad = ctx.createLinearGradient(A.p.x, A.p.y, B.p.x, B.p.y);
    grad.addColorStop(0, A.w >= 0 ? o.palette.rapt : o.palette.feral);
    grad.addColorStop(1, B.w >= 0 ? o.palette.rapt : o.palette.feral);
    ctx.strokeStyle = grad;
    ctx.globalAlpha = 0.28 + 0.4 * ((Math.max(-1, Math.min(1, A.w)) + Math.max(-1, Math.min(1, B.w)) + 2) / 4);
    ctx.lineWidth = 1.25 * weight;
    ctx.beginPath();
    ctx.moveTo(A.p.x, A.p.y);
    ctx.lineTo(B.p.x, B.p.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Emoji at the corners people picked, sized by share of the leader.
  const counts = o.counts ?? [];
  const top = Math.max(0, ...counts);
  if (top > 0) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    counts.forEach((n, i) => {
      if (n <= 0) return;
      const px = Math.min(26, Math.max(10, o.size * (0.025 + 0.03 * Math.sqrt(n / top))));
      ctx.font = `${px}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.fillText(CORNER_AT_VERTEX[i].emoji, corners[i].p.x, corners[i].p.y);
    });
    ctx.textAlign = 'start';
  }

  return { screen: corners.map((c) => ({ x: c.p.x, y: c.p.y, w: c.w })) };
}
