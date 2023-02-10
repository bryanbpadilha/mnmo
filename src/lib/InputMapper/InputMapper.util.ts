import {
  Input,
  InputCheckGroup,
  InputRadioGroup,
  InputSelect,
  InputTextbox,
} from "../../components";
import { IInputMap } from "./InputMapper";

const isRadio = (element: Element) => {
  return (element as HTMLInputElement).type === "radio";
};

const isCheck = (element: Element) => {
  return (element as HTMLInputElement).type === "checkbox";
};

const isSelect = (element: Element) => {
  return (element as HTMLSelectElement).tagName === "SELECT";
};

const isTextbox = (element: Element) => {
  return [
    "text",
    "tel",
    "email",
    "date",
    "number",
    "password",
    "search",
    "url",
  ].includes((element as HTMLInputElement).type);
};

export const defaultInputMap: IInputMap = {
  InputCheckGroup(elements) {
    const checkboxes = Array.from(elements).filter(
      isCheck
    ) as HTMLInputElement[];

    const checkGroups: InputCheckGroup[] = [];

    for (const name of checkboxes.map((box) => box.name)) {
      const sameNameBoxes = checkboxes.filter((box) => box.name === name);
      checkGroups.push(new InputCheckGroup(sameNameBoxes, { name }));
    }

    return checkGroups;
  },

  InputRadioGroup(elements) {
    const radios = Array.from(elements).filter(isRadio) as HTMLInputElement[];

    const radioGroups: InputRadioGroup[] = [];

    for (const name of radios.map((radio) => radio.name)) {
      const sameNameRadios = radios.filter((radio) => radio.name === name);
      radioGroups.push(new InputRadioGroup(sameNameRadios, { name }));
    }

    return radioGroups;
  },

  InputSelect(elements) {
    const inputs = Array.from(elements).filter(isSelect) as HTMLSelectElement[];
    return inputs.map((input) => new InputSelect(input, { name: input.name }));
  },

  InputTextbox(elements) {
    const inputs = Array.from(elements).filter(isTextbox) as HTMLInputElement[];
    return inputs.map((input) => new InputTextbox(input, { name: input.name }));
  },
};
