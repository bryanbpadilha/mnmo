import {
  Form,
  InputCheckGroup,
  InputRadioGroup,
  InputSelect,
  InputTextbox,
} from "../../components";

import { defaultInputMap } from "../../context";

export const INPUTS = {
  InputCheckGroup,
  InputRadioGroup,
  InputSelect,
  InputTextbox,
} as const;

export type IInputMapKey = keyof typeof INPUTS;

export type IInputMapFunction = (
  elements: HTMLFormControlsCollection
) => InstanceType<typeof INPUTS[keyof typeof INPUTS]>[];

/**
 * An InputMap is an object with keys corresponding to a certain input class
 * name, and value of a function that receives a list of form elements and
 * returns an array of the corresponding Input.
 * 
 * Example:
 * ```
 * {
 *   InputCheckGroup: (elements: HTMLFormControlsCollection) => InputCheckGroup[];
 * }
 * ```
 * 
 * The form elements of a `Form` instance are acessed like this:
 * `form.element.elements`.
 */
export type IInputMap = Partial<Record<IInputMapKey, IInputMapFunction>>;

/**
 * If no InputMap is provided, the InputMapper will use the globally defined
 * `defaultInputMap`. For more details on this and on how you can change it, see
 * context.
 */
export class InputMapper {
  readonly inputMap: IInputMap; 

  constructor(inputMap?: IInputMap) {
    this.inputMap = inputMap ?? defaultInputMap;
  }

  map(form: Form) {
    const inputs = Object.values(this.inputMap).map((inputMap) => (
      inputMap(form.element.elements)
    )).flat();

    form.append(...inputs);
  }
}
