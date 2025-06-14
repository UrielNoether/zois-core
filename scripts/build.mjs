import esbuild from "esbuild";
import path from "path";
import fs, { existsSync } from "fs";
import { execSync } from "child_process";

if (existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });
else fs.mkdirSync("dist");

const srcDir = path.resolve(import.meta.dirname, "..", "src");
const distDir = path.resolve(import.meta.dirname, "..", "dist");

esbuild.build({
    entryPoints: ["./src/**/*.*"],
    outdir: distDir,
    bundle: false,
    minify: true,
    format: "esm",
    treeShaking: true,
    splitting: false,
    legalComments: "none",
    platform: "browser",
    tsconfig: path.resolve(import.meta.dirname, "..", "tsconfig.json"),
    loader: {
        ".ts": "ts",
        ".svg": "copy",
        ".png": "copy"
    }
}).catch(() => process.exit(1));

console.log("\x1b[32m%s\x1b[0m", "[ESM]:", "Done");
execSync("tsc -p tsconfig.dts.json");
console.log("\x1b[32m%s\x1b[0m", "[DTS]:", "Done");


