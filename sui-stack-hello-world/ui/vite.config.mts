import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  // Allow GitHub Pages base path override while keeping local dev at "/".
  base: process.env.VITE_BASE_PATH ?? "/",
  build: {
    // Silence the default 500 kB chunk warning; current bundles are expected.
    chunkSizeWarningLimit: 1200,
  },
  plugins: [react()],
});
