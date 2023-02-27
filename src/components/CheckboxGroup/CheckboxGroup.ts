import { Input, TInputConstraintEntry, TInputDynamicValidity, TInputEvent } from "../Input";

const ERRORS = [["valueMissing", "required"], ["badInput"], ["typeMismatch"]];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface ICheckboxGroupConfig {
  onChange?: TInputEvent<CheckboxGroup>;
  onInvalid?: TInputEvent<CheckboxGroup>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  dynamicValidity?: TInputDynamicValidity;
}

export class CheckboxGroup extends Input {
  element: HTMLElement;
  checkboxes: HTMLInputElement[];

  constructor(element: HTMLElement, config?: ICheckboxGroupConfig) {
    super({
      supportedConstraints: ['required'],
    });

    this.syncConstraints();

    this.config = config;
    this.element = element;

    this.checkboxes = Array.from(
      this.element.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
    );

    Array.from(this.checkboxes).forEach((button) =>
      button.addEventListener("invalid", () => {
        this.handleInvalid();
      })
    );

    Array.from(this.checkboxes).forEach((button) =>
      button.addEventListener("input", () => {
        this.handleChange();
      })
    );
  }

  get elements() {
    return this.checkboxes;
  }

  get checked(): HTMLInputElement[] | undefined {
    return this.checkboxes.filter((button) => button.checked);
  }

  get value() {
    if (this.checkboxes.length > 1) {
      return this.checked ? this.checked.map((element) => element.value) : null;
    } else {
      return this.checked ? this.checked[0].value : null;
    }
  }
}
