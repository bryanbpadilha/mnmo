import { Combobox, Form } from "../mnmo";
import { createLogger } from "../utils/logger";

export function initComboboxDemo() {
    const log = createLogger("#log-combobox");

    const trigger = document.getElementById("cb-demo") as HTMLElement | null;
    const formEl = document.getElementById(
        "demo-combobox-form"
    ) as HTMLFormElement | null;

    if (!trigger) return;

    const combobox = new Combobox(trigger, {
        required: true,
        onOpen: () => {
            log.info("combobox:onOpen");
        },
        onClose: () => {
            log.info("combobox:onClose");
        },
        onChange: (input) => {
            log.info("combobox:onChange", {
                value: input.value,
                error: input.error,
                isValid: input.isValid,
            });
        },
        onInvalid: (input) => {
            log.warn("combobox:onInvalid", input.error);
        },
    });

    // If the Combobox starts with a value, reflect it on the trigger text.
    if (combobox.value) {
        trigger.textContent = combobox.value;
    }

    // Wire form submission with mnmo Form to inspect values and errors
    if (formEl) {
        const form = new Form(formEl, {
            onSubmit: (_f, e: SubmitEvent) => {
                e.preventDefault();
                log.info("submit", {
                    values: form.values,
                    errors: form.errors,
                    isValid: form.isValid,
                });
            },
            onInvalid: () => {
                log.warn("invalid", "Form invalid. See errors below.");
            },
        });

        // Include combobox instance for values/errors aggregation
        form.append(combobox);

        // Expose for quick manual testing in the console
        (window as any).comboboxForm = form;
    }

    // Expose for quick manual testing in the console
    (window as any).combobox = combobox;
}
