import type { Input } from "..";
import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";

export type TFormEvent = (form: Form, event: Event) => void;
export type TFormSubmitEvent = (
    form: Form,
    event: SubmitEvent
) => void | boolean;

export interface IFormConfig {
    onInvalid?: TFormEvent;
    onChange?: TFormEvent;
    onInput?: TFormEvent;
    onSubmit?: TFormSubmitEvent;
}

export class Form {
    element: HTMLFormElement;
    config?: IFormConfig;
    inputs?: Input[];

    isDirty: boolean;
    isSubmitted: boolean;

    // References to bound event handlers for cleanup
    private boundHandleInput: (event: Event) => void;
    private boundHandleChange: (event: Event) => void;
    private boundHandleSubmit: (event: Event) => void;
    private boundHandleInvalid: (event: Event) => void;

    constructor(element: TSelector<HTMLFormElement>, config?: IFormConfig) {
        this.element = selectElement<HTMLFormElement>(element, HTMLFormElement);

        this.config = config;

        this.isDirty = false;
        this.isSubmitted = false;

        // Bind handlers to 'this' context and store references
        this.boundHandleInput = (event: Event) => this.handleInput(event);
        this.boundHandleChange = (event: Event) => this.handleChange(event);
        // Cast SubmitEvent to Event for generic listener compatibility or handle strictly
        this.boundHandleSubmit = (event: Event) =>
            this.handleSubmit(event as SubmitEvent);
        this.boundHandleInvalid = (event: Event) => this.handleInvalid(event);

        this.element.addEventListener("input", this.boundHandleInput);
        this.element.addEventListener("change", this.boundHandleChange);
        this.element.addEventListener("submit", this.boundHandleSubmit);
        this.element.addEventListener("invalid", this.boundHandleInvalid, true);
    }

    /**
     * Removes all event listeners, destroys attached inputs,
     * and clears references to prevent memory leaks.
     */
    destroy() {
        this.element.removeEventListener("input", this.boundHandleInput);
        this.element.removeEventListener("change", this.boundHandleChange);
        this.element.removeEventListener("submit", this.boundHandleSubmit);
        this.element.removeEventListener(
            "invalid",
            this.boundHandleInvalid,
            true
        );

        if (this.inputs) {
            this.inputs.forEach((input) => input.destroy());
            this.inputs = [];
        }

        this.config = undefined;
        // logic reset
        this.isDirty = false;
        this.isSubmitted = false;
    }

    private async emit<T>(key: keyof IFormConfig, event: T) {
        if (this.config && this.config[key]) {
            if (typeof this.config[key] === "function") {
                await (this.config[key] as Function)(this, event);
            }
        }
    }

    private handleInput(event: Event) {
        if (!this.isDirty) this.isDirty = true;
        this.inputs?.forEach((input) => input.validate());
        this.emit<Event>("onInput", event);
    }

    private handleChange(event: Event) {
        if (!this.isDirty) this.isDirty = true;
        this.emit<Event>("onChange", event);
    }

    private handleSubmit(event: SubmitEvent) {
        if (!this.isSubmitted) this.isSubmitted = true;
        this.emit<SubmitEvent>("onSubmit", event);
    }

    private handleInvalid(event: Event) {
        if (!this.isSubmitted) this.isSubmitted = true;
        event.preventDefault();
        this.emit<Event>("onInvalid", event);
    }

    append(...inputs: Input[]) {
        for (const input of inputs.flat()) {
            if (input.form) {
                throw new Error("An input can not be in two forms.");
            }

            input.form = this;

            this.inputs = this.inputs?.concat(input) ?? [input];
        }
    }

    getInput(name: string) {
        return this.inputs?.filter((input) => input.name === name)[0];
    }

    getInputById(id: string) {
        return this.inputs?.filter((input) => input.id === id)[0];
    }

    getInputByAttribute(key: string, value: string) {
        return this.inputs?.filter(
            (input) => input.getAttribute(key) === value
        )[0];
    }

    get errors() {
        let errors: { [key: string]: string } = {};

        const invalidElements = Array.from(this.elements).filter(
            (element) => !(element as HTMLInputElement).validity.valid
        ) as HTMLInputElement[];

        for (const input of invalidElements) {
            errors[input.name ?? input.id ?? uid("input")] =
                input.validationMessage;
        }

        if (this.inputs) {
            for (const input of this.inputs) {
                errors[input.name ?? input.id ?? uid("input")] = input.error;
            }
        }

        return errors;
    }

    get values() {
        let values: { [key: string]: any | any[] } = {};

        const inputs = Array.from(this.elements).filter(
            (element) =>
                (
                    element as
                        | HTMLInputElement
                        | HTMLSelectElement
                        | HTMLTextAreaElement
                ).name
        ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

        for (const input of inputs) {
            const { name } = input;

            const isMultipleCheckbox =
                input.type == "checkbox" &&
                inputs
                    .map((input) => input.name)
                    .filter((item) => item === name).length > 1;

            if (isMultipleCheckbox || (input as HTMLInputElement).multiple) {
                values[name] = Array.from(this.data.getAll(name));
            } else {
                values[name] = this.data.get(name);
            }
        }

        if (this.inputs) {
            for (const input of this.inputs) {
                values[input.name] = input.value;
            }
        }

        return values;
    }

    get data() {
        return new FormData(this.element);
    }

    get elements() {
        return this.element.elements;
    }

    get isValid() {
        return Object.values(this.errors).every(
            (error) => !error || error.length == 0
        );
    }
}
