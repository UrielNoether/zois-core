import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['esm'],
    entry: ['./src/**/*.ts'],
    dts: true,
    shims: true,
    splitting: false,
    skipNodeModulesBundle: true,
    clean: true,
    loader: {
        ".css": "text"
    },
});