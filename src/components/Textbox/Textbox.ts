import {
  Input,
  TInputConstraintEntry,
  TInputDynamicValidity,
  TInputEvent,
} from "../Input";
import { maskValue, restoreCursorPosition } from "./Textbox.util";

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
  pattern?: TInputConstraintEntry<string>;
  dynamicValidity?: TInputDynamicValidity;
  // Mask
  mask?: string;
}

export class Textbox extends Input {
  element: HTMLInputElement;
  config?: ITextboxConfig;

  constructor(element: HTMLInputElement, config?: ITextboxConfig) {
    super({
      supportedConstraints: [
        "required",
        "step",
        "min",
        "max",
        "minLength",
        "maxLength",
        "pattern",
      ],
    });

    this.element = element;
    this.config = config;

    this.syncConstraints();

    if (this.config?.mask && !["tel", "text"].includes(this.element.type)) {
      throw new Error(
        'Textbox masking is only allowed with input type of "tel" or "text"'
      );
    }

    this.element.addEventListener("invalid", () => {
      this.handleInvalid();
    });

    this.element.addEventListener("input", (e) => {
      this.handleChange();

      if (!this.config?.mask) return;

      const value = this.value;
      const mask = this.config.mask;
      const event = e as InputEvent;

      restoreCursorPosition(value, mask, event, () => {
        this.element.value = maskValue(value, mask, event);
      });
    });
  }

  get elements() {
    return [this.element];
  }
}
