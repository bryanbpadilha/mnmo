import { Input } from "..";
import { createInputs } from "./Form.utils";
import { Validator } from "../../lib";

export interface IFormProps {
  onSubmit?: (form: Form) => Promise<void>;
  onChange?: (form: Form) => void;
  onInvalid?: (form: Form) => void;
  validator?: { [key: string]: Validator }
}

export class Form {
  // Properties
  readonly element: HTMLFormElement;
  readonly onSubmit?: IFormProps['onSubmit'];
  readonly onChange?: IFormProps['onChange'];
  readonly onInvalid?: IFormProps['onInvalid'];
  readonly validator?: IFormProps['validator'];

  // State
  triedSubmitting: boolean;
  isSubmitting: boolean;

  // Inputs
  inputs?: Input[];

  constructor(element: HTMLFormElement, props?: IFormProps) {
    this.element = element;
    this.onSubmit = props?.onSubmit;
    this.onChange = props?.onChange;
    this.onInvalid = props?.onInvalid;
    this.validator = props?.validator;

    this.triedSubmitting = false;
    this.isSubmitting = false;

    this.element.setAttribute('novalidate', '');

    this.element.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });

    this.element.addEventListener("change", () => {
      this.handleChange();
    });

    createInputs(this, this.validator);
  }

  async handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!this.triedSubmitting) {
      this.triedSubmitting = true;
    }

    this.validate();

    if (!this.isValid && this.onInvalid) {
      this.onInvalid(this);
    }

    if (this.isValid && this.onSubmit) {
      this.isSubmitting = true;
      await this.onSubmit(this);
      this.isSubmitting = false;
    }
  }

  handleChange() {
    if (this.onChange) {
      this.onChange(this);
    }
  }

  validate() {
    if (!this.inputs) return;
    this.inputs.forEach((input) => input.validate());
  }

  append(input: Input) {
    this.inputs = this.inputs ? [...this.inputs, input] : [input];
    input.form = this;
  }

  getInput(name: string) {
    return this.inputs?.filter((input) => input.name === name)[0];
  }

  get errors() {
    const errors: { [key: string]: any } = {};

    this.inputs?.forEach((input) => {
      errors[input.name] = input.error;
    })

    return errors;
  }

  get data() {
    const data: { [key: string]: any } = {};

    this.inputs?.forEach((input) => {
      data[input.name] = input.value;
    })

    return data;
  }

  get isValid() {
    if (!this.inputs) return true;
    return this.inputs.every((input) => input.isValid);
  }
}
