import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import process from "node:process";
import path from "path";

const host = process.env.TAURI_DEV_HOST;
const packageDir = "../../../packages";

export default defineConfig((): UserConfig => ({
    plugins: [react({ compiler: true }), ViteMinifyPlugin({})],

    resolve: {
        alias: [
            {
                find: "@zelefy/ui/styles",
                replacement: path.resolve(
                    import.meta.dirname,
                    packageDir + "/shared-ts/ui/src/styles/index.scss",
                ),
            },
            {
                find: "@zelefy/ui",
                replacement: path.resolve(import.meta.dirname, packageDir + "/shared-ts/ui/src"),
            },
            {
                find: "@zelefy/types",
                replacement: path.resolve(import.meta.dirname, packageDir + "/shared-ts/types/src"),
            },
            { find: "@", replacement: path.resolve(import.meta.dirname, "./src") },
        ],
    },

    css: {
        transformer: "lightningcss",
        preprocessorOptions: {
            scss: {
                loadPaths: [
                    path.resolve(import.meta.dirname, packageDir + "/shared-ts"),
                    path.resolve(import.meta.dirname, "../../node_modules"),
                ],
            },
        },
    },

    build: {
        target: "esnext",
        cssMinify: "lightningcss",
        cssCodeSplit: false,
        chunkSizeWarningLimit: 1000,
        sourcemap: false,

        rolldownOptions: {
            treeshake: {
                moduleSideEffects: (id) => /\.(css|scss|sass)$/.test(id),
            },
            output: {
                strictExecutionOrder: true,
                codeSplitting: {
                    minSize: 15000,
                    groups: [
                        {
                            name: "vendor-react",
                            test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                            priority: 60,
                        },
                        {
                            name: "vendor-router",
                            test: /node_modules[\\/](react-router|@remix-run)[\\/]/,
                            priority: 50,
                        },
                        {
                            name: "vendor-motion",
                            test: /node_modules[\\/](motion|framer-motion)[\\/]/,
                            priority: 45,
                        },
                        {
                            name: "vendor-data",
                            test: /node_modules[\\/](@tanstack[\\/]react-query|zustand)[\\/]/,
                            priority: 40,
                        },
                        {
                            name: "vendor-dnd",
                            test: /node_modules[\\/]@dnd-kit[\\/]/,
                            priority: 35,
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
                        {
                            name: "app-common",
                            test: /([\\/]src[\\/](shared|entities|features)[\\/]|[\\/]packages[\\/])/,
                            minShareCount: 2,
                            minSize: 0,
                            priority: 5,
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
