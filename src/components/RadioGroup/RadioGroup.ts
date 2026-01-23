import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

export interface IRadioGroupConfig {
    onChange?: TInputEvent<RadioGroup>;
    onInvalid?: TInputEvent<RadioGroup>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}

export class RadioGroup extends Input {
    element: HTMLElement;
    radioButtons: HTMLInputElement[];
    config?: IRadioGroupConfig;

    private boundHandleInvalid: (event: Event) => void;
    private boundHandleInput: (event: Event) => void;

    constructor(element: TSelector<HTMLElement>, config?: IRadioGroupConfig) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = selectElement<HTMLElement>(element, HTMLElement);

        this.config = config;

        this.radioButtons = Array.from(
            this.element.querySelectorAll<HTMLInputElement>("input[type=radio]")
        );

        this.syncConstraints();

        // Bind once, apply to all
        this.boundHandleInvalid = (event: Event) => this.handleInvalid(event);
        this.boundHandleInput = (event: Event) => this.handleChange(event);

        this.radioButtons.forEach((button) => {
            button.addEventListener("invalid", this.boundHandleInvalid);
            button.addEventListener("input", this.boundHandleInput);
        });
    }

    destroy() {
        this.radioButtons.forEach((button) => {
            button.removeEventListener("invalid", this.boundHandleInvalid);
            button.removeEventListener("input", this.boundHandleInput);
        });
        super.destroy();
    }

    get elements() {
        return this.radioButtons;
    }

    get checked(): HTMLInputElement | undefined {
        return this.radioButtons.filter((button) => button.checked)[0];
    }

    get value() {
        return this.checked ? this.checked.value : null;
    }
}
