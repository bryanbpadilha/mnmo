import { Input } from "..";

export type TFormEvent = (form: Form) => void;
export type TFormSubmitEvent = (form: Form) => Promise<void>;

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
    isSubmitting: boolean;

    constructor(element: HTMLFormElement, config?: IFormConfig) {
        this.element = element;
        this.config = config;

        this.isDirty = false;
        this.isSubmitted = false;
        this.isSubmitting = false;

        this.element.addEventListener("input", (event) => {
            this.handleInput();
        });

        this.element.addEventListener("change", (event) => {
            this.handleChange();
        });

        this.element.addEventListener("submit", (event) => {
            this.handleSubmit(event);
        });

        this.element.addEventListener(
            "invalid",
            (event) => {
                this.handleInvalid(event);
            },
            true
        );
    }

    private async emit(event: string) {
        if (this.config && this.config[event]) {
            await this.config[event](this);
        }
    }

    private handleInput() {
        if (!this.isDirty) this.isDirty = true;
        this.inputs?.forEach((input) => input.validate());
        this.emit("onInput");
    }

    private handleChange() {
        if (!this.isDirty) this.isDirty = true;
        this.emit("onChange");
    }

    private async handleSubmit(event: SubmitEvent) {
        if (!this.isSubmitted) this.isSubmitted = true;

        if (this.config && this.config.onSubmit) {
            event.preventDefault();
            this.isSubmitting = true;
            await this.emit("onSubmit");
            this.isSubmitting = false;
        }
    }

    private handleInvalid(event: Event) {
        if (!this.isSubmitted) this.isSubmitted = true;

        if (this.config && this.config.onInvalid) {
            event.preventDefault();
            this.emit("onInvalid");
        }
    }

    append(...inputs: Input[]) {
        for (const input of inputs) {
            if (input.form) {
                throw new Error("An input can not be in two forms.");
            }

            input.form = this;

            this.inputs = this.inputs?.concat(input) ?? [input];
        }
    }

    get errors() {
        let errors: { [key: string]: string } = {};

        const invalidElements = Array.from(this.elements).filter(
            (element) => !(element as HTMLInputElement).validity.valid
        ) as HTMLInputElement[];

        for (const input of invalidElements) {
            errors[input.name] = input.validationMessage;
        }

        if (this.inputs) {
            for (const input of this.inputs) {
                errors[input.name] = input.error;
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
