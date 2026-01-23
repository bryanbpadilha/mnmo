import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
import { maskValue, restoreCursorPosition } from "./Textbox.util";

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

    private boundHandleInput: (event: Event) => void;
    private boundHandleInvalid: (event: Event) => void;

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

        // Apply config constraints to DOM
        this.syncConstraints();

        if (this.mask && !["tel", "text"].includes(this.element.type)) {
            throw new Error(
                'Textbox masking is only allowed with input type of "tel" or "text"'
            );
        }

        this.boundHandleInvalid = (event: Event) => {
            this.handleInvalid(event);
        };

        this.boundHandleInput = (e: Event) => {
            if (!this.mask) {
                this.handleChange(e);
                return;
            }

            const value = this.element.value;
            const mask =
                typeof this.mask === "string" ? this.mask : this.mask(value);
            const event = e as InputEvent;

            restoreCursorPosition(value, mask, event, () => {
                this.element.value = maskValue(value, mask, event);
            });

            this.handleChange(e);
        };

        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }

    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
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
