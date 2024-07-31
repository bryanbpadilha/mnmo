# MNMO

Headless UI in vanilla JS.

# `multi-module` changes

Non-breaking changes

-   Replaced `esbuild` bundling with `rollup`
-   Added multiple format module bundling (`cjs`, `esm`, `umd`)
    -   I believe the `window.mnmo` imports should work fine (needs testing)

Breaking changes

-   `dynamicValidity` on `Input` now uses `Input` and `Form` (instead of `value` and `context`)
