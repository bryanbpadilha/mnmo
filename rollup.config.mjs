import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
    {
        input: "src/main.ts",
        output: [
            {
                file: "lib/cjs/mnmo.js",
                format: "cjs",
                sourcemap: true,
            },
            {
                file: "lib/esm/mnmo.js",
                format: "esm",
                sourcemap: true,
            },
            {
                file: "lib/umd/mnmo.js",
                format: "umd",
                name: "mnmo",
                sourcemap: true,
            },
            {
                file: "lib/umd/mnmo.min.js",
                format: "umd",
                name: "mnmo",
                plugins: [terser()],
                sourcemap: true,
            },
        ],
        plugins: [
            resolve(),
            typescript({
                tsconfig: "./tsconfig.json",
                exclude: ["docs/**", "lib/**", "node_modules/**"],
            }),
        ],
    },
    {
        input: "src/main.ts",
        output: [
            {
                file: `lib/mnmo.d.ts`,
                format: "esm",
            },
        ],
        plugins: [
            dts({
                include: ["src"],
                exclude: ["docs/**", "lib/**", "node_modules/**"],
            }),
        ],
    },
];
