import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
export interface ITextboxConfig {
    onChange?: TInputEvent<Textbox>;
    onInvalid?: TInputEvent<Textbox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    step?: TInputConstraintEntry<number>;
    min?: TInputConstraintEntry<number | string>;
    max?: TInputConstraintEntry<number | string>;
    minLength?: TInputConstraintEntry<number>;
    maxLength?: TInputConstraintEntry<number>;
    pattern?: TInputConstraintEntry<string>;
    dynamicValidity?: TInputDynamicValidity;
    mask?: string | ((value: string) => string);
    valueAs?: (value: string) => any;
}
export declare class Textbox extends Input {
    element: HTMLInputElement | HTMLTextAreaElement;
    config?: ITextboxConfig;
    mask?: string | ((value: string) => string) | null;
    constructor(
        element: TSelector<HTMLTextAreaElement | HTMLInputElement>,
        config?: ITextboxConfig
    );
    get elements(): HTMLInputElement[];
    get value(): any;
}
