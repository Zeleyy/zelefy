import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import process from "node:process";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
    plugins: [react(), ViteMinifyPlugin({})],

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

        rolldownOptions: {
            output: {
                codeSplitting: {
                    minSize: 10000,
                    groups: [
                        {
                            name: "vendor-react",
                            test: /node_modules[\\/](react|react-dom)[\\/]/,
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
