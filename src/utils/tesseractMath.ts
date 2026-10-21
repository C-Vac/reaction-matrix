/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 4D Tesseract Mathematics & Goblin Emotion Manifold Logic
 */

export interface Vector4D {
  x: number; // Axis X: Greed (+1) vs Spite (-1)
  y: number; // Axis Y: Bog-Euphoria (+1) vs Mold-Dread (-1)
  z: number; // Axis Z: Chaotic Mischief (+1) vs Burrow Hermit (-1)
  w: number; // Axis W: Extradimensional Shiny Hypnosis (+1) vs Feral Hiss (-1)
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ProjectedVertex {
  v4: Vector4D;
  v3: Point3D;
  v2: Point2D;
  scale3D: number;
  scale4D: number;
  depth: number;
  id: number;
  label?: string;
}

export interface HypercubeEdge {
  from: number;
  to: number;
}

export interface EmotionalArchetype {
  id: string;
  name: string;
  title: string;
  glyph: string;
  goblinQuote: string;
  primaryAxis: 'x' | 'y' | 'z' | 'w';
  color: string;
  glowColor: string;
  description: string;
  vector: Vector4D;
}

export interface ReactionRecord {
  id: string;
  targetId: string;
  author: string;
  timestamp: number;
  vector: Vector4D;
  archetype: EmotionalArchetype;
  confusionLevel: number;
  comment?: string;
}

export interface Rotation4D {
  xy: number;
  xz: number;
  xw: number;
  yz: number;
  yw: number;
  zw: number;
}

// 16 Vertices of a unit tesseract: (±1, ±1, ±1, ±1)
export function generateTesseractVertices(): Vector4D[] {
  const vertices: Vector4D[] = [];
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        for (let w = -1; w <= 1; w += 2) {
          vertices.push({ x, y, z, w });
        }
      }
    }
  }
  return vertices;
}

