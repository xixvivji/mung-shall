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
    port: 3000,
    proxy: {

      "/api": 'https://i14c109.p.ssafy.io',
      "/oauth2": 'https://i14c109.p.ssafy.io',
      "/login": 'https://i14c109.p.ssafy.io',

      // "/api": "http://localhost:8080",
      // "/oauth2": "http://localhost:8080",
      // "/login": "http://localhost:8080",
      
    },
  },
});