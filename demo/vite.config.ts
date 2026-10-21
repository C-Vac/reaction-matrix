import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The demo imports the library by its package name but reads straight from ../src, so edits show
// up immediately. An app installing the package does not need any of this.
const lib = path.resolve(__dirname, '../src');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@goblinlife/reaction-matrix/styles.css', replacement: path.join(lib, 'styles.css') },
      { find: '@goblinlife/reaction-matrix/math', replacement: path.join(lib, 'math.ts') },
      { find: '@goblinlife/reaction-matrix', replacement: path.join(lib, 'index.ts') },
    ],
  },
});
