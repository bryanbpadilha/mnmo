import { Textbox } from "mnmo";
import { createLogger } from "../utils/logger";

export function initTextboxDemo() {
    const log = createLogger("#log-textbox");

    const plainEl = document.getElementById(
        "tb-plain"
    ) as HTMLInputElement | null;
    if (plainEl) {
        new Textbox(plainEl, {
            onChange: (input) => {
                log.info("plain:onChange", {
                    value: input.value,
                    error: input.error,
                    isValid: input.isValid,
                });
            },
            onInvalid: (input) => {
                log.warn("plain:onInvalid", input.error);
            },
        });
    }

    const phoneEl = document.getElementById(
        "tb-phone"
    ) as HTMLInputElement | null;
    if (phoneEl) {
        new Textbox(phoneEl, {
            onChange: (input) => {
                log.info("phone:onChange", {
                    value: input.value,
                    error: input.error,
                });
            },
        });
    }

    const cpfEl = document.getElementById("tb-cpf") as HTMLInputElement | null;
    if (cpfEl) {
        new Textbox(cpfEl, {
            mask: "999.999.999-99",
            valueAs: (v) => v.replace(/\D/g, ""), // keep only digits
            onChange: (input) => {
                log.info("cpf:onChange", {
                    display: cpfEl.value,
                    value: input.value,
                });
            },
        });
    }
}
