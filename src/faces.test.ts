import { describe, expect, it } from 'vitest';
import { faceCell, faceStyle } from './faces';
import { ARCHETYPES, UNMOVED } from './math';

describe('faces', () => {
  it('gives every reaction its own cell in the sprite', () => {
    const cells = [...ARCHETYPES, UNMOVED].map((a) => faceCell(a.id));
    expect(new Set(cells).size).toBe(cells.length);
    expect(Math.max(...cells)).toBeLessThan(20);
  });

  it('shows the unmoved face for an id it does not know', () => {
    expect(faceCell('nope')).toBe(faceCell('unmoved'));
  });

  it('positions a cell by its column and row', () => {
    expect(faceStyle('rapture', 10).backgroundPosition).toBe('-0px -0px');
    expect(faceStyle('rage', 10).backgroundPosition).toBe('-10px -20px');
  });
});
