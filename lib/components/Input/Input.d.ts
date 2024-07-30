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
export declare class Input {
    config?: Record<string, any>;
    supportedConstraints: IInputProperties["supportedConstraints"];
    form?: Form;
    isTouched: boolean;
    isValidated: boolean;
    constructor(properties: IInputProperties);
    protected emit(event: string): void;
    protected handleChange(): void;
    protected handleInvalid(): void;
    protected syncConstraintEntry(key: string): void;
    protected syncConstraints(): void;
    protected getDefaultValidationMessage(): string;
    protected getCustomValidationMessage(key?: string): string;
    validate(): void;
    setCustomValidity(validity: string): void;
    checkValidity(): boolean;
    reportValidity(): boolean;
    get dynamicValidity(): string | undefined;
    get defaultValidationMessage(): string | undefined;
    get validity(): ValidityState;
    get validityError():
        | ["badInput"]
        | ["typeMismatch"]
        | ["valueMissing", "required"]
        | ["patternMismatch", "pattern"]
        | ["rangeOverflow", "max"]
        | ["rangeUnderflow", "min"]
        | ["stepMismatch", "step"]
        | ["tooLong", "maxLength"]
        | ["tooShort", "minLength"];
    get elements(): (HTMLInputElement | HTMLSelectElement)[];
    get isValid(): boolean;
    get error(): string;
    get name(): string;
    get value(): any;
    get errorConstraintMap(): IInputErrorConstraintMap;
}
