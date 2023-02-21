type TValidation = (
  value: any,
  context: unknown,
  input?: HTMLInputElement | HTMLSelectElement,
) => void;

export class Constraint {
  constraints: {
    required?: boolean;
    type?: string;
    min?: number | string;
    max?: number | string;
    step?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };

  validations: TValidation[];

  constructor() {
    this.constraints = {};
    this.validations = [];
  }

  required(message?: string) {
    this.constraints.required = true;

    this.validations.push((value, _context, input) => {
      if (Array.isArray(value) && value.length > 0) return;
      if (input && !input.validity.valueMissing) return;
      if (typeof value === 'string' && value.length > 0) return;
      if (typeof value === 'number') return;

      if (message) {
        if (input) input.setCustomValidity(message);
        throw new Error(message);
      }

      if (input) {
        throw new Error(input.validationMessage);
      }

      throw new Error('This field is required.')
    });

    return this;
  }

  validate(value: any, context: unknown, input?: HTMLInputElement | HTMLSelectElement) {
    this.validations.forEach((validation) => validation(value, context, input));
  }
}
