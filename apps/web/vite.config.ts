import react from "@vitejs/plugin-react";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), ViteMinifyPlugin({})],

    resolve: {
        alias: [{ find: "@", replacement: "/src" }],
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
});
