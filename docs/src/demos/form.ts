import { Form } from "../mnmo";

export function initFormDemo() {
    const formEl = document.getElementById(
        "demo-form"
    ) as HTMLFormElement | null;
    const valuesEl = document.getElementById(
        "form-values"
    ) as HTMLElement | null;
    const errorsEl = document.getElementById(
        "form-errors"
    ) as HTMLElement | null;

    if (!formEl || !valuesEl || !errorsEl) return;

    const form = new Form(formEl, {
        onInput: () => render(),
        onChange: () => render(),
        onInvalid: () => render(),
        onSubmit: (_f, e: SubmitEvent) => {
            e.preventDefault();
            render();
        },
    });

    function render() {
        if (!formEl || !valuesEl || !errorsEl) return;

        valuesEl.textContent = JSON.stringify(form.values, null, 2);
        errorsEl.textContent = JSON.stringify(form.errors, null, 2);
    }

    render();
}
