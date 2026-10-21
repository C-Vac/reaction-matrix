/**
 * @file math.ts
 * @description Pure (no React, no DOM) geometry, vocabulary and aggregation for the reaction matrix.
 * Safe to import on the server: validation and summary updates use the same code the client does.
 *
 * A reaction is a point in a 4D unit hypercube. Each axis runs from -1 to +1 between two poles; the
 * 16 corners of the hypercube are the 16 named reactions. Anything between corners is read as the
 * nearest corner plus an intensity.
 */

export interface Vector4D {
  x: number;
  y: number;
  z: number;
  w: number;
}

export type AxisKey = keyof Vector4D;

export interface AxisDef {
  key: AxisKey;
  name: string;
  negative: string;
  positive: string;
}

export const AXES: readonly AxisDef[] = [
  { key: 'x', name: 'Appetite', negative: 'Spite', positive: 'Greed' },
  { key: 'y', name: 'Weather', negative: 'Dread', positive: 'Ease' },
  { key: 'z', name: 'Conduct', negative: 'Withdrawn', positive: 'Mischief' },
  { key: 'w', name: 'Trance', negative: 'Feral', positive: 'Rapt' },
];

export const ORIGIN: Vector4D = { x: 0, y: 0, z: 0, w: 0 };

export function clampVector(v: Vector4D): Vector4D {
  const c = (n: number) => Math.max(-1, Math.min(1, n));
  return { x: c(v.x), y: c(v.y), z: c(v.z), w: c(v.w) };
}

export function distance4D(a: Vector4D, b: Vector4D): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
}

// ---------------------------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------------------------

export interface Archetype {
  id: string;
  name: string;
  /** One dry line. Not a tooltip, not a joke: a description of the corner. */
  gloss: string;
  vector: Vector4D;
}

/** Corner definitions keyed by the sign of each axis, in x y z w order. */
const CORNERS: Record<string, [id: string, name: string, gloss: string]> = {
  '++++': ['rapture', 'Rapture', 'Wanting it, and enjoying the wanting.'],
  '-+++': ['schadenfreude', 'Schadenfreude', "Somebody else's loss, thoroughly enjoyed."],
  '+-++': ['avarice', 'Avarice', 'Wanting it, and afraid of who else does.'],
  '--++': ['malice', 'Malice', 'Harm planned, fear included.'],
  '++-+': ['smugness', 'Smugness', 'Hoard secured. Visitors tolerated.'],
  '-+-+': ['grudge', 'Grudge', 'Content, and keeping score.'],
  '+--+': ['longing', 'Longing', 'Wanting it from a distance, in the dark.'],
  '---+': ['vertigo', 'Vertigo', 'Spite and dread with nothing to hold on to.'],
  '+++-': ['frenzy', 'Frenzy', 'Wanting everything, loudly.'],
  '-++-': ['mockery', 'Mockery', 'Spite, delivered at volume.'],
  '+-+-': ['panic', 'Panic', 'Clutching the thing, hissing at the dark.'],
  '--+-': ['rage', 'Rage', 'Spite, dread, and teeth.'],
  '++--': ['possessiveness', 'Possessiveness', 'Comfortable, and ready to bite.'],
  '-+--': ['contempt', 'Contempt', 'Calm, withdrawn, unimpressed.'],
  '+---': ['paranoia', 'Paranoia', 'Wanting it, hiding it, watching the door.'],
  '----': ['numbness', 'Numbness', 'Nothing gets through.'],
};

const sign = (c: string) => (c === '+' ? 1 : -1);

export const ARCHETYPES: readonly Archetype[] = Object.entries(CORNERS).map(
  ([signs, [id, name, gloss]]) => ({
    id,
    name,
    gloss,
    vector: { x: sign(signs[0]), y: sign(signs[1]), z: sign(signs[2]), w: sign(signs[3]) },
  })
);

/** What the origin reads as: a real answer, not a missing one. */
export const UNMOVED: Archetype = {
  id: 'unmoved',
  name: 'Unmoved',
  gloss: 'Registers, but barely.',
  vector: ORIGIN,
};

const BY_ID = new Map<string, Archetype>([...ARCHETYPES, UNMOVED].map((a) => [a.id, a]));

export function archetypeById(id: string): Archetype | undefined {
  return BY_ID.get(id);
}

export function nearestCorner(v: Vector4D): Archetype {
  const key = [v.x, v.y, v.z, v.w].map((n) => (n >= 0 ? '+' : '-')).join('');
  const [id] = CORNERS[key];
  return BY_ID.get(id)!;
}

/** Index into VERTICES of the corner a point is nearest to. */
export function vertexIndexOf(v: Vector4D): number {
  return (v.x >= 0 ? 8 : 0) | (v.y >= 0 ? 4 : 0) | (v.z >= 0 ? 2 : 0) | (v.w >= 0 ? 1 : 0);
}

