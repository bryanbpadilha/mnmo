import { IInputProps, Input } from "../Input";

export interface IInputCheckGroup extends IInputProps {}

export class InputCheckGroup extends Input {
  boxes: HTMLInputElement[];

  constructor(boxes: HTMLInputElement[], props: IInputCheckGroup) {
    super(props);
    this.boxes = boxes;
    this._value = this.getCheckedBoxesValue();

    this.boxes.forEach((input) => {
      input.addEventListener('input', () => {
        this.handleChange();
      })
    })
  }

  getCheckedBoxesValue() {
    return this.boxes.filter((box) => box.checked).map((box) => box.value);
  }

  handleChange() {
    this.value = this.getCheckedBoxesValue();
  }
}