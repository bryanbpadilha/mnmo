import { Combobox } from "../mnmo";
import { createLogger } from "../utils/logger";

export function initComboboxDemo() {
    const log = createLogger("#log-combobox");

    const trigger = document.getElementById("cb-color") as HTMLElement | null;
    const hidden = document.getElementById(
        "cb-color-value"
    ) as HTMLInputElement | null;

    if (!trigger) return;

    const combobox = new Combobox(trigger, {
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

    // If there's a preset value in the hidden input, reflect it on the trigger text.
    if (hidden && hidden.value) {
        trigger.textContent = hidden.value;
    }

    // Expose for quick manual testing in the console
    (window as any).combobox = combobox;
}
