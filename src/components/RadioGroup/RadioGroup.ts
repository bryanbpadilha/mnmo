import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

const ERRORS = [["valueMissing", "required"], ["badInput"], ["typeMismatch"]];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

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

        Array.from(this.radioButtons).forEach((button) =>
            button.addEventListener("invalid", () => {
                this.handleInvalid();
            })
        );

        Array.from(this.radioButtons).forEach((button) =>
            button.addEventListener("input", () => {
                this.handleChange();
            })
        );
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
