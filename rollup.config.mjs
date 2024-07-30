import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/main.ts",
    output: [
        {
            file: "lib/main.esm.js",
            format: "esm",
            sourcemap: true,
        },
        {
            file: "lib/main.esm.min.js",
            format: "esm",
            plugins: [terser()],
            sourcemap: true,
        },
        {
            file: "lib/main.umd.js",
            format: "umd",
            name: "myLibrary",
            sourcemap: true,
        },
        {
            file: "lib/main.umd.min.js",
            format: "umd",
            name: "myLibrary",
            plugins: [terser()],
            sourcemap: true,
        },
    ],
    plugins: [resolve(), typescript()],
};
