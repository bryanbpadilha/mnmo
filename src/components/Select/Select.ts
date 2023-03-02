import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

export interface ISelectConfig {
    onChange?: TInputEvent<Select>;
    onInvalid?: TInputEvent<Select>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}

export class Select extends Input {
    element: HTMLSelectElement;
    config?: ISelectConfig;

    constructor(element: HTMLSelectElement, config?: ISelectConfig) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = element;
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
}
