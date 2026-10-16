import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { optimize } from "svgo";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SVG_DIR = path.join(ROOT, "src/assets");
const OUT_DIR = path.join(ROOT, "src/generated");

const getSvgFiles = (dir: string): { name: string; fullPath: string }[] => {
    return fs
        .readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter((entry) => entry.isFile() && path.extname(entry.name) === ".svg")
        .map((entry) => {
            const fullPath = path.join(entry.parentPath!, entry.name);
            const name = path
                .relative(SVG_DIR, fullPath)
                .replace(/\\/g, "/")
                .replace(/\.svg$/, "")
                .replace(/\//g, "-");
            return { name, fullPath };
        });
};

const toSymbol = (name: string, source: string) => {
    const id = name;

    const { data } = optimize(source, {
        multipass: true,
        plugins: [
            "removeXMLProcInst",
            "removeDoctype",
            "removeComments",
            "removeMetadata",
            "removeEditorsNSData",
            {
                name: "preset-default",
                params: {
                    overrides: {
                        removeViewBox: false,
                        removeUselessStrokeAndFill: false,
                        removeTitle: false,
                    },
                },
            },
            { name: "prefixIds", params: { prefix: id, delim: "_" } },
        ],
    });

    const attrs = (data.match(/<svg\b([^>]*)>/i)?.[1] ?? "")
        .replace(/\sxmlns(:\w+)?="[^"]*"/g, "")
        .replace(/\s(id|width|height)="[^"]*"/g, "")
        .trim();

    const inner = data
        .replace(/<svg[^>]*>/i, "")
        .replace(/<\/svg>\s*$/i, "")
        .trim();

    const attrsPart = attrs ? ` ${attrs}` : "";

    return `<symbol id="${id}"${attrsPart}>${inner}</symbol>`;
};

const files = getSvgFiles(SVG_DIR).sort((a, b) => a.name.localeCompare(b.name));

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n${files
    .map((f) => toSymbol(f.name, fs.readFileSync(f.fullPath, "utf-8")))
    .join("\n")}\n</svg>\n`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "sprite.svg"), sprite);
fs.writeFileSync(
    path.join(OUT_DIR, "icon-names.ts"),
    `export type IconName =\n${files.map((f) => `    | "${f.name}"`).join("\n")};\n`,
);

console.log(`${files.length} иконок -> ${path.relative(ROOT, OUT_DIR)}`);
