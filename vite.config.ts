import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le build se sert depuis n'importe quel sous-dossier.
  base: './',
  build: {
    chunkSizeWarningLimit: 2000, // Phaser pèse ~1,5 Mo à lui seul
  },
});