// 32 Edges: connect vertices that differ in exactly 1 coordinate
export function generateTesseractEdges(vertices: Vector4D[]): HypercubeEdge[] {
  const edges: HypercubeEdge[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let diffCount = 0;
      if (Math.abs(vertices[i].x - vertices[j].x) > 0.001) diffCount++;
      if (Math.abs(vertices[i].y - vertices[j].y) > 0.001) diffCount++;
      if (Math.abs(vertices[i].z - vertices[j].z) > 0.001) diffCount++;
      if (Math.abs(vertices[i].w - vertices[j].w) > 0.001) diffCount++;
      if (diffCount === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }
  return edges;
}

// 4D Rotation in 6 planes
export function rotateVector4D(v: Vector4D, rot: Rotation4D): Vector4D {
  let { x, y, z, w } = v;

  // XY Rotation
  if (rot.xy !== 0) {
    const cos = Math.cos(rot.xy);
    const sin = Math.sin(rot.xy);
    const nx = x * cos - y * sin;
    const ny = x * sin + y * cos;
    x = nx;
    y = ny;
  }

  // XZ Rotation
  if (rot.xz !== 0) {
    const cos = Math.cos(rot.xz);
    const sin = Math.sin(rot.xz);
    const nx = x * cos - z * sin;
    const nz = x * sin + z * cos;
    x = nx;
    z = nz;
  }

  // XW Rotation (true 4D rotation!)
  if (rot.xw !== 0) {
    const cos = Math.cos(rot.xw);
    const sin = Math.sin(rot.xw);
    const nx = x * cos - w * sin;
    const nw = x * sin + w * cos;
    x = nx;
    w = nw;
  }

  // YZ Rotation
  if (rot.yz !== 0) {
    const cos = Math.cos(rot.yz);
    const sin = Math.sin(rot.yz);
    const ny = y * cos - z * sin;
    const nz = y * sin + z * cos;
    y = ny;
    z = nz;
  }

  // YW Rotation (true 4D rotation!)
  if (rot.yw !== 0) {
    const cos = Math.cos(rot.yw);
    const sin = Math.sin(rot.yw);
    const ny = y * cos - w * sin;
    const nw = y * sin + w * cos;
    y = ny;
    w = nw;
  }

  // ZW Rotation (true 4D rotation!)
  if (rot.zw !== 0) {
    const cos = Math.cos(rot.zw);
    const sin = Math.sin(rot.zw);
    const nz = z * cos - w * sin;
    const nw = z * sin + w * cos;
    z = nz;
    w = nw;
  }

  return { x, y, z, w };
}

// Project 4D to 3D via perspective from 4D distance d4
export function project4Dto3D(v: Vector4D, distance4D: number = 2.4): { point3D: Point3D; scale4D: number } {
  // Prevent division by zero or negative flip
  const denom = Math.max(0.2, distance4D - v.w);
  const scale4D = 1 / denom;
  return {
    point3D: {
      x: v.x * scale4D,
      y: v.y * scale4D,
      z: v.z * scale4D,
    },
    scale4D,
  };
}

// Project 3D to 2D screen coordinates
export function project3Dto2D(
  p: Point3D,
  distance3D: number = 3.2,
  screenWidth: number = 500,
  screenHeight: number = 500,
  zoom: number = 180
): { point2D: Point2D; scale3D: number; depth: number } {
  const denom = Math.max(0.2, distance3D - p.z);
  const scale3D = 1 / denom;
  const cx = screenWidth / 2;
  const cy = screenHeight / 2;

  return {
    point2D: {
      x: cx + p.x * scale3D * zoom,
      y: cy - p.y * scale3D * zoom, // invert Y for screen coords
    },
    scale3D,
    depth: p.z,
  };
}

// Full 4D to 2D projection pipeline
export function project4Dto2D(
  v: Vector4D,
  distance4D: number,
  distance3D: number,
  screenWidth: number,
  screenHeight: number,
  zoom: number
): { point2D: Point2D; point3D: Point3D; scale4D: number; scale3D: number; depth: number } {
  const { point3D, scale4D } = project4Dto3D(v, distance4D);
  const { point2D, scale3D, depth } = project3Dto2D(point3D, distance3D, screenWidth, screenHeight, zoom);
  return { point2D, point3D, scale4D, scale3D, depth };
}

// Distance in 4D Euclidean space
export function distance4D(a: Vector4D, b: Vector4D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  const dw = a.w - b.w;
  return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
}

// Normalizes vector values to [-1, 1] range
export function clampVector4D(v: Vector4D): Vector4D {
  return {
    x: Math.max(-1, Math.min(1, v.x)),
    y: Math.max(-1, Math.min(1, v.y)),
    z: Math.max(-1, Math.min(1, v.z)),
    w: Math.max(-1, Math.min(1, v.w)),
  };
}

// 16 Canonical Goblin Emotional Archetypes corresponding to vertices
export const GOBLIN_ARCHETYPES: Record<string, EmotionalArchetype> = {
  // +X: Greed, -X: Spite
  // +Y: Bog Bliss, -Y: Mold Dread
  // +Z: Mischief, -Z: Hermit Hoard
  // +W: Shiny Hypnosis, -W: Feral Screech
  "1,1,1,1": {
    id: "radiant-bog-thief",
    name: "Radiant Bog Arch-Thief",
    title: "Supreme Shiny Hypnosis in Mud Nirvana",
    glyph: "🐸✨",
    goblinQuote: "My hands are sticky, my bog is warm, the 4th dimension bends for me alone!",
    primaryAxis: "w",
    color: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.6)",
    description: "Maximum greed, maximal bog joy, infinite mischief, and full hyper-shiny transcendence.",
    vector: { x: 1, y: 1, z: 1, w: 1 },
  },
  "-1,1,1,1": {
    id: "spiteful-bog-trickster",
    name: "Spiteful Bog Trickster",
    title: "Vengeful Mud Glee with Glinting Avarice",
    glyph: "🧌⚡",
    goblinQuote: "I threw your keys into the bog. Now I stare at the ripples in 4D.",
    primaryAxis: "x",
    color: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.6)",
    description: "High spite blended with profound mud bliss and mischievous extradimensional amusement.",
    vector: { x: -1, y: 1, z: 1, w: 1 },
  },
  "1,-1,1,1": {
    id: "anxious-shiny-gobbler",
    name: "Anxious Shiny Gobbler",
    title: "Existential Gold Paranoia with Prank Sparks",
    glyph: "🪙🍄",
    goblinQuote: "I stole all 94 spoons, but the cave ceiling is watching my soul rot.",
    primaryAxis: "y",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.6)",
    description: "Greedy hoarder paralyzed by mold dread, yet hypnotized by the glint of 4-space.",
    vector: { x: 1, y: -1, z: 1, w: 1 },
  },
  "-1,-1,1,1": {
    id: "cavern-chaos-gremlin",
    name: "Cavern Chaos Gremlin",
    title: "Pure Bitter Bedlam in Non-Euclidean Shadows",
    glyph: "🪓🌀",
    goblinQuote: "Nothing matters, so I shall gnaw on the bridge supports while giggling.",
    primaryAxis: "z",
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.6)",
    description: "Spiteful dread channeled entirely into chaotic hyper-mischief.",
    vector: { x: -1, y: -1, z: 1, w: 1 },
  },
  "1,1,-1,1": {
    id: "serene-burrow-monarch",
    name: "Serene Burrow Monarch",
    title: "Silent Mud Sovereign Guarding the Great Heap",
    glyph: "👑🪨",
    goblinQuote: "Sit quietly upon the compost throne. Count each pebble forty times.",
    primaryAxis: "w",
    color: "#eab308",
    glowColor: "rgba(234, 179, 8, 0.6)",
    description: "Peaceful bog satisfaction and greedy accumulation locked behind solemn burrow solitude.",
    vector: { x: 1, y: 1, z: -1, w: 1 },
  },
  "-1,1,-1,1": {
    id: "grudging-swamp-hermit",
    name: "Grudging Swamp Hermit",
    title: "Solitary Bog Spite Transcending Space",
    glyph: "🌿👀",
    goblinQuote: "Get out of my ditch. The ditch is full of ancient hyper-geometry.",
    primaryAxis: "x",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.6)",
    description: "Spiteful recluse loving their mud ditch while peering into the 4th dimension.",
    vector: { x: -1, y: 1, z: -1, w: 1 },
  },
  "1,-1,-1,1": {
    id: "brooding-hoard-warden",
    name: "Brooding Hoard Warden",
    title: "Gloomy Trinket Obsession in Hyper-Isolation",
    glyph: "🗝️🕯️",
    goblinQuote: "The mold eats my boots, yet the silver coin hums with secrets.",
    primaryAxis: "y",
    color: "#d97706",
    glowColor: "rgba(217, 119, 6, 0.6)",
    description: "Greedy, mold-stricken hermit entranced by mysterious extradimensional artifacts.",
    vector: { x: 1, y: -1, z: -1, w: 1 },
  },
  "-1,-1,-1,1": {
    id: "tesseract-void-lurker",
    name: "Tesseract Void Lurker",
    title: "Extradimensional Spite-Dread in Darkness",
    glyph: "🌌🕳️",
    goblinQuote: "I saw the hypercube rotate in reverse. Humans know nothing of the true dampness.",
    primaryAxis: "w",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.6)",
    description: "Spite, dread, and solitude bathed in cold extradimensional glow.",
    vector: { x: -1, y: -1, z: -1, w: 1 },
  },
  "1,1,1,-1": {
    id: "feral-cackler-prime",
    name: "Feral Cackler Prime",
    title: "Wild Bog Joy Screeching at the Heavens",
    glyph: "🍖💥",
    goblinQuote: "HISSS! I stole the roast chicken and I am rolling in warm sludge!",
    primaryAxis: "w",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.6)",
    description: "Primal screeching feral glee, filthy rich in mud and mischief.",
    vector: { x: 1, y: 1, z: 1, w: -1 },
  },
  "-1,1,1,-1": {
    id: "malicious-pebble-flinger",
    name: "Malicious Pebble-Flinger",
    title: "Pure Swamp Spite & Feral Prank Velocity",
    glyph: "🎯🪨",
    goblinQuote: "PING! Direct hit on the knight's visor! Now back into the reeds!",
    primaryAxis: "z",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.6)",
    description: "Primal screaming mischief and vengeful bog merriment.",
    vector: { x: -1, y: 1, z: 1, w: -1 },
  },
  "1,-1,1,-1": {
    id: "scuttling-trinket-hyena",
    name: "Scuttling Trinket Hyena",
    title: "Feral Greed-Panic in the Damp Shadows",
    glyph: "🦴🐾",
    goblinQuote: "Mine mine mine! Don't look at it! I hiss at the shadows!",
    primaryAxis: "x",
    color: "#ea580c",
    glowColor: "rgba(234, 88, 12, 0.6)",
    description: "Chaotic greedy scuttler screeching in panic at mold spores.",
    vector: { x: 1, y: -1, z: 1, w: -1 },
  },
  "-1,-1,1,-1": {
    id: "berserk-bog-banshee",
    name: "Berserk Bog Banshee",
    title: "Ultimate Unhinged Chaos-Hiss",
    glyph: "👺🔥",
    goblinQuote: "SKREEEEEE! BITE THE BOOTS! KICK THE LOGS! SINK THE BOATS!",
    primaryAxis: "w",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.6)",
    description: "Unadulterated goblin rage, mold despair, and violent feral prankery.",
    vector: { x: -1, y: -1, z: 1, w: -1 },
  },
  "1,1,-1,-1": {
    id: "mud-burrow-hoarder",
    name: "Mud-Burrow Hoarder",
    title: "Satisfied Sludge Badger Snarling at Visitors",
    glyph: "🦡🥔",
    goblinQuote: "Warm mud on the belly, shiny pebbles in the cheeks. Step closer and get bit.",
    primaryAxis: "y",
    color: "#84cc16",
    glowColor: "rgba(132, 204, 22, 0.6)",
    description: "Content with bog warmth and shiny loot, but violently protective and reclusive.",
    vector: { x: 1, y: 1, z: -1, w: -1 },
  },
  "-1,1,-1,-1": {
    id: "spiteful-cave-moss-eater",
    name: "Spiteful Cave Moss-Eater",
    title: "Silent Swamp Grudge with Feral Snarl",
    glyph: "🍄‍🟫🌿",
    goblinQuote: "The green moss is sweet. You humans taste like perfumed chalk.",
    primaryAxis: "x",
    color: "#059669",
    glowColor: "rgba(5, 150, 105, 0.6)",
    description: "Quiet bog contentment mixed with raw territorial spite and feral hiss.",
    vector: { x: -1, y: 1, z: -1, w: -1 },
  },
  "1,-1,-1,-1": {
    id: "desperate-scraps-scavenger",
    name: "Desperate Scraps Scavenger",
    title: "Pitiable Greedy Paranoia in Wet Dark",
    glyph: "🐀🍂",
    goblinQuote: "One rusty bent nail... treasures beyond human comprehension...",
    primaryAxis: "y",
    color: "#a16207",
    glowColor: "rgba(161, 98, 7, 0.6)",
    description: "Moldy, solitary hoarder snarling over worthless human trash.",
    vector: { x: 1, y: -1, z: -1, w: -1 },
  },
  "-1,-1,-1,-1": {
    id: "primal-under-bog-spite-stone",
    name: "Primal Under-Bog Spite-Stone",
    title: "Pure Negative Extradimensional Density",
    glyph: "🗿⬛",
    goblinQuote: "Cold stone. Heavy spite. Unmoved by eons of human nonsense.",
    primaryAxis: "x",
    color: "#475569",
    glowColor: "rgba(71, 85, 105, 0.6)",
    description: "Total spite, total mold dread, total hermit isolation, absolute feral silence.",
    vector: { x: -1, y: -1, z: -1, w: -1 },
  },
};

