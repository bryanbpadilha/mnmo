import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

export interface ICheckboxGroupConfig {
    onChange?: TInputEvent<CheckboxGroup>;
    onInvalid?: TInputEvent<CheckboxGroup>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}

export class CheckboxGroup extends Input {
    element: HTMLElement;
    checkboxes: HTMLInputElement[];
    config?: ICheckboxGroupConfig; // Add config property typing for strictness if needed or Input handles it

    private boundHandleInvalid: (event: Event) => void;
    private boundHandleInput: (event: Event) => void;

    constructor(
        element: TSelector<HTMLElement>,
        config?: ICheckboxGroupConfig
    ) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = selectElement<HTMLElement>(element, HTMLElement);

        this.config = config;

        this.checkboxes = Array.from(
            this.element.querySelectorAll<HTMLInputElement>(
                "input[type=checkbox]"
            )
        );

        this.syncConstraints();

        this.boundHandleInvalid = (event: Event) => this.handleInvalid(event);
        this.boundHandleInput = (event: Event) => this.handleChange(event);

        this.checkboxes.forEach((button) => {
            button.addEventListener("invalid", this.boundHandleInvalid);
            button.addEventListener("input", this.boundHandleInput);
        });
    }

    destroy() {
        this.checkboxes.forEach((button) => {
            button.removeEventListener("invalid", this.boundHandleInvalid);
            button.removeEventListener("input", this.boundHandleInput);
        });
        super.destroy();
    }

    get elements() {
        return this.checkboxes;
    }

    get checked(): HTMLInputElement[] | undefined {
        return this.checkboxes.filter((button) => button.checked);
    }

    get value() {
        if (this.checkboxes.length > 1) {
            return this.checked
                ? this.checked.map((element) => element.value)
                : null;
        } else {
            return this.checked && this.checked.length > 0
                ? this.checked[0].value
                : null;
        }
    }
}
