import { Input, TInputConstraintEntry, TInputEvent } from "../Input";

const ERRORS = [
  ["valueMissing", "required"],
  ["badInput"],
  ["typeMismatch"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface ICheckboxConfig {
  onChange?: TInputEvent<Checkbox>;
  onInvalid?: TInputEvent<Checkbox>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  validate?: TInputConstraintEntry<
    (checkboxGroup: Checkbox, context?: unknown) => boolean
  >;
}

export class Checkbox extends Input {
  element: HTMLInputElement;
  config?: ICheckboxConfig;

  constructor(element: HTMLInputElement, config?: ICheckboxConfig) {
    super();

    this.element = element;
    this.config = config;

    this.syncConstraints(CONSTRAINTS);

    this.element.addEventListener("invalid", () => {
      this.handleInvalid();
    })

    this.element.addEventListener("input", () => {
      this.handleChange();
    })
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

  get constraints() {
    return this.config;
  }

  get elements() {
    return [this.element];
  }

  get defaultValidationMessage() {
    return this.config?.validationMessage;
  }

  get validityError() {
    return ERRORS.filter(([error]) => this.validity[error])[0];
  }

  get checked() {
    return this.element.checked;
  }

  get error() {
    return this.element.validationMessage;
  }

  get name() {
    return this.element.name;
  }

  get value() {
    return this.element.checked ? this.element.value : null;
  }

  get validity() {
    return this.element.validity;
  }
}
