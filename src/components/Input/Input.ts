import { Form } from "../Form";
import { Validator } from "../../lib/Validator";
import { Constraint } from "../../lib";

export type TInputEvents = ['constraintChanged'];

export interface IInputProps {
  name: string;
  constraint?: Constraint;
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
  readonly constraint: IInputProps["constraint"];
  validator: IInputProps["validator"];
  onChange?: IInputProps["onChange"];
  onInvalid?: IInputProps["onInvalid"];

  constructor(props: IInputProps) {
    this.name = props.name;
    this.constraint = props?.constraint;
    this.validator = props?.validator;
    this.onChange = props?.onChange;
    this.onInvalid = props?.onInvalid;
    this.isDirty = false;
    this._error = null;
    this._isValid = null;
  }

  validate() {
    try {
      this.constraint?.validate(this.value, this.form?.data);
      this.handleValid();
    } catch (error: any) {
      this.handleInvalid(error.message as string);
    }
  }

  handleInvalid(errorMessage: string) {
    this.error = errorMessage;
    this.isValid = false;

    if (!this.onInvalid) return;

    if (this.form) {
      if (this.form.triedSubmitting) this.onInvalid(this);
    } else {
      this.onInvalid(this);
    }
  }

  handleValid() {
    this.error = null;
    this.isValid = true;
  }

  set value(_value) {
    this._value = _value;
    if (!this.isDirty) this.isDirty = true;
    if (this.onChange) this.onChange(this);
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

  get isValid() {
    return this._isValid !== null ? this._isValid : true;
  }
}