// Classify any continuous 4D vector into a customized Goblin Emotion
export function classifyEmotionalVector(v: Vector4D): EmotionalArchetype {
  const clamped = clampVector4D(v);

  // Find nearest discrete vertex
  const vx = clamped.x >= 0 ? 1 : -1;
  const vy = clamped.y >= 0 ? 1 : -1;
  const vz = clamped.z >= 0 ? 1 : -1;
  const vw = clamped.w >= 0 ? 1 : -1;
  const key = `${vx},${vy},${vz},${vw}`;

  const base = GOBLIN_ARCHETYPES[key] || GOBLIN_ARCHETYPES["1,1,1,1"];

  // Compute dominant axis and strength
  const ax = Math.abs(clamped.x);
  const ay = Math.abs(clamped.y);
  const az = Math.abs(clamped.z);
  const aw = Math.abs(clamped.w);
  const maxAxisVal = Math.max(ax, ay, az, aw);

  let primaryAxis: 'x' | 'y' | 'z' | 'w' = 'x';
  if (maxAxisVal === ay) primaryAxis = 'y';
  else if (maxAxisVal === az) primaryAxis = 'z';
  else if (maxAxisVal === aw) primaryAxis = 'w';

  // Generate dynamic nuanced title based on coordinates
  const xDesc = clamped.x > 0.3 ? "Greedy" : clamped.x < -0.3 ? "Spiteful" : "Balanced";
  const yDesc = clamped.y > 0.3 ? "Mud-Blissful" : clamped.y < -0.3 ? "Mold-Dreading" : "Lukewarm";
  const zDesc = clamped.z > 0.3 ? "Mischievous" : clamped.z < -0.3 ? "Reclusive" : "Neutral";
  const wDesc = clamped.w > 0.3 ? "Hyper-Hypnotized" : clamped.w < -0.3 ? "Feral-Hissing" : "Sub-Dimensional";

  const dynamicTitle = `${xDesc} & ${yDesc} (${zDesc}, ${wDesc})`;

  return {
    ...base,
    title: dynamicTitle,
    vector: clamped,
    primaryAxis,
  };
}

