const CONSTRAINTS = [
  "required",
  "step",
  "min",
  "max",
  "minLength",
  "maxLength",
  "pattern",
] as const;

export type TTextboxConstraintEntry<T> =
  | T
  | {
      value: T;
      message: string;
    };

export type TTextboxEvent = (textbox: Textbox) => void;

export interface ITextboxConfig {
  onChange?: TTextboxEvent;
  onInvalid?: TTextboxEvent;
  // Constraints
  validationMessage?: string;
  required?: TTextboxConstraintEntry<true>;
  step?: TTextboxConstraintEntry<number>;
  min?: TTextboxConstraintEntry<number | string>;
  max?: TTextboxConstraintEntry<number | string>;
  minLength?: TTextboxConstraintEntry<number>;
  maxLength?: TTextboxConstraintEntry<number>;
  pattern?: TTextboxConstraintEntry<number>;
  validate?: TTextboxConstraintEntry<
    (textbox: Textbox, context?: unknown) => boolean
  >;
}

export class Textbox {
  element: HTMLInputElement;
  config?: ITextboxConfig;

  constructor(element: HTMLInputElement, config?: ITextboxConfig) {
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

  private emit(event: string) {
    if (this.config && this.config[event]) {
      this.config[event](this);
    }
  }

  private syncConstraintEntry(key: typeof CONSTRAINTS[number]) {
    if (this.config && this.config[key]) {
      const constraint = this.config[key];

      let constraintValue: boolean | string | number;
      let constraintMessage: string | undefined;

      if (typeof constraint === "object") {
        constraintValue = constraint.value;
        constraintMessage = constraint.message;
      } else {
        constraintValue = this.config[key] as boolean | string | number;
      }

      this.element.setAttribute(key, String(constraintValue));
      if (constraintMessage) this.element.setAttribute(`${key}-message`, constraintMessage);
    }
  }

  private syncConstraints() {
    const constraints = CONSTRAINTS;
    constraints.forEach((key) => this.syncConstraintEntry(key));
  }

  private handleChange() {
    this.validate();
    this.emit("onChange");
  }

  private handleInvalid() {
    this.validate();
    this.emit("onInvalid");
  }

  private getDefaultValidationMessage() {
    return (
      this.config?.validationMessage ??
      this.element.getAttribute("validation-message") ??
      this.element.validationMessage
    );
  }

  private getCustomValidationMessage(key?: typeof CONSTRAINTS[number]) {
    const customMessage = this.element.getAttribute(`${key}-message`);

    if (!key || !customMessage) {
      return this.getDefaultValidationMessage();
    }

    return customMessage;
  }

  validate() {
    const errors = [
      ["valueMissing", "required"],
      ["badInput"],
      ["typeMismatch"],
      ["patternMismatch", "pattern"],
      ["rangeOverflow", "max"],
      ["rangeUnderflow", "min"],
      ["stepMismatch", "step"],
      ["tooLong", "maxLength"],
      ["tooShort", "minLength"],
    ]

    const error = errors.filter(([error]) => this.validity[error])[0];

    if (error) {
      const [errorName, constraint] = error;
      const message = this.getCustomValidationMessage(constraint as typeof CONSTRAINTS[number]);
      this.setCustomValidity(message);
    } else {
      this.setCustomValidity("");
    }
  }

  setCustomValidity(validity: string) {
    this.element.setCustomValidity(validity);
  }

  checkValidity() {
    this.validate();
    return this.element.checkValidity();
  }

  reportValidity() {
    this.validate();
    return this.element.reportValidity();
  }

  get value() {
    return this.element.value;
  }

  get validity() {
    return this.element.validity;
  }
}
