import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: './ui-src',
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: './ui-src/index.html'
    }
  }
});
