import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';
import { renderStaticPage, staticPageFiles, NOT_FOUND_SEO } from './src/lib/staticPages';

// Writes per-route static HTML (meta + readable content) next to the SPA build.
function staticRoutePages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'legallyai-static-route-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      for (const page of staticPageFiles()) {
        const target = path.join(outDir, page.file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, renderStaticPage(template, page.path, page.notFound ? NOT_FOUND_SEO : undefined));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    plugins: [react(), staticRoutePages()].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
            ],
            supabase: ['@supabase/supabase-js'],
            charts: ['recharts'],
            animation: ['framer-motion'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'production' ? false : true,
    },
  };
});
