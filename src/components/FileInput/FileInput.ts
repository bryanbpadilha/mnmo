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

    private boundHandleInvalid: (event: Event) => void;
    private boundHandleInput: (event: Event) => void;

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

        this.boundHandleInvalid = (event: Event) => this.handleInvalid(event);
        this.boundHandleInput = (event: Event) => this.handleChange(event);

        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }

    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
    }

    get elements() {
        return [this.element];
    }
}
