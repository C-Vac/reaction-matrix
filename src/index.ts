/**
 * @file index.ts
 * @description Public entry point. React components are exported here; the pure vocabulary,
 * geometry and aggregation helpers (no React, no DOM) are also available on their own at
 * `@goblinlife/reaction-matrix/math`, which is what a server should import.
 * Import `@goblinlife/reaction-matrix/styles.css` once in your app.
 */
export { ReactionMatrixButton, type ReactionMatrixButtonProps } from './ReactionMatrixButton';
export { ReactionMatrixPanel, type ReactionMatrixPanelProps } from './ReactionMatrixPanel';
export { TesseractCanvas, type TesseractCanvasProps } from './TesseractCanvas';
export * from './math';
