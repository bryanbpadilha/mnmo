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
    const boxes = Array.from(elements).filter(isCheck) as HTMLInputElement[];
    const groupedBoxes: HTMLInputElement[][] = [];

    for (const name of boxes.map((box) => box.name)) {
      const sameNameBoxes = boxes.filter((box) => box.name === name);
      groupedBoxes.push(sameNameBoxes);
    }

    return groupedBoxes;
  },

  InputRadioGroup(elements) {
    const radios = Array.from(elements).filter(isRadio) as HTMLInputElement[];
    const radioGroups: HTMLInputElement[][] = [];

    for (const name of radios.map((radio) => radio.name)) {
      const sameNameRadios = radios.filter((radio) => radio.name === name);
      radioGroups.push(sameNameRadios);
    }

    return radioGroups;
  },

  InputSelect(elements) {
    return Array.from(elements).filter(isSelect) as HTMLSelectElement[];
  },

  InputTextbox(elements) {
    return Array.from(elements).filter(isTextbox) as HTMLInputElement[];
  },
};
