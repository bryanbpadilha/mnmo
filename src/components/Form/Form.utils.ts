import { Form, IFormProps } from "./Form";
import { InputCheckGroup, InputRadioGroup, InputTextbox } from "..";

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

const isRadio = (element: Element) => {
  return (element as HTMLInputElement).type === "radio";
};

const isCheck = (element: Element) => {
  return (element as HTMLInputElement).type === "checkbox";
};

export const createInputs = (form: Form, validator: IFormProps['validator']) => {
  const textboxes: HTMLInputElement[] = [];
  const radioGroups: { [key: string]: HTMLInputElement[] } = {};
  const checkGroups: { [key: string]: HTMLInputElement[] } = {};

  for (const element of form.element.elements) {
    if (isTextbox(element)) {
      textboxes.push(element as HTMLInputElement);
    }

    if (isRadio(element)) {
      const radio = element as HTMLInputElement;
      radioGroups[radio.name] = [...(radioGroups[radio.name] ?? []), radio];
    }

    if (isCheck(element)) {
      const box = element as HTMLInputElement;
      checkGroups[box.name] = [...(checkGroups[box.name] ?? []), box];
    }
  }

  textboxes.forEach((textbox) => {
    const input = new InputTextbox(textbox, {
      name: textbox.name,
      validator: validator && validator[textbox.name],
    });

    form.append(input);
  });

  Object.keys(radioGroups).forEach((name) => {
    const radioGroup = new InputRadioGroup(radioGroups[name], {
      name,
      validator: validator && validator[name],
    });

    form.append(radioGroup);
  });

  Object.keys(checkGroups).forEach((name) => {
    const checkGroup = new InputCheckGroup(checkGroups[name], {
      name,
      validator: validator && validator[name],
    });

    form.append(checkGroup);
  });
};
