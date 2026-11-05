/**
 * The goblin faces: one sprite, drawn by the host's art department, that stands in for the emoji
 * on every surface. `emoji` stays on each archetype as the canvas fallback until the sheet loads.
 * The CDN sends no CORS headers, so the canvas is tainted once a face is on it. Nothing here reads
 * pixels back or exports the canvas, so that's fine.
 */
const SPRITE = 'https://cdn.goblinlife.org/site/sprites/reactions.webp';
const COLUMNS = 5;
const ROWS = 4;

const ORDER = [
  'rapture', 'schadenfreude', 'avarice', 'malice', 'smugness',
  'grudge', 'longing', 'vertigo', 'frenzy', 'mockery',
  'panic', 'rage', 'possessiveness', 'contempt', 'paranoia',
  'numbness', 'unmoved',
];

export function faceCell(id: string): number {
  const cell = ORDER.indexOf(id);
  return cell < 0 ? ORDER.indexOf('unmoved') : cell;
}

/** CSS for one face at `size` pixels square. */
export function faceStyle(id: string, size: number) {
  const cell = faceCell(id);
  return {
    display: 'inline-block',
    width: size,
    height: size,
    flexShrink: 0,
    verticalAlign: '-0.2em',
    backgroundImage: `url(${SPRITE})`,
    backgroundSize: `${COLUMNS * size}px ${ROWS * size}px`,
    backgroundPosition: `-${(cell % COLUMNS) * size}px -${Math.floor(cell / COLUMNS) * size}px`,
  } as const;
}

let sheet: HTMLImageElement | null = null;
const waiting = new Set<() => void>();

function loadSheet(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!sheet) {
    sheet = new Image();
    sheet.onload = () => {
      waiting.forEach((run) => run());
      waiting.clear();
    };
    sheet.src = SPRITE;
  }
  return sheet;
}

function ready(img: HTMLImageElement | null): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

export const facesReady = () => ready(loadSheet());

/** Runs once when the sheet arrives, for canvases that only draw on demand. Returns a cancel. */
export function whenFacesLoad(run: () => void): () => void {
  if (facesReady()) return () => {};
  waiting.add(run);
  return () => waiting.delete(run);
}

/** Draws a face centered on (x, y). False means the sheet isn't ready, so draw the emoji. */
export function drawFace(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, size: number): boolean {
  const img = loadSheet();
  if (!ready(img)) return false;
  const cell = faceCell(id);
  const w = img.naturalWidth / COLUMNS;
  const h = img.naturalHeight / ROWS;
  ctx.drawImage(img, (cell % COLUMNS) * w, Math.floor(cell / COLUMNS) * h, w, h, x - size / 2, y - size / 2, size, size);
  return true;
}
