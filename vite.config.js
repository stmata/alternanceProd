import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.png', '**/*.svg', '**/*.mp4'],
  plugins: [react(), svgr()],
  server: {
    hmr: {
      overlay: false,  // Désactive l'overlay d'erreur
    }
  },
  build: {
    rollupOptions: {
      input: 'index.html', // Spécifie le point d'entrée principal
    },
  },
  publicDir: 'public',
})
