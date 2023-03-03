import { getElement } from "../../util";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
import { maskValue, restoreCursorPosition } from "./Textbox.util";

const ERRORS = [
    ["valueMissing", "required"],
    ["badInput"],
    ["typeMismatch"],
    ["patternMismatch", "pattern"],
    ["rangeOverflow", "max"],
    ["rangeUnderflow", "min"],
    ["stepMismatch", "step"],
    ["tooLong", "maxLength"],
    ["tooShort", "minLength"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface ITextboxConfig {
    onChange?: TInputEvent<Textbox>;
    onInvalid?: TInputEvent<Textbox>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    step?: TInputConstraintEntry<number>;
    min?: TInputConstraintEntry<number | string>;
    max?: TInputConstraintEntry<number | string>;
    minLength?: TInputConstraintEntry<number>;
    maxLength?: TInputConstraintEntry<number>;
    pattern?: TInputConstraintEntry<string>;
    dynamicValidity?: TInputDynamicValidity;
    // Mask
    mask?: string | ((value: string) => string);
}

export class Textbox extends Input {
    element: HTMLInputElement;
    config?: ITextboxConfig;
    mask?: string | ((value: string) => string) | null;

    constructor(element: HTMLInputElement | string, config?: ITextboxConfig) {
        super({
            supportedConstraints: [
                "required",
                "step",
                "min",
                "max",
                "minLength",
                "maxLength",
                "pattern",
            ],
        });

        this.element = getElement(element) as HTMLInputElement;

        if (!this.element || !(this.element instanceof HTMLInputElement)) {
            throw new Error("Invalid element or selector for Textbox");
        }

        this.config = config;
        this.mask = this.config?.mask ?? this.element.getAttribute("mask");

        this.syncConstraints();

        if (this.mask && !["tel", "text"].includes(this.element.type)) {
            throw new Error(
                'Textbox masking is only allowed with input type of "tel" or "text"'
            );
        }

        this.element.addEventListener("invalid", () => {
            this.handleInvalid();
        });

        this.element.addEventListener("input", (e) => {
            this.handleChange();

            if (!this.mask) return;

            const value = this.value;
            const mask =
                typeof this.mask === "string" ? this.mask : this.mask(value);
            const event = e as InputEvent;

            restoreCursorPosition(value, mask, event, () => {
                this.element.value = maskValue(value, mask, event);
            });
        });
    }

    get elements() {
        return [this.element];
    }
}
