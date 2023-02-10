import { Input } from "..";
import { createInputs } from "./Form.util";
import { Validator } from "../../lib";
import { InputMapper } from "../../lib/InputMapper/InputMapper";

export interface IFormProps {
  onSubmit?: (form: Form) => Promise<void>;
  onChange?: (form: Form) => void;
  onInvalid?: (form: Form) => void;
  validator?: { [key: string]: Validator }
  inputMapper?: InputMapper,
}

export class Form {
  // Properties
  readonly element: HTMLFormElement;
  readonly onSubmit?: IFormProps['onSubmit'];
  readonly onChange?: IFormProps['onChange'];
  readonly onInvalid?: IFormProps['onInvalid'];
  readonly validator?: IFormProps['validator'];
  readonly inputMapper?: IFormProps['inputMapper'];

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
    this.inputMapper = props?.inputMapper;

    this.triedSubmitting = false;
    this.isSubmitting = false;

    this.element.setAttribute('novalidate', '');

    this.element.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });

    this.element.addEventListener("change", () => {
      this.handleChange();
    });

    this.inputMapper?.map(this);
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

  append(...inputs: Input[]) {
    for (const input of inputs) {
      if (this.validator && this.validator[input.name]) {
        input.validator = this.validator[input.name];
      }

      this.inputs = this.inputs ? [...this.inputs, input] : [input];
      input.form = this;
    }
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
