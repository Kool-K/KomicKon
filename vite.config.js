import { defineConfig } from 'vite'

export default defineConfig({
   base: './',
   // Add this for proper asset handling
   build: {
     outDir: 'dist',
     assetsDir: 'assets'
   }
})