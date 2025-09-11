import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
    root: __dirname,
    resolve: {
        alias: {
            mnmo: path.resolve(__dirname, "./src/mnmo.ts"),
        },
    },
    server: { open: true },
});
