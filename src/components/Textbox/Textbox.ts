import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
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
    valueAs?: (value: string) => any;
}

export class Textbox extends Input {
    element: HTMLInputElement | HTMLTextAreaElement;
    config?: ITextboxConfig;
    mask?: string | ((value: string) => string) | null;

    constructor(
        element: TSelector<HTMLTextAreaElement | HTMLInputElement>,
        config?: ITextboxConfig
    ) {
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

        this.element = selectElement<HTMLInputElement | HTMLTextAreaElement>(
            element,
            [HTMLInputElement, HTMLTextAreaElement]
        );

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
            if (!this.mask) {
                this.handleChange();
                return;
            }

            const value = this.element.value;
            const mask =
                typeof this.mask === "string" ? this.mask : this.mask(value);
            const event = e as InputEvent;

            restoreCursorPosition(value, mask, event, () => {
                this.element.value = maskValue(value, mask, event);
            });

            this.handleChange();
        });
    }

    get elements() {
        return [this.element as HTMLInputElement];
    }

    get value() {
        if (this.config?.valueAs) {
            return this.config.valueAs(this.element.value);
        } else {
            return this.element.value;
        }
    }
}
