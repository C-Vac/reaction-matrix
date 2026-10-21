/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTesseractVertices,
  generateTesseractEdges,
  rotateVector4D,
  project4Dto3D,
  project3Dto2D,
  distance4D,
  classifyEmotionalVector,
  calculateConfusionIndex,
  averageVectors4D,
  GOBLIN_ARCHETYPES,
} from './tesseractMath.ts';
import type { Vector4D } from './tesseractMath.ts';

test('Tesseract geometry produces exactly 16 vertices and 32 edges', () => {
  const vertices = generateTesseractVertices();
  assert.equal(vertices.length, 16);

  // Check that all coordinates are +1 or -1
  for (const v of vertices) {
    assert.ok(v.x === 1 || v.x === -1);
    assert.ok(v.y === 1 || v.y === -1);
    assert.ok(v.z === 1 || v.z === -1);
    assert.ok(v.w === 1 || v.w === -1);
  }

  const edges = generateTesseractEdges(vertices);
  assert.equal(edges.length, 32);

  // Each vertex in a 4D hypercube has degree 4 (4 * 16 / 2 = 32 edges)
  const degrees = new Array(16).fill(0);
  for (const edge of edges) {
    degrees[edge.from]++;
    degrees[edge.to]++;
  }
  for (let i = 0; i < 16; i++) {
    assert.equal(degrees[i], 4, `Vertex ${i} should have degree 4`);
  }
});

test('4D rotation preserves Euclidean distance/norm', () => {
  const v: Vector4D = { x: 1, y: 0.5, z: -0.2, w: 0.8 };
  const origNorm = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z + v.w * v.w);

  // Test multi-plane rotation including true 4D planes XW and YW
  const rotated = rotateVector4D(v, {
    xy: 0.5,
    xz: -0.3,
    xw: 0.8,
    yz: 0.2,
    yw: -0.4,
    zw: 0.6,
  });

  const rotatedNorm = Math.sqrt(
    rotated.x * rotated.x +
    rotated.y * rotated.y +
    rotated.z * rotated.z +
    rotated.w * rotated.w
  );

  assert.ok(Math.abs(origNorm - rotatedNorm) < 1e-5, 'Norm must be preserved after 4D rotation');
});

test('4D to 3D and 3D to 2D projections work predictably', () => {
  const v: Vector4D = { x: 1, y: 1, z: 1, w: 0 };
  const { point3D, scale4D } = project4Dto3D(v, 2.5);
  assert.ok(Number.isFinite(point3D.x));
  assert.ok(Number.isFinite(point3D.y));
  assert.ok(Number.isFinite(point3D.z));
  assert.ok(scale4D > 0);

  const { point2D, scale3D } = project3Dto2D(point3D, 3.0, 400, 400, 150);
  assert.ok(Number.isFinite(point2D.x));
  assert.ok(Number.isFinite(point2D.y));
  assert.ok(scale3D > 0);
  // Center is at 200, 200
  assert.ok(point2D.x > 200);
});

test('Emotion vector classification maps to all 16 canonical goblin archetypes', () => {
  const archetypes = Object.keys(GOBLIN_ARCHETYPES);
  assert.equal(archetypes.length, 16);

  // Test radiant-bog-thief (+1, +1, +1, +1)
  const radiant = classifyEmotionalVector({ x: 0.9, y: 0.8, z: 0.5, w: 0.7 });
  assert.equal(radiant.id, 'radiant-bog-thief');
  assert.ok(radiant.title.length > 0);
  assert.ok(radiant.glyph.length > 0);

  // Test spiteful-bog-trickster (-1, +1, +1, +1)
  const spiteful = classifyEmotionalVector({ x: -0.8, y: 0.7, z: 0.9, w: 0.4 });
  assert.equal(spiteful.id, 'spiteful-bog-trickster');

  // Test primal under-bog spite-stone (-1, -1, -1, -1)
  const darkStone = classifyEmotionalVector({ x: -0.9, y: -0.8, z: -0.7, w: -0.9 });
  assert.equal(darkStone.id, 'primal-under-bog-spite-stone');
});

test('Confusion index scales properly with angular tumble and interaction', () => {
  const low = calculateConfusionIndex(0.2, 1, 500);
  assert.equal(low.severity, 'low');
  assert.ok(low.index < 30);

  const high = calculateConfusionIndex(12, 15, 25000);
  assert.ok(high.index >= 85);
  assert.equal(high.severity, 'critical');
  assert.ok(high.goblinComment.includes('TRANSCENDENCE'));
});

test('Averaging vectors works correctly', () => {
  const vectors: Vector4D[] = [
    { x: 1, y: 1, z: 0, w: 0.5 },
    { x: -1, y: 0.5, z: 1, w: -0.5 },
  ];
  const avg = averageVectors4D(vectors);
  assert.equal(avg.x, 0);
  assert.equal(avg.y, 0.75);
  assert.equal(avg.z, 0.5);
  assert.equal(avg.w, 0);
});
