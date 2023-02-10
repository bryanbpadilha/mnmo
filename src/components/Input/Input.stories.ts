import { StoryFn, Meta } from "@storybook/html";
import { Input } from "./Input";
import { Validator } from "../../lib";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <label>
      <span>Test</span>
      <input type="text" name="test" />
    </label> 
  `;

  const input = new Input({
    name: "test",

    validator: new Validator().required("This field is required."),

    onInvalid(input) {
      console.log(`Error on input [${input.name}]: ${input.error}`);
    },

    onChange(input) {
      console.log(input.value);
    },
  });

  const inputElement = container.querySelector<HTMLInputElement>("[name='test']");

  inputElement?.addEventListener("input", () => {
    input.value = inputElement.value;
  });

  return container;
};
