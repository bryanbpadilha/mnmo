import _validator from "validator";
import { getMobilePhoneLocale, getPostalLocale } from "./utils";

type TValidationEntry = (value: any, context: unknown) => void;

export class Validator {
  validations: TValidationEntry[];

  constructor() {
    this.validations = [];
  }

  validate(value: any, context: unknown) {
    this.validations.forEach((validation) => validation(value, context));
  }

  required(message: string) {
    this.validations.push((value: any, context: unknown) => {
      if (typeof value === 'string') {
        if (!_validator.isEmpty(value)) return;
      } else if (Array.isArray(value)) {
        if (value.length > 0) return;
      }

      throw new Error(message);
    });

    return this;
  }

  email(message: string) {
    this.validations.push((value: any, context: unknown) => {
      if (_validator.isEmail(value)) return;
      throw new Error(message);
    });

    return this;
  }

  phone(message: string) {
    this.validations.push((value: any, context: unknown) => {
      if (_validator.isMobilePhone(value, getMobilePhoneLocale())) return;
      throw new Error(message);
    });

    return this;
  }

  zip(message: string) {
    this.validations.push((value: any, context: unknown) => {
      if (_validator.isPostalCode(value, getPostalLocale())) return;
      throw new Error(message);
    });

    return this;
  }

  custom(
    message: string,
    validation: (value: any, context: unknown) => boolean
  ) {
    this.validations.push((value: any, context: unknown) => {
      if (validation(value, context)) return;
      throw new Error(message);
    });

    return this;
  }
};