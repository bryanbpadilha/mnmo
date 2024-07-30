import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
export interface ICheckboxConfig {
    onChange?: TInputEvent<Checkbox>;
    onInvalid?: TInputEvent<Checkbox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
export declare class Checkbox extends Input {
    element: HTMLInputElement;
    config?: ICheckboxConfig;
    constructor(element: TSelector<HTMLInputElement>, config?: ICheckboxConfig);
    get elements(): HTMLInputElement[];
    get checked(): boolean;
    get value(): string | null;
}
