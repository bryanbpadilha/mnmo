import { getElement } from "../../util";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

export interface ICheckboxConfig {
    onChange?: TInputEvent<Checkbox>;
    onInvalid?: TInputEvent<Checkbox>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}

export class Checkbox extends Input {
    element: HTMLInputElement;
    config?: ICheckboxConfig;

    constructor(element: HTMLInputElement | string, config?: ICheckboxConfig) {
        super({
            supportedConstraints: ["required"],
        });

        if (
            !getElement(element) ||
            !(getElement(element) instanceof HTMLInputElement)
        ) {
            throw new Error("Invalid element or selector for Checkbox");
        }

        this.element = getElement(element) as HTMLInputElement;

        this.config = config;

        this.syncConstraints();

        this.element.addEventListener("invalid", () => {
            this.handleInvalid();
        });

        this.element.addEventListener("input", () => {
            this.handleChange();
        });
    }

    get elements() {
        return [this.element];
    }

    get checked() {
        return this.element.checked;
    }

    get value() {
        return this.element.checked ? this.element.value : null;
    }
}
