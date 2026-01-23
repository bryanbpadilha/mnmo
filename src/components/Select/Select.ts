import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
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

    private boundHandleInvalid: (event: Event) => void;
    private boundHandleInput: (event: Event) => void;

    constructor(element: TSelector<HTMLSelectElement>, config?: ISelectConfig) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = selectElement<HTMLSelectElement>(
            element,
            HTMLSelectElement
        );

        this.config = config;

        this.syncConstraints();

        // Bind handlers
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
}
