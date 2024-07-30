import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
export interface ISelectConfig {
    onChange?: TInputEvent<Select>;
    onInvalid?: TInputEvent<Select>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
export declare class Select extends Input {
    element: HTMLSelectElement;
    config?: ISelectConfig;
    constructor(element: TSelector<HTMLSelectElement>, config?: ISelectConfig);
    get elements(): HTMLSelectElement[];
}