// Calculate human confusion level (0 to 100%)
export function calculateConfusionIndex(
  cumulativeAngularTumble: number,
  axisAdjustments: number,
  timeDraggingMs: number
): { index: number; label: string; goblinComment: string; severity: 'low' | 'med' | 'high' | 'critical' } {
  // Score formula factoring rotational chaos, interaction toggles, and duration
  const rotScore = Math.min(45, cumulativeAngularTumble * 7);
  const adjustScore = Math.min(30, axisAdjustments * 3);
  const timeScore = Math.min(25, (timeDraggingMs / 1000) * 1.5);

  const raw = Math.round(rotScore + adjustScore + timeScore);
  const index = Math.min(100, Math.max(0, raw));

  if (index < 25) {
    return {
      index,
      label: "Mild Spatial Disorientation",
      goblinComment: "Human still thinks in 3 spatial dimensions. Pathetic.",
      severity: "low",
    };
  }
  if (index < 55) {
    return {
      index,
      label: "Vestibular Coordinate Liquefaction",
      goblinComment: "Look at them squirm! They are trying to find where the W axis goes!",
      severity: "med",
    };
  }
  if (index < 85) {
    return {
      index,
      label: "Extradimensional Mind-Twist",
      goblinComment: "Goblins rejoice! The human's prefrontal cortex is rotating at 90 degrees to reality!",
      severity: "high",
    };
  }
  return {
    index,
    label: "100% Non-Euclidean Bog Slime",
    goblinComment: "COMPLETE TRANSCENDENCE! The human has surrendered all comprehension to the 4D Mud Council!",
    severity: "critical",
  };
}

// Average multiple 4D vectors for aggregated community reactions
export function averageVectors4D(vectors: Vector4D[]): Vector4D {
  if (vectors.length === 0) return { x: 0, y: 0, z: 0, w: 0 };
  let sx = 0, sy = 0, sz = 0, sw = 0;
  for (const v of vectors) {
    sx += v.x;
    sy += v.y;
    sz += v.z;
    sw += v.w;
  }
  const n = vectors.length;
  return {
    x: Number((sx / n).toFixed(2)),
    y: Number((sy / n).toFixed(2)),
    z: Number((sz / n).toFixed(2)),
    w: Number((sw / n).toFixed(2)),
  };
}
