import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/signup': 'http://localhost:8000',
      '/login': 'http://localhost:8000',
      '/me': 'http://localhost:8000',
      '/avatars': 'http://localhost:8000',
      '/garments': 'http://localhost:8000',
      '/tryon': 'http://localhost:8000',
      '/tryon/status': 'http://localhost:8000',
      '/generate_mesh': 'http://localhost:8000',
      '/static': 'http://localhost:8000', // <-- added for mesh/OBJ/static files
    },
    historyApiFallback: true
  }
})
