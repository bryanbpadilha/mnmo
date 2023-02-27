import { Input, TInputConstraintEntry, TInputDynamicValidity, TInputEvent } from "../Input";

const ERRORS = [
  ["valueMissing", "required"],
  ["badInput"],
  ["typeMismatch"],
  ["patternMismatch", "pattern"],
  ["rangeOverflow", "max"],
  ["rangeUnderflow", "min"],
  ["stepMismatch", "step"],
  ["tooLong", "maxLength"],
  ["tooShort", "minLength"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface ITextboxConfig {
  onChange?: TInputEvent<Textbox>;
  onInvalid?: TInputEvent<Textbox>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  step?: TInputConstraintEntry<number>;
  min?: TInputConstraintEntry<number | string>;
  max?: TInputConstraintEntry<number | string>;
  minLength?: TInputConstraintEntry<number>;
  maxLength?: TInputConstraintEntry<number>;
  pattern?: TInputConstraintEntry<number>;
  dynamicValidity?: TInputDynamicValidity;
}

// TODO: implement the custom validate() function
export class Textbox extends Input {
  element: HTMLInputElement;
  config?: ITextboxConfig;

  constructor(element: HTMLInputElement, config?: ITextboxConfig) {
    super({
      supportedConstraints: ['required', 'step', 'min', 'max', 'minLength', 'maxLength', 'pattern']
    });

    this.element = element;
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
