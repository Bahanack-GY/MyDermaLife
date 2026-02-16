import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174, // Different default port to avoid conflicts with skin app
    strictPort: false, // Automatically use next available port if 5174 is in use
  },
})
