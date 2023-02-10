import { IInputProps, Input } from "../Input";

export interface IInputRadioGroupProps extends IInputProps {}

export class InputRadioGroup extends Input {
  radios: HTMLInputElement[];

  constructor(radios: HTMLInputElement[], props: IInputRadioGroupProps) {
    super(props);
    this.radios = radios;
    this._value = this.getCheckedRadioValue();

    this.radios.forEach((input) => {
      input.addEventListener('input', () => {
        this.handleChange();
      })
    })
  }

  getCheckedRadioValue() {
    return this.radios.filter((radio) => radio.checked)[0]?.value;
  }

  handleChange() {
    this.value = this.getCheckedRadioValue();
  }
}