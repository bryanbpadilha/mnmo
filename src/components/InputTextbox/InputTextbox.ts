import { IInputProps, Input } from "../Input";

export interface IInputTextboxProps extends IInputProps {}

export class InputTextbox extends Input {
  element: HTMLInputElement;

  constructor(element: HTMLInputElement, props: IInputTextboxProps) {
    super(props);
    this.element = element;
    this._value = this.element.value;

    this.element.addEventListener("input", () => {
      this.handleChange();
    });
  }

  handleChange() {
    this.value = this.element.value;
  }
}
