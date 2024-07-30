import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
export interface ICheckboxGroupConfig {
    onChange?: TInputEvent<CheckboxGroup>;
    onInvalid?: TInputEvent<CheckboxGroup>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
export declare class CheckboxGroup extends Input {
    element: HTMLElement;
    checkboxes: HTMLInputElement[];
    constructor(element: TSelector<HTMLElement>, config?: ICheckboxGroupConfig);
    get elements(): HTMLInputElement[];
    get checked(): HTMLInputElement[] | undefined;
    get value(): string | string[] | null;
}
