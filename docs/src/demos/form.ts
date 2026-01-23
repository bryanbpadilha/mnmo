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

    // Control Elements
    const btnDestroy = document.getElementById(
        "btn-destroy-form"
    ) as HTMLButtonElement | null;
    const btnInit = document.getElementById(
        "btn-init-form"
    ) as HTMLButtonElement | null;
    const statusEl = document.getElementById(
        "form-status"
    ) as HTMLElement | null;

    if (
        !formEl ||
        !valuesEl ||
        !errorsEl ||
        !btnDestroy ||
        !btnInit ||
        !statusEl
    )
        return;

    let form: Form | null = null;

    // Helper to render current state
    function render() {
        if (!formEl || !valuesEl || !errorsEl || !form) return;
        valuesEl.textContent = JSON.stringify(form.values, null, 2);
        errorsEl.textContent = JSON.stringify(form.errors, null, 2);
    }

    // Initialize the Class
    function init() {
        if (form) return;

        form = new Form(formEl as HTMLFormElement, {
            onInput: () => render(),
            onChange: () => render(),
            onInvalid: () => render(),
            onSubmit: (_f, e: SubmitEvent) => {
                e.preventDefault();
                render();
                // Visual feedback that the class handled the submit
                valuesEl!.textContent +=
                    "\n\n[Form Class]: Submit Event Handled correctly.";
            },
        });

        // Update UI controls
        statusEl!.textContent = "Active";
        statusEl!.className = "status-active";
        btnDestroy!.disabled = false;
        btnInit!.disabled = true;

        render();
    }

    // Destroy the Class
    function destroy() {
        if (!form) return;

        form.destroy();
        form = null;

        // Update UI controls
        statusEl!.textContent = "Destroyed (Listeners removed)";
        statusEl!.className = "status-destroyed";
        btnDestroy!.disabled = true;
        btnInit!.disabled = false;

        // Clear logs to verify no new updates occur
        valuesEl!.textContent =
            "// Form destroyed. Type in inputs to verify logs do not update.";
        errorsEl!.textContent = "";
    }

    // Attach control listeners
    btnDestroy.addEventListener("click", destroy);
    btnInit.addEventListener("click", init);

    // Prevents page reload if user submits while form is destroyed
    // (Since the class's preventDefault is removed by destroy())
    formEl.addEventListener("submit", (e) => {
        if (!form) {
            e.preventDefault();
            valuesEl!.textContent =
                "// NATIVE submit intercepted. \n// The Form class is destroyed, so no validation or data gathering logic ran.";
        }
    });

    // Start
    init();
}
