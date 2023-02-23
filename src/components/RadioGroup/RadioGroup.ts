import { Input, TInputConstraintEntry, TInputEvent } from "../Input";
    
const ERRORS = [["valueMissing", "required"]];

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
  groupNode: HTMLElement;
  radioButtons: HTMLInputElement[];
  config?: IRadioGroupConfig;

  constructor(groupNode: HTMLElement, config?: IRadioGroupConfig) {
    super();

    this.groupNode = groupNode;
    this.config = config;

    this.radioButtons = Array.from(
      this.groupNode.querySelectorAll<HTMLInputElement>("input[type=radio]")
    );

    this.syncConstraints(CONSTRAINTS);

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
    this.validate(this.validityError);
    this.emit("onChange");
  }

  private handleInvalid() {
    this.validate(this.validityError);
    this.emit("onInvalid");
  }

  get elements() {
    return this.radioButtons;
  }
  
  get validityError() {
    return ERRORS.filter(([error]) => this.validity[error])[0];
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
