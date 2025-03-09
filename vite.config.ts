import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    // host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:611", // 8.134.200.160:611",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  base: "./", // 静态资源相对路径
  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
  },
  plugins: [vue()],
});
