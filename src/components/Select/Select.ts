import { Input, TInputConstraintEntry, TInputEvent } from "../Input";

const ERRORS = [
  ["valueMissing", "required"],
  ["badInput"],
  ["typeMismatch"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

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

  get defaultValidationMessage() {
    return this.config?.validationMessage;
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