/** The named reaction at each corner, indexed like VERTICES. */
export const CORNER_AT_VERTEX: readonly Archetype[] = Array.from({ length: 16 }, (_, i) => {
  const v = { x: i & 8 ? 1 : -1, y: i & 4 ? 1 : -1, z: i & 2 ? 1 : -1, w: i & 1 ? 1 : -1 };
  return nearestCorner(v);
});

export type IntensityLabel = 'Faint' | 'Moderate' | 'Pronounced' | 'Total';

export interface Reading {
  archetype: Archetype;
  /** 0 at the origin, 1 at a corner. */
  intensity: number;
  intensityLabel: IntensityLabel;
  /** The axis with the largest absolute value. */
  dominantAxis: AxisKey;
}

/** Below this 4D distance from the origin the reading is "Unmoved". Corners sit at distance 2. */
const UNMOVED_RADIUS = 0.35;

export function readVector(input: Vector4D): Reading {
  const v = clampVector(input);
  const norm = Math.hypot(v.x, v.y, v.z, v.w);
  const intensity = Math.min(1, norm / 2);
  const intensityLabel: IntensityLabel =
    intensity < 0.25 ? 'Faint' : intensity < 0.5 ? 'Moderate' : intensity < 0.75 ? 'Pronounced' : 'Total';
  const dominantAxis = (['x', 'y', 'z', 'w'] as const).reduce((best, k) =>
    Math.abs(v[k]) > Math.abs(v[best]) ? k : best
  );
  return {
    archetype: norm < UNMOVED_RADIUS ? UNMOVED : nearestCorner(v),
    intensity,
    intensityLabel,
    dominantAxis,
  };
}

// ---------------------------------------------------------------------------------------------
// Disorientation
// ---------------------------------------------------------------------------------------------

