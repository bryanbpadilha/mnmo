import { Input, TInputConstraintEntry, TInputEvent } from "../Input";

export interface ISelectConfig {
  onChange?: TInputEvent<Select>;
  onInvalid?: TInputEvent<Select>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  validate?: TInputConstraintEntry<
    (select: Select, context?: unknown) => boolean
  >;
}

// TODO: implement the custom validate() function
export class Select extends Input {
  element: HTMLSelectElement;
  config?: ISelectConfig;

  constructor(element: HTMLSelectElement, config?: ISelectConfig) {
    super({
      constraints: ["required"],
    });

    this.element = element;
    this.config = config;

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
