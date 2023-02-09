import { Form } from "../Form";
import { Validator } from "../../lib/Validator";

export interface IInputProps {
  name: string;
  validator?: Validator;
  onChange?: (input: Input) => void;
  onInvalid?: (input: Input) => void;
}

export class Input implements IInputProps {
  form?: Form;
  isDirty: boolean;

  protected _isValid: null | boolean;
  protected _value: any;
  protected _error: null | string;
  readonly name: IInputProps['name'];
  validator: IInputProps["validator"];
  onChange?: IInputProps["onChange"];
  onInvalid?: IInputProps["onInvalid"];

  constructor(props: IInputProps) {
    this.name = props.name;
    this.validator = props?.validator;
    this.onChange = props?.onChange;
    this.onInvalid = props?.onInvalid;
    this.isDirty = false;
    this._error = null;
    this._isValid = null;
  }

  validate() {
    try {
      this.validator?.validate(this.value, this.form?.data);
      this.error = null;
      this.isValid = true;
    } catch (error: any) {
      this.error = error.message as string;
      this.isValid = false;

      if (!this.onInvalid) return;

      if (this.form) {
        if (this.form.triedSubmitting) this.onInvalid(this);
      } else {
        this.onInvalid(this);
      }
    }
  }

  set value(_value) {
    this._value = _value;
    if (!this.isDirty) this.isDirty = true;
  }

  get value(): any {
    return this._value;
  }

  set error(_error: null | string) {
    this._error = _error;
  }

  get error() {
    return this._error;
  }

  set isValid(_isValid: boolean) {
    this._isValid = _isValid;
  }

  get isValid(): boolean {
    if (this._isValid !== null) return this._isValid;

    try {
      this.validator?.validate(this.value, this.form?.data);
      this.isValid = true;
      return this.isValid;
    } catch (error) {
      this.isValid = false;
      return this.isValid;
    }
  }
}