export interface Disorientation {
  /** 0 to 100. */
  index: number;
  label: string;
  remark: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/** How lost the person is: tumbling, axis fiddling and time spent all count. */
export function measureDisorientation(input: {
  tumble: number;
  adjustments: number;
  elapsedMs: number;
}): Disorientation {
  const rot = Math.min(45, input.tumble * 7);
  const adj = Math.min(30, input.adjustments * 3);
  const time = Math.min(25, (input.elapsedMs / 1000) * 1.5);
  const index = Math.min(100, Math.max(0, Math.round(rot + adj + time)));

  if (index < 25) return { index, label: 'Oriented', remark: 'Still three-dimensional.', severity: 'low' };
  if (index < 55) return { index, label: 'Drifting', remark: 'The fourth axis is not helping.', severity: 'medium' };
  if (index < 85) return { index, label: 'Lost', remark: 'No longer sure which way is out.', severity: 'high' };
  return { index, label: 'Gone', remark: 'Past the point of coordinates.', severity: 'critical' };
}

// ---------------------------------------------------------------------------------------------
// Reactions and aggregation
// ---------------------------------------------------------------------------------------------

/** What the picker hands back when someone locks in. */
export interface ReactionDraft {
  vector: Vector4D;
  archetypeId: string;
  /** 0 to 100. */
  disorientation: number;
}

export interface ReactionRecord extends ReactionDraft {
  id: string;
  targetId: string;
  timestamp: number;
  /** Public display name, resolved by the host. Never set by the picker. */
  author?: string;
}

/**
 * Running totals for one target. Sums (not means) so a reaction can be added, replaced or removed
 * in O(1) without reading every vote.
 */
export interface ReactionSummary {
  count: number;
  sum: Vector4D;
  archetypeCounts: Record<string, number>;
}

export const EMPTY_SUMMARY: ReactionSummary = { count: 0, sum: ORIGIN, archetypeCounts: {} };

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;

export function meanVector(s: ReactionSummary): Vector4D | null {
  if (s.count <= 0) return null;
  const m = (n: number) => Math.round((n / s.count) * 100) / 100;
  return { x: m(s.sum.x), y: m(s.sum.y), z: m(s.sum.z), w: m(s.sum.w) };
}

/** Archetype ids ordered by how many people picked them, most first. */
export function topArchetypes(s: ReactionSummary, limit = 5): { archetype: Archetype; count: number }[] {
  return Object.entries(s.archetypeCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .flatMap(([id, count]) => {
      const archetype = archetypeById(id);
      return archetype ? [{ archetype, count }] : [];
    })
    .slice(0, limit);
}

/**
 * Adds `next` to the summary, first taking `prev` back out if the same person is revising.
 * Pure: returns a new summary.
 */
export function applyReaction(
  summary: ReactionSummary,
  next: Pick<ReactionDraft, 'vector' | 'archetypeId'>,
  prev?: Pick<ReactionDraft, 'vector' | 'archetypeId'> | null
): ReactionSummary {
  const sum = { ...summary.sum };
  const archetypeCounts = { ...summary.archetypeCounts };
  let count = summary.count;

  if (prev) {
    sum.x -= prev.vector.x;
    sum.y -= prev.vector.y;
    sum.z -= prev.vector.z;
    sum.w -= prev.vector.w;
    count -= 1;
    const left = (archetypeCounts[prev.archetypeId] ?? 0) - 1;
    if (left > 0) archetypeCounts[prev.archetypeId] = left;
    else delete archetypeCounts[prev.archetypeId];
  }

  sum.x += next.vector.x;
  sum.y += next.vector.y;
  sum.z += next.vector.z;
  sum.w += next.vector.w;
  count += 1;
  archetypeCounts[next.archetypeId] = (archetypeCounts[next.archetypeId] ?? 0) + 1;

  return {
    count,
    sum: { x: round4(sum.x), y: round4(sum.y), z: round4(sum.z), w: round4(sum.w) },
    archetypeCounts,
  };
}

/**
 * Validates untrusted input (a request body, localStorage) into a draft. The archetype is
 * recomputed from the vector rather than believed, and coordinates are rounded to 0.01.
 */
export function sanitizeDraft(input: unknown): ReactionDraft | null {
  if (!input || typeof input !== 'object') return null;
  const o = input as Record<string, unknown>;
  const v = o.vector as Record<string, unknown> | undefined;
  if (!v || typeof v !== 'object') return null;
  const coords = [v.x, v.y, v.z, v.w];
  if (!coords.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  const r = (n: unknown) => Math.round((n as number) * 100) / 100;
  const vector = clampVector({ x: r(v.x), y: r(v.y), z: r(v.z), w: r(v.w) });
  const dis = typeof o.disorientation === 'number' && Number.isFinite(o.disorientation) ? o.disorientation : 0;
  return {
    vector,
    archetypeId: readVector(vector).archetype.id,
    disorientation: Math.max(0, Math.min(100, Math.round(dis))),
  };
}

// ---------------------------------------------------------------------------------------------
// Hypercube geometry
// ---------------------------------------------------------------------------------------------

/** 16 corners. Index bits, high to low, are x y z w (1 = +1, 0 = -1). */
export const VERTICES: readonly Vector4D[] = Array.from({ length: 16 }, (_, i) => ({
  x: i & 8 ? 1 : -1,
  y: i & 4 ? 1 : -1,
  z: i & 2 ? 1 : -1,
  w: i & 1 ? 1 : -1,
}));

/** 32 edges: corners whose indices differ in exactly one bit. */
export const EDGES: readonly [number, number][] = VERTICES.flatMap((_, i) =>
  [1, 2, 4, 8].filter((bit) => !(i & bit)).map((bit) => [i, i | bit] as [number, number])
);

export interface Rotation4D {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

export const NO_ROTATION: Rotation4D = { xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 };

const PLANES: readonly [keyof Rotation4D, AxisKey, AxisKey][] = [
  ['xy', 'x', 'y'],
  ['xz', 'x', 'z'],
  ['xw', 'x', 'w'],
  ['yz', 'y', 'z'],
  ['yw', 'y', 'w'],
  ['zw', 'z', 'w'],
];

export function rotate(v: Vector4D, rot: Rotation4D): Vector4D {
  const out = { ...v };
  for (const [plane, a, b] of PLANES) {
    const angle = rot[plane];
    if (!angle) continue;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const na = out[a] * cos - out[b] * sin;
    const nb = out[a] * sin + out[b] * cos;
    out[a] = na;
    out[b] = nb;
  }
  return out;
}

export interface Projection {
  /** Screen position in pixels. */
  x: number;
  y: number;
  /** Perspective scale from the 4D to 3D step; larger means nearer in w. */
  scale: number;
  /** Distance along z after projection; larger means nearer the viewer. */
  depth: number;
}

export interface ProjectionOptions {
  distance4D: number;
  distance3D: number;
  /** Canvas size in pixels (square). */
  size: number;
  /** Pixels per unit at scale 1. */
  zoom: number;
}

/** Perspective-projects a 4D point to 3D along w, then to the screen along z. */
export function project(v: Vector4D, o: ProjectionOptions): Projection {
  const s4 = 1 / Math.max(0.2, o.distance4D - v.w);
  const x3 = v.x * s4;
  const y3 = v.y * s4;
  const z3 = v.z * s4;
  const s3 = 1 / Math.max(0.2, o.distance3D - z3);
  return {
    x: o.size / 2 + x3 * s3 * o.zoom,
    y: o.size / 2 - y3 * s3 * o.zoom,
    scale: s4,
    depth: z3,
  };
}
