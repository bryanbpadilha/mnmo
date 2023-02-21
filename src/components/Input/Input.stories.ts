import { StoryFn, Meta } from "@storybook/html";
import { InputTextbox } from "../InputTextbox";
import { Constraint, InputMapper } from "../../lib";
import { Form } from "../Form";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <form>
      <label>
        <span>Test</span>
        <input name="test" />
      </label> 
    </form>
  `;

  const inputElement = container.querySelector<HTMLInputElement>("[name='test']");

  const formElement = container.querySelector<HTMLFormElement>('form');

  if (!formElement) throw new Error('Form element not found');

  if (!inputElement) throw new Error('Input element not found');

  new Form(formElement, {
    inputMapper: new InputMapper({
      constraint: {
        test: new Constraint().required('This field is required')
      },
    }),

    async onSubmit(form) {
      console.log(form)
    },

    onInvalid(form) {
      console.log(form)
    }
  })
  
  return container;
};
