import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // 명시적으로 고정 (중요)
    proxy: {
      // ✅ 백엔드 API 전부
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },

      // ✅ OAuth2 로그인/콜백
      "/oauth2": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },

      // ✅ Spring Security 로그인 엔드포인트
      "/login": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
