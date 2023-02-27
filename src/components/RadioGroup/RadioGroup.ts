import { Input, TInputConstraintEntry, TInputEvent } from "../Input";
    
const ERRORS = [
  ["valueMissing", "required"],
  ["badInput"],
  ["typeMismatch"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface IRadioGroupConfig {
  onChange?: TInputEvent<RadioGroup>;
  onInvalid?: TInputEvent<RadioGroup>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  validate?: TInputConstraintEntry<
    (radioGroup: RadioGroup, context?: unknown) => boolean
  >;
}

export class RadioGroup extends Input {
  element: HTMLElement;
  radioButtons: HTMLInputElement[];
  config?: IRadioGroupConfig;

  constructor(element: HTMLElement, config?: IRadioGroupConfig) {
    super({
      constraints: ['required']
    });

    this.element = element;
    this.config = config;

    this.radioButtons = Array.from(
      this.element.querySelectorAll<HTMLInputElement>("input[type=radio]")
    );

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
  
  get elements() {
    return this.radioButtons;
  }

  get checked(): HTMLInputElement | undefined {
    return this.radioButtons.filter((button) => button.checked)[0];
  }

  get value() {
    return this.checked ? this.checked.value : null;
  }
}
