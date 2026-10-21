import { describe, expect, it } from 'vitest';
import {
  ARCHETYPES,
  EDGES,
  EMPTY_SUMMARY,
  ORIGIN,
  VERTICES,
  applyReaction,
  archetypeById,
  measureDisorientation,
  meanVector,
  nearestCorner,
  project,
  readVector,
  rotate,
  sanitizeDraft,
  topArchetypes,
  vertexIndexOf,
  CORNER_AT_VERTEX,
  NO_ROTATION,
} from './math';

describe('hypercube geometry', () => {
  it('has 16 vertices and 32 edges, each edge changing one coordinate', () => {
    expect(VERTICES).toHaveLength(16);
    expect(EDGES).toHaveLength(32);
    for (const [a, b] of EDGES) {
      const A = VERTICES[a];
      const B = VERTICES[b];
      const changed = (['x', 'y', 'z', 'w'] as const).filter((k) => A[k] !== B[k]).length;
      expect(changed).toBe(1);
    }
  });

  it('rotation preserves length and identity rotation is a no-op', () => {
    const v = { x: 0.3, y: -0.7, z: 0.1, w: 0.9 };
    expect(rotate(v, NO_ROTATION)).toEqual(v);
    const r = rotate(v, { xy: 1, xz: 0.4, xw: 2, yz: 0.1, yw: 0.7, zw: 1.3 });
    expect(Math.hypot(r.x, r.y, r.z, r.w)).toBeCloseTo(Math.hypot(v.x, v.y, v.z, v.w), 10);
  });

  it('projects the origin to the canvas centre', () => {
    const p = project(ORIGIN, { distance4D: 2.5, distance3D: 3.2, size: 400, zoom: 500 });
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(200);
  });

  it('vertexIndexOf agrees with VERTICES', () => {
    VERTICES.forEach((v, i) => expect(vertexIndexOf(v)).toBe(i));
  });
});

describe('vocabulary', () => {
  it('names all 16 corners uniquely, one per vertex', () => {
    expect(ARCHETYPES).toHaveLength(16);
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(16);
    expect(new Set(ARCHETYPES.map((a) => a.name)).size).toBe(16);
    CORNER_AT_VERTEX.forEach((a, i) => expect(a.vector).toEqual(VERTICES[i]));
  });

  it('reads the origin as Unmoved and a corner as itself at full intensity', () => {
    expect(readVector(ORIGIN).archetype.id).toBe('unmoved');
    for (const a of ARCHETYPES) {
      const reading = readVector(a.vector);
      expect(reading.archetype.id).toBe(a.id);
      expect(reading.intensity).toBe(1);
      expect(reading.intensityLabel).toBe('Total');
    }
  });

  it('classifies by sign and finds archetypes by id', () => {
    expect(nearestCorner({ x: -0.2, y: 0.9, z: 0.1, w: 0.4 }).id).toBe('schadenfreude');
    expect(archetypeById('unmoved')?.name).toBe('Unmoved');
    expect(archetypeById('nope')).toBeUndefined();
  });
});

describe('disorientation', () => {
  it('starts oriented and ends gone', () => {
    expect(measureDisorientation({ tumble: 0, adjustments: 0, elapsedMs: 0 }).severity).toBe('low');
    const gone = measureDisorientation({ tumble: 100, adjustments: 100, elapsedMs: 600_000 });
    expect(gone.index).toBe(100);
    expect(gone.severity).toBe('critical');
  });
});

describe('summary aggregation', () => {
  const a = { vector: { x: 1, y: 1, z: 1, w: 1 }, archetypeId: 'rapture' };
  const b = { vector: { x: -1, y: -1, z: -1, w: -1 }, archetypeId: 'numbness' };

  it('adds reactions and computes the mean', () => {
    const s = applyReaction(applyReaction(EMPTY_SUMMARY, a), b);
    expect(s.count).toBe(2);
    expect(meanVector(s)).toEqual({ x: 0, y: 0, z: 0, w: 0 });
    expect(s.archetypeCounts).toEqual({ rapture: 1, numbness: 1 });
  });

  it('replaces a prior reaction instead of double counting', () => {
    const first = applyReaction(EMPTY_SUMMARY, a);
    const revised = applyReaction(first, b, a);
    expect(revised.count).toBe(1);
    expect(revised.archetypeCounts).toEqual({ numbness: 1 });
    expect(revised.sum).toEqual(b.vector);
  });

  it('has no mean when empty and ranks archetypes by count', () => {
    expect(meanVector(EMPTY_SUMMARY)).toBeNull();
    const s = applyReaction(applyReaction(applyReaction(EMPTY_SUMMARY, b), b), a);
    expect(topArchetypes(s)[0].archetype.id).toBe('numbness');
  });
});

describe('sanitizeDraft', () => {
  it('clamps, rounds, and recomputes the archetype from the vector', () => {
    const d = sanitizeDraft({
      vector: { x: 5, y: -0.123, z: 0.5, w: 1 },
      archetypeId: 'lies',
      disorientation: 250.4,
    });
    expect(d).toEqual({
      vector: { x: 1, y: -0.12, z: 0.5, w: 1 },
      archetypeId: 'avarice',
      disorientation: 100,
    });
  });

  it('rejects malformed input', () => {
    expect(sanitizeDraft(null)).toBeNull();
    expect(sanitizeDraft({})).toBeNull();
    expect(sanitizeDraft({ vector: { x: 'a', y: 0, z: 0, w: 0 } })).toBeNull();
    expect(sanitizeDraft({ vector: { x: NaN, y: 0, z: 0, w: 0 } })).toBeNull();
  });
});
