import type { Input } from "..";
import type { TSelector } from "../../util/types";
export type TFormEvent = (form: Form) => void;
export type TFormSubmitEvent = (form: Form) => Promise<void>;
export interface IFormConfig {
    onInvalid?: TFormEvent;
    onChange?: TFormEvent;
    onInput?: TFormEvent;
    onSubmit?: TFormSubmitEvent;
}
export declare class Form {
    element: HTMLFormElement;
    config?: IFormConfig;
    inputs?: Input[];
    isDirty: boolean;
    isSubmitted: boolean;
    isSubmitting: boolean;
    constructor(element: TSelector<HTMLFormElement>, config?: IFormConfig);
    private emit;
    private handleInput;
    private handleChange;
    private handleSubmit;
    private handleInvalid;
    append(...inputs: Input[]): void;
    getInput(name: string): Input | undefined;
    get errors(): {
        [key: string]: string;
    };
    get values(): {
        [key: string]: any;
    };
    get data(): FormData;
    get elements(): HTMLFormControlsCollection;
    get isValid(): boolean;
}
