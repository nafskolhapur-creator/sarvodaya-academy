import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_APP_BASE_PATH || "/",
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PORT || 5173),
    proxy: process.env.VITE_API_BASE_URL
      ? undefined
      : {
          "/api": {
            target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
            changeOrigin: true,
          },
        },
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
