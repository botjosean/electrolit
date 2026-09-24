import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Spec: base '/electrician-sim-us/'. The deploy workflow may override it with BASE_PATH
// (e.g. '/<repo-name>/') so GitHub Pages works whatever the repository is called.
const base = process.env.BASE_PATH || '/electrician-sim-us/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
} as never);
