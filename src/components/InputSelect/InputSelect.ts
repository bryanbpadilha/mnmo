import { IInputProps, Input } from "../Input";

export interface IInputSelectProps extends IInputProps {}

export class InputSelect extends Input {
  element: HTMLSelectElement;

  constructor(element: HTMLSelectElement, props: IInputSelectProps) {
    super(props);
    this.element = element;
    this._value = this.element.value;

    this.element.addEventListener("input", () => {
      this.handleChange();
    });
  }

  handleChange() {
    this.value = this.element.value;
    if (this.onChange) this.onChange(this);
  }
}
