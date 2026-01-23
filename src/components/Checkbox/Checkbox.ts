import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
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

    private boundHandleInvalid: (event: Event) => void;
    private boundHandleInput: (event: Event) => void;

    constructor(
        element: TSelector<HTMLInputElement>,
        config?: ICheckboxConfig
    ) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = selectElement<HTMLInputElement>(
            element,
            HTMLInputElement
        );

        this.config = config;

        this.syncConstraints();

        this.boundHandleInvalid = (event: Event) => this.handleInvalid(event);
        this.boundHandleInput = (event: Event) => this.handleChange(event);

        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }

    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
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
