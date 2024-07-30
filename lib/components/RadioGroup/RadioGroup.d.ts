import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
export interface IRadioGroupConfig {
    onChange?: TInputEvent<RadioGroup>;
    onInvalid?: TInputEvent<RadioGroup>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
export declare class RadioGroup extends Input {
    element: HTMLElement;
    radioButtons: HTMLInputElement[];
    config?: IRadioGroupConfig;
    constructor(element: TSelector<HTMLElement>, config?: IRadioGroupConfig);
    get elements(): HTMLInputElement[];
    get checked(): HTMLInputElement | undefined;
    get value(): string | null;
}
