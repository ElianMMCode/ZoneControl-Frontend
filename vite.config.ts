import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ruta static de spring boot
    outDir: "../resources/static/",
    emptyOutDir: true,
  },
});
