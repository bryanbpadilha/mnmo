import { Input, TInputConstraintEntry, TInputEvent } from "../Input";

const ERRORS = [
  ["valueMissing", "required"],
  ["badInput"],
  ["typeMismatch"],
];

const CONSTRAINTS = ERRORS.map(([errorName, constraintName]) => constraintName);

export interface ICheckboxGroupConfig {
  onChange?: TInputEvent<CheckboxGroup>;
  onInvalid?: TInputEvent<CheckboxGroup>;
  // Constraints
  validationMessage?: string;
  required?: TInputConstraintEntry<true>;
  validate?: TInputConstraintEntry<
    (checkboxGroup: CheckboxGroup, context?: unknown) => boolean
  >;
}

export class CheckboxGroup extends Input {
  groupNode: HTMLElement;
  checkboxes: HTMLInputElement[];
  config?: ICheckboxGroupConfig;

  constructor(groupNode: HTMLElement, config?: ICheckboxGroupConfig) {
    super();

    this.groupNode = groupNode;
    this.config = config;

    this.checkboxes = Array.from(
      this.groupNode.querySelectorAll<HTMLInputElement>("input[type=checkbox]")
    );

    this.syncConstraints(CONSTRAINTS);

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
    return this.checkboxes;
  }

  get defaultValidationMessage() {
    return this.config?.validationMessage;
  }

  get validityError() {
    return ERRORS.filter(([error]) => this.validity[error])[0];
  }

  get checked(): HTMLInputElement[] | undefined {
    return this.checkboxes.filter((button) => button.checked);
  }

  get error() {
    return this.checkboxes[0].validationMessage;
  }

  get name() {
    return this.checkboxes[0].name;
  }

  get value() {
    return this.checked ? this.checked.map((element) => element.value) : null;
  }

  get validity() {
    return this.checkboxes[0].validity;
  }
}
