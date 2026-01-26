import inject from "@medusajs/admin-vite-plugin";

import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === "production";

  const BASE = env.VITE_MEDUSA_BASE || "/";
  const BACKEND_URL = env.VITE_MEDUSA_BACKEND_URL || "";
  const STOREFRONT_URL =
    env.VITE_MEDUSA_STOREFRONT_URL || "";
  const B2B_PANEL = env.VITE_MEDUSA_B2B_PANEL || "false";
  const PORT = parseInt(env.PORT || env.VITE_PORT || "5173", 10);
  const PUBLIC_BASE_URL = env.VITE_PUBLIC_BASE_URL || "";

  /**
   * Add this to your .env file to specify the project to load admin extensions from.
   */
  const MEDUSA_PROJECT = env.VITE_MEDUSA_PROJECT || null;
  const sources = MEDUSA_PROJECT ? [MEDUSA_PROJECT] : [];

  return {
    plugins: [
      // Only enable inspect in development
      ...(!isProd ? [inspect()] : []),
      react({
        // Enable Fast Refresh for better dev experience
        fastRefresh: true,
      }),
      inject({
        sources,
      }),
    ],
    resolve: {
      alias: {
        "@custom-types": path.resolve(__dirname, "./src/types"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@styles": path.resolve(__dirname, "./src/styles"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@providers": path.resolve(__dirname, "./src/providers"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __BASE__: JSON.stringify(BASE),
      __BACKEND_URL__: JSON.stringify(BACKEND_URL),
      __STOREFRONT_URL__: JSON.stringify(STOREFRONT_URL),
      __B2B_PANEL__: JSON.stringify(B2B_PANEL),
    },
    server: {
      host: true,
      port: PORT,
      open: false,
      allowedHosts: PUBLIC_BASE_URL ? [PUBLIC_BASE_URL.replace('https://', '').replace('http://', '').split('/')[0]] : [],
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "@medusajs/ui",
        "react-hook-form",
        "i18next",
        "react-i18next",
      ],
      exclude: ["@medusajs/admin-vite-plugin"],
    },
    // Build optimizations for production
    build: {
      // Enable source maps only in development
      sourcemap: !isProd,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Rollup options for code splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunk for React ecosystem
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            // UI library chunk
            "vendor-ui": ["@medusajs/ui", "@medusajs/icons"],
            // Data fetching chunk
            "vendor-query": ["@tanstack/react-query"],
            // Form handling chunk
            "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
            // i18n chunk
            "vendor-i18n": ["i18next", "react-i18next"],
          },
        },
      },
      // Minification settings
      minify: isProd ? "esbuild" : false,
      // Target modern browsers for smaller bundles
      target: "es2020",
    },
    // Enable CSS code splitting
    css: {
      devSourcemap: !isProd,
    },
    // Improve dev experience with esbuild optimizations
    esbuild: {
      // Drop console logs in production
      drop: isProd ? ["console", "debugger"] : [],
    },
  };
});
