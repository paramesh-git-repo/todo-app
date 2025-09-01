import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    server: {
      port: 3000, // or whatever you use
      hmr: mode === "development" ? true : false, // disable HMR in prod
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
    },
  };
});
