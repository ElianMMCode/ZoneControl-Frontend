import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // En dev, /api/* se reenvía al backend sin reescribir la URL:
      // Spring ya monta los controllers bajo /api.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Ruta static de spring boot
    outDir: "../resources/static/",
    emptyOutDir: true,
  },
});
