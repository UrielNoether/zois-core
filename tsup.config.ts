import { defineConfig } from 'tsup';
 
export default defineConfig({
    format: ['esm'],
    entry: ['./src/'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
});