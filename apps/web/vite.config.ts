import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  clearScreen: false,
  envPrefix: ['VITE_'],
  plugins: [
    TanStackRouterVite({}),
    react(),
    tailwindcss(),
    nodePolyfills({ protocolImports: true }),
  ],
  server: { port: 3000 },
  publicDir: 'public',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      public: path.resolve(__dirname, './public'),
    },
  },
});
