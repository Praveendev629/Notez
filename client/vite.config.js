import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express dev server. This keeps the browser
      // same-origin in development so httpOnly auth cookies work as in prod.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-underline', '@tiptap/extension-text-align', '@tiptap/extension-color', '@tiptap/extension-text-style', '@tiptap/extension-font-family'],
          pdf: ['jspdf'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});