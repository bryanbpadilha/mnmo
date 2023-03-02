import * as esbuild from "esbuild";

// No minify
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.js",
    minify: false,
    external: ["*.stories.ts", "*.stories.mdx"],
    target: "es2015",
});

// Minify
await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    outfile: "dist/index.min.js",
    minify: true,
    external: ["*.stories.ts", "*.stories.mdx"],
    target: "es2015",
});
