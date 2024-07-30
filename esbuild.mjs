import * as esbuild from "esbuild";

// No minify
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.js",
    minify: false,
    target: "es2015",
});

// Minify
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.min.js",
    minify: true,
    target: "es2015",
});
