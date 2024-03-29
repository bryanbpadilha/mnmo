import type { Form } from "..";

export type TInputDynamicValidity = (value: any, context: unknown) => string;

export type TInputConstraints = Array<
    [
        "required",
        "pattern",
        "max",
        "min",
        "maxLength",
        "minLength",
        "step"
    ][number]
>;

export type IInputErrorConstraintMap = Array<
    [
        ["badInput"],
        ["typeMismatch"],
        ["valueMissing", "required"],
        ["patternMismatch", "pattern"],
        ["rangeOverflow", "max"],
        ["rangeUnderflow", "min"],
        ["stepMismatch", "step"],
        ["tooLong", "maxLength"],
        ["tooShort", "minLength"]
    ][number]
>;

export type TInputEvent<T> = (input: T) => void;

export type TInputConstraintEntry<T> =
    | T
    | {
          value: T;
          message: string;
      };

export interface IInputProperties {
    supportedConstraints: TInputConstraints;
}

export class Input {
    config?: Record<string, any>;
    supportedConstraints: IInputProperties["supportedConstraints"];
    form?: Form;

    isTouched: boolean;
    isValidated: boolean;

    constructor(properties: IInputProperties) {
        this.supportedConstraints = properties.supportedConstraints;
        this.isTouched = false;
        this.isValidated = false;
    }

    protected emit(event: string) {
        if (this.config && this.config[event]) {
            this.config[event](this);
        }
    }

    protected handleChange() {
        this.isTouched = true;
        this.validate();
        this.emit("onChange");
    }

    protected handleInvalid() {
        this.validate();
        this.emit("onInvalid");
    }

    protected syncConstraintEntry(key: string) {
        if (this.config && this.config[key]) {
            const constraint = this.config[key];

            let constraintValue: boolean | string | number;
            let constraintMessage: string | undefined;

            if (typeof constraint === "object") {
                constraintValue = constraint.value;
                constraintMessage = constraint.message;
            } else {
                constraintValue = this.config[key] as boolean | string | number;
            }

            for (const element of this.elements) {
                element.setAttribute(key, String(constraintValue));
            }

            if (constraintMessage) {
                for (const element of this.elements) {
                    element.setAttribute(`${key}-message`, constraintMessage);
                }
            }
        }
    }

    protected syncConstraints() {
        this.supportedConstraints.forEach((key) =>
            this.syncConstraintEntry(key)
        );
    }

    protected getDefaultValidationMessage() {
        return (
            this.defaultValidationMessage ??
            this.elements[0].getAttribute("validation-message") ??
            this.elements[0].validationMessage
        );
    }

    protected getCustomValidationMessage(key?: string) {
        const customMessage = this.elements[0].getAttribute(`${key}-message`);

        if (!key || !customMessage) {
            return this.getDefaultValidationMessage();
        }

        return customMessage;
    }

    validate() {
        this.isValidated = true;

        if (this.dynamicValidity && this.dynamicValidity.length > 0) {
            this.setCustomValidity(this.dynamicValidity);
        } else if (this.validityError) {
            const [errorName, constraint] = this.validityError;
            const message = this.getCustomValidationMessage(constraint);
            this.setCustomValidity(message);
        } else {
            this.setCustomValidity("");
        }
    }

    setCustomValidity(validity: string) {
        for (const element of this.elements) {
            element.setCustomValidity(validity);
        }
    }

    checkValidity() {
        this.validate();
        return this.elements.every((element) => element.checkValidity());
    }

    reportValidity() {
        this.validate();
        return this.elements.every((element) => element.reportValidity());
    }

    get dynamicValidity(): string | undefined {
        const validityFn = this.config?.dynamicValidity;
        return validityFn && validityFn(this.value, this.form?.values);
    }

    get defaultValidationMessage(): string | undefined {
        return this.config?.validationMessage;
    }

    get validity() {
        return this.elements[0].validity;
    }

    get validityError() {
        return this.errorConstraintMap.filter(
            ([errorName, constraintName]) => this.validity[errorName]
        )[0];
    }

    get elements(): (HTMLInputElement | HTMLSelectElement)[] {
        return [];
    }

    get isValid() {
        return !this.error || this.error.length == 0;
    }

    get error(): string {
        if (!this.isValidated) this.validate();
        return this.elements[0].validationMessage;
    }

    get name(): string {
        return this.elements[0].name;
    }

    get value(): any {
        return this.elements[0].value;
    }

    get errorConstraintMap(): IInputErrorConstraintMap {
        const errorConstraintMap: IInputErrorConstraintMap = [
            ["badInput"],
            ["typeMismatch"],
        ];

        for (const constraint of this.supportedConstraints) {
            switch (constraint) {
                case "required":
                    errorConstraintMap.push(["valueMissing", "required"]);
                    break;
                case "pattern":
                    errorConstraintMap.push(["patternMismatch", "pattern"]);
                    break;
                case "min":
                    errorConstraintMap.push(["rangeUnderflow", "min"]);
                    break;
                case "max":
                    errorConstraintMap.push(["rangeOverflow", "max"]);
                    break;
                case "minLength":
                    errorConstraintMap.push(["tooShort", "minLength"]);
                    break;
                case "maxLength":
                    errorConstraintMap.push(["tooLong", "maxLength"]);
                    break;
                case "step":
                    errorConstraintMap.push(["stepMismatch", "step"]);
                    break;
            }
        }

        return errorConstraintMap;
    }
}
