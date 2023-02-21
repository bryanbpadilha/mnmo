import { Constraint } from "../../lib";
import { IInputProps, Input } from "../Input";

export interface IInputTextboxProps extends IInputProps {}

export class InputTextbox extends Input {
  element: HTMLInputElement;

  constructor(element: HTMLInputElement, props: IInputTextboxProps) {
    super(props);
    this.element = element;
    this._value = this.element.value;

    this.appendConstraintAttributes();

    this.element.addEventListener('invalid', () => {
      this.validate();
    })

    this.element.addEventListener("input", () => {
      this.handleChange();
    });
  }

  handleChange() {
    this.value = this.element.value;
  }

  appendConstraintAttributes() {
    const constraints = this.constraint?.constraints;

    if (constraints?.required) {
      this.element.setAttribute('required', '');
    } else {
      this.element.removeAttribute('required');
    }
  }

  validate() {
    try {
      this.constraint?.validate(this.value, this.form?.data, this.element);
      this.handleValid();
    } catch (error: any) {
      this.handleInvalid(error.message);
    }
  }

  set isValid(_isValid: boolean) {
    this._isValid = _isValid;
  }

  get isValid(): boolean {
    if (this._isValid !== null) {
      return this._isValid;
    }

    try {
      this.constraint?.validate(this.value, this.form?.data, this.element);
      this._isValid = true;
      return this._isValid;
    } catch (error) {
      this._isValid = false;
      return this._isValid;
    }
  }
}
