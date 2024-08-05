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

        this.element.addEventListener("invalid", (event) => {
            this.handleInvalid(event);
        });

        this.element.addEventListener("input", (event) => {
            this.handleChange(event);
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
