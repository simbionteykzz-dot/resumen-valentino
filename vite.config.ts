import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/shalom-agencias', async (req, res, next) => {
            if (req.method === 'POST' || req.method === 'OPTIONS') {
              try {
                res.status = (code) => { res.statusCode = code; return res; };
                res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
                const module = await import('./api/shalom-agencias.js');
                await module.default(req, res);
              } catch(e) {
                console.error(e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-xlsx': ['xlsx'],
            'vendor-pdf': ['jspdf', 'jspdf-autotable'],
            'vendor-leaflet': ['leaflet'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
