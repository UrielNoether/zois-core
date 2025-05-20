import esbuild from "esbuild";
import path from "path";
import fs, { existsSync } from "fs";
import { execSync } from "child_process";

if (!existsSync("dist")) fs.mkdirSync("dist");
fs.readdirSync("dist").forEach((file) => fs.rmSync(path.resolve(import.meta.dirname, "..", "dist", file)))

const srcDir = path.resolve(import.meta.dirname, "..", "src");
const distDir = path.resolve(import.meta.dirname, "..", "dist");

const entryPoints = fs.readdirSync(srcDir);

esbuild.build({
    entryPoints,
    outdir: distDir,
    bundle: false,
    format: "esm",
    treeShaking: true,
    splitting: false,
    platform: "browser",
    tsconfig: path.resolve(import.meta.dirname, "..", "tsconfig.json"),
    loader: {
        ".ts": "ts",
        // ".css": "text"
    },
}).catch(() => process.exit(1));

console.log("\x1b[32m%s\x1b[0m", "[ESM]:", "Done");
execSync("tsc -p tsconfig.dts.json");
console.log("\x1b[32m%s\x1b[0m", "[DTS]:", "Done");


