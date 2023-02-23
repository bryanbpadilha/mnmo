export type TInputEvent<T> = (input: T) => void;

export type TInputConstraintEntry<T> =
  | T
  | {
      value: T;
      message: string;
    };

export class Input {
  protected syncConstraintEntry(key: string) {
    if (this.constraints && this.constraints[key]) {
      const constraint = this.constraints[key];

      let constraintValue: boolean | string | number;
      let constraintMessage: string | undefined;

      if (typeof constraint === "object") {
        constraintValue = constraint.value;
        constraintMessage = constraint.message;
      } else {
        constraintValue = this.constraints[key] as boolean | string | number;
      }

      for (const element of this.elements) {
        element.setAttribute(key, String(constraintValue));
      }

      if (constraintMessage) {
        for (const element of this.elements) {
          element.setAttribute(`${key}-message`, constraintMessage);
        }
      }
    }
  }

  protected syncConstraints(constraints: string[]) {
    constraints.forEach((key) => this.syncConstraintEntry(key));
  }

  protected getDefaultValidationMessage() {
    return (
      this.defaultValidationMessage ??
      this.elements[0].getAttribute("validation-message") ??
      this.elements[0].validationMessage
    );
  }

  protected getCustomValidationMessage(key?: string) {
    const customMessage = this.elements[0].getAttribute(`${key}-message`);

    if (!key || !customMessage) {
      return this.getDefaultValidationMessage();
    }

    return customMessage;
  }

  validate(error?: string[]) {
    if (error) {
      const [errorName, constraint] = error;
      const message = this.getCustomValidationMessage(constraint);
      this.setCustomValidity(message);
    } else {
      this.setCustomValidity("");
    }
  }

  setCustomValidity(validity: string) {
    for (const element of this.elements) {
      element.setCustomValidity(validity);
    }
  }

  checkValidity() {
    this.validate();
    return this.elements.every((element) => element.checkValidity());
  }

  reportValidity() {
    this.validate();
    return this.elements.every((element) => element.checkValidity());
  }

  get constraints(): undefined | Record<string, any> {
    return;
  }

  get defaultValidationMessage(): string | undefined {
    return;
  }

  get elements(): HTMLInputElement[] {
    return [];
  }

  get error(): string {
    return "";
  }

  get name(): string {
    return "";
  }

  get value(): any {
    return;
  }
}
