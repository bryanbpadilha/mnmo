const CONSTRAINTS = ["required"] as const;

export type TRadioGroupConstraintEntry<T> =
  | T
  | {
      value: T;
      message: string;
    };

export type TRadioGroupEvent = (radioGroup: RadioGroup) => void;

export interface IRadioGroupConfig {
  onChange?: TRadioGroupEvent;
  onInvalid?: TRadioGroupEvent;
  // Constraints
  validationMessage?: string;
  required?: TRadioGroupConstraintEntry<true>;
  validate?: TRadioGroupConstraintEntry<
    (radioGroup: RadioGroup, context?: unknown) => boolean
  >;
}

export class RadioGroup {
  groupNode: HTMLElement;
  radioButtons: HTMLInputElement[];
  config?: IRadioGroupConfig;

  constructor(groupNode: HTMLElement, config?: IRadioGroupConfig) {
    this.groupNode = groupNode;
    this.config = config;

    this.radioButtons = Array.from(
      this.groupNode.querySelectorAll<HTMLInputElement>("input[type=radio]")
    );

    this.syncConstraints();

    Array.from(this.radioButtons).forEach((button) =>
      button.addEventListener("invalid", () => {
        this.handleInvalid();
      })
    );

    Array.from(this.radioButtons).forEach((button) =>
      button.addEventListener("input", () => {
        this.handleChange();
      })
    );
  }

  private emit(event: string) {
    if (this.config && this.config[event]) {
      this.config[event](this);
    }
  }

  private handleChange() {
    this.validate();
    this.emit("onChange");
  }

  private handleInvalid() {
    this.validate();
    this.emit("onInvalid");
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

      for (const element of this.radioButtons) {
        element.setAttribute(key, String(constraintValue));
      }

      if (constraintMessage) {
        for (const element of this.radioButtons) {
          element.setAttribute(`${key}-message`, constraintMessage);
        }
      }
    }
  }

  private syncConstraints() {
    const constraints = CONSTRAINTS;
    constraints.forEach((key) => this.syncConstraintEntry(key));
  }

  private getDefaultValidationMessage() {
    return (
      this.config?.validationMessage ??
      this.radioButtons[0].getAttribute("validation-message") ??
      this.radioButtons[0].validationMessage
    );
  }

  private getCustomValidationMessage(key?: typeof CONSTRAINTS[number]) {
    const customMessage = this.radioButtons[0].getAttribute(`${key}-message`);

    if (!key || !customMessage) {
      return this.getDefaultValidationMessage();
    }

    return customMessage;
  }

  validate() {
    const errors = [["valueMissing", "required"]];

    const error = errors.filter(([error]) => this.validity[error])[0];

    if (error) {
      const [errorName, constraint] = error;
      const message = this.getCustomValidationMessage(
        constraint as typeof CONSTRAINTS[number]
      );
      this.setCustomValidity(message);
    } else {
      this.setCustomValidity("");
    }
  }

  setCustomValidity(validity: string) {
    for (const element of this.radioButtons) {
      element.setCustomValidity(validity);
    }
  }

  checkValidity() {
    this.validate();
    return this.radioButtons[0].checkValidity();
  }

  reportValidity() {
    this.validate();
    return this.radioButtons[0].reportValidity();
  }

  get checked(): HTMLInputElement | undefined {
    return this.radioButtons.filter((button) => button.checked)[0];
  }

  get error() {
    return this.radioButtons[0].validationMessage;
  }

  get name() {
    return this.radioButtons[0].name;
  }

  get value() {
    return this.checked ? this.checked.value : null;
  }

  get validity() {
    return this.radioButtons[0].validity;
  }
}
