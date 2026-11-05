import React from 'react';
import { faceStyle } from './faces';
import type { Archetype } from './math';

/** An archetype's goblin face. Decorative: the host always prints the name beside it. */
export function Face({ archetype, size = 18 }: { archetype: Pick<Archetype, 'id'>; size?: number }) {
  return <span aria-hidden="true" style={faceStyle(archetype.id, size)} />;
}
