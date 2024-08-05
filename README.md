# MNMO

Headless UI in vanilla JS.

# `multi-module` changes

Non-breaking changes

-   Replaced `esbuild` bundling with `rollup`
-   Added multiple format module bundling (`cjs`, `esm`, `umd`)
    -   I believe the `window.mnmo` imports should work fine (needs testing)
-   Fallback to using input ID, or automatically generated `uid()` on `Form.errors`
-   `Form` event handlers now receive `(form: Form, event: Event | SubmitEvent)`
-   `Input` event handlers now receive `(input: Input, form?: Form, event: Event)`
-   Add `Form.getInputById` and `Form.getInputByAttribute`

Breaking changes

-   `dynamicValidity` on `Input` now uses `Input` and `Form` (instead of `value` and `context`)
-   Remove `event.preventDefault()` call from `Form.handleSubmit`
-   Remove `Form.submitting` and `async` from `Form.handleSubmit`
