import { getMobilePhoneLocale, getPostalLocale } from "./utils";
import isEmpty from "validator/lib/isEmpty";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import isPostalCode from "validator/lib/isPostalCode";

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
    this.validations.push((value: any, _context: unknown) => {
      if (typeof value === 'string') {
        if (!isEmpty(value)) return;
      } else if (Array.isArray(value)) {
        if (value.length > 0) return;
      }

      throw new Error(message);
    });

    return this;
  }

  email(message: string) {
    this.validations.push((value: any, _context: unknown) => {
      if (isEmail(value)) return;
      throw new Error(message);
    });

    return this;
  }

  phone(message: string) {
    this.validations.push((value: any, _context: unknown) => {
      if (isMobilePhone(value, getMobilePhoneLocale())) return;
      throw new Error(message);
    });

    return this;
  }

  zip(message: string) {
    this.validations.push((value: any, _context: unknown) => {
      if (isPostalCode(value, getPostalLocale())) return;
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