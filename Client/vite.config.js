import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          ui: ["lucide-react"],
          socket: ["socket.io-client"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react()
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false
      }
    }
  }
})
