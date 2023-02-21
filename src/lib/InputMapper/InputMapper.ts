import {
  Form,
  InputCheckGroup,
  InputRadioGroup,
  InputSelect,
  InputTextbox,
} from "../../components";

const INPUTS = {
  InputCheckGroup,
  InputRadioGroup,
  InputSelect,
  InputTextbox,
};

import { defaultInputMap } from "../../context";
import { Constraint } from "../Constraint";

/**
 * An InputMap is an object with keys corresponding to a certain input class
 * name and value as a function. The function receives a collection of
 * `FormControls`, which are essentially input elements inside a form, and
 * must return an array of elements to be made into inputs.
 *
 * @example
 * ```
 * {
 *   InputSelect: (elements: HTMLFormControlsCollection) => HTMLSelectElement[],
 *   InputTextbox: (elements: HTMLFormControlsCollection) => HTMLInputElement[],
 *   // Checkboxes and radios must be further grouped by name
 *   InputCheckGroup: (elements: HTMLFormControlsCollection) => HTMLInputElement[][],
 * }
 * ```
 */
export interface IInputMap {
  InputCheckGroup: (
    elements: HTMLFormControlsCollection
  ) => HTMLInputElement[][];
  InputRadioGroup: (
    elements: HTMLFormControlsCollection
  ) => HTMLInputElement[][];
  InputSelect: (elements: HTMLFormControlsCollection) => HTMLSelectElement[];
  InputTextbox: (elements: HTMLFormControlsCollection) => HTMLInputElement[];
}

type TInputMapKey = keyof typeof INPUTS;

export interface IInputMapperProps {
  inputMap?: IInputMap;
  constraint?: {
    [key: string]: Constraint;
  };
}

/**
 * If no InputMap is provided, the InputMapper will use the globally defined
 * `defaultInputMap`. For more details on this and on how you can change it, see
 * context.
 */
export class InputMapper implements IInputMapperProps {
  readonly inputMap: IInputMap;
  readonly constraint: IInputMapperProps["constraint"];

  constructor(options?: IInputMapperProps) {
    this.inputMap = options?.inputMap ?? defaultInputMap;
    this.constraint = options?.constraint;
  }

  map(form: Form) {
    const inputs = Object.entries(this.inputMap).map((entry) => {
      const mapKey = entry[0] as TInputMapKey;
      const inputMap = entry[1] as IInputMap[typeof mapKey];
      const mappedElements = inputMap(form.element.elements);

      const inputs: InstanceType<typeof INPUTS[keyof typeof INPUTS]>[] = [];

      for (const input of mappedElements) {
        const name = Array.isArray(input) ? input[0].name : input.name;
        const constraint = this.constraint && this.constraint[name];
        const InputClass = INPUTS[mapKey];

        // TODO: surely there's a way to make this simpler
        if (InputClass === INPUTS['InputCheckGroup']) {
          inputs.push(new InputClass(input as HTMLInputElement[], { name, constraint }))
        }

        if (InputClass === INPUTS['InputRadioGroup']) {
          inputs.push(new InputClass(input as HTMLInputElement[], { name, constraint }))
        }

        if (InputClass === INPUTS['InputSelect']) {
          inputs.push(new InputClass(input as HTMLSelectElement, { name, constraint }))
        }

        if (InputClass === INPUTS['InputTextbox']) {
          inputs.push(new InputClass(input as HTMLInputElement, { name, constraint }))
        }
      }

      return inputs.flat();
    }).flat();

    form.append(...inputs);
  }
}
