import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist/client",
    emptyOutDir: true
  },
  server: {
    host: true,
    port: 5173
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "client/components"),
      "@lib": path.resolve(__dirname, "client/lib"),
      "@shared": path.resolve(__dirname, "client/src/shared"),
      "@": path.resolve(__dirname, "client"),
    }
  }
});
