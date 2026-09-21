import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import svgr from "vite-plugin-svgr";
import process from "node:process";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
    plugins: [react(), ViteMinifyPlugin({}), svgr({})],

    resolve: {
        alias: [
            { find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
            {
                find: "@zelefy/ui/styles",
                replacement: path.resolve(
                    import.meta.dirname,
                    "../../packages/shared-ts/ui/src/styles/index.scss",
                ),
            },
            {
                find: "@zelefy/ui",
                replacement: path.resolve(import.meta.dirname, "../../packages/shared-ts/ui/src"),
            },
        ],
    },

    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
                loadPaths: [
                    path.resolve(import.meta.dirname, "../../packages/shared-ts"),
                    path.resolve(import.meta.dirname, "../../node_modules"),
                ],
            },
        },
    },

    build: {
        target: "esnext",
        cssMinify: true,
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1000,
        sourcemap: false,

        rolldownOptions: {
            output: {
                codeSplitting: {
                    minSize: 10000,
                    groups: [
                        {
                            name: "vendor-react",
                            test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                            priority: 40,
                        },
                        {
                            name: "vendor-tauri",
                            test: /node_modules[\\/]@tauri-apps[\\/]/,
                            priority: 30,
                        },
                        {
                            name: "vendor-i18n",
                            test: /node_modules[\\/](i18next|react-i18next|i18next-resources-to-backend)[\\/]/,
                            priority: 20,
                        },
                        {
                            name: "vendor-others",
                            test: /node_modules[\\/]/,
                            priority: 10,
                        },
                    ],
                },
            },
        },
    },

    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                  protocol: "ws",
                  host,
                  port: 1421,
              }
            : undefined,
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
}));
