import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist', // Directory for build output
    assetsDir: 'assets', // Directory for static assets within output
    sourcemap: false, // Generate sourcemaps for debugging
    rollupOptions: {
      input: {
        main: './index.html', // Main entry point
        // nested: './src/nested/index.html', // Example of a nested entry point
      },
      output: {
        manualChunks(id) {
          // Split large libraries into separate chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: 'assets/[name].[hash].[ext]', // Custom file naming
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
      },
    },
    cssCodeSplit: true, // Split CSS into separate files
  },
});
