import { selectElement } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";

export interface IFileInputConfig {
    onChange?: TInputEvent<FileInput>;
    onInvalid?: TInputEvent<FileInput>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}

export class FileInput extends Input {
    element: HTMLInputElement;
    config?: IFileInputConfig;

    constructor(
        element: TSelector<HTMLInputElement>,
        config?: IFileInputConfig
    ) {
        super({
            supportedConstraints: ["required"],
        });

        this.element = selectElement<HTMLInputElement>(
            element,
            HTMLInputElement
        );

        this.config = config;

        this.syncConstraints();

        this.element.addEventListener("invalid", () => {
            this.handleInvalid();
        });

        this.element.addEventListener("input", () => {
            this.handleChange();
        });
    }

    get elements() {
        return [this.element];
    }
}
