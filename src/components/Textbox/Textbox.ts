import { Input, TInputConstraintEntry, TInputEvent } from "../Input";

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
  validate?: TInputConstraintEntry<
    (textbox: Textbox, context?: unknown) => boolean
  >;
}

// TODO: implement the custom validate() function
export class Textbox extends Input {
  element: HTMLInputElement;
  config?: ITextboxConfig;

  constructor(element: HTMLInputElement, config?: ITextboxConfig) {
    super();

    this.element = element;
    this.config = config;

    this.syncConstraints(CONSTRAINTS);

    this.element.addEventListener("invalid", () => {
      this.handleInvalid();
    });

    this.element.addEventListener("input", () => {
      this.handleChange();
    });
  }

  private emit(event: string) {
    if (this.config && this.config[event]) {
      this.config[event](this);
    }
  }

  private handleChange() {
    this.validate(this.validityError);
    this.emit("onChange");
  }

  private handleInvalid() {
    this.validate(this.validityError);
    this.emit("onInvalid");
  }

  get validityError() {
    return ERRORS.filter(([error]) => this.validity[error])[0];
  }

  get constraints() {
    return this.config;
  }

  get elements() {
    return [this.element];
  }

  get error() {
    return this.element.validationMessage;
  }

  get name() {
    return this.element.name;
  }

  get value() {
    return this.element.value;
  }

  get validity() {
    return this.element.validity;
  }
}
