import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Lets the client call "/api/..." without hardcoding the server's port.
      '/api': 'http://localhost:4000',
    },
  },
});
