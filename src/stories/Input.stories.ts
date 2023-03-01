import { StoryFn, Meta } from "@storybook/html";
import { Form, Textbox } from "../components";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <form>
      <label>
        <div>Phone</div>
        <input name="phone" type="tel" placeholder="(999) 999 - 9999" autocomplete="off" />
      </label>

      <button type="submit">Submit</button>
    </form>
  `;

  const textbox = new Textbox(container.querySelector("[name=phone]") as HTMLInputElement, {
    required: true,
    pattern: '[\\(]\\d{3}[\\)] \\d{3} [\\-] \\d{4}',
    mask: '(999) 999 - 9999',
  });

  new Form(container.querySelector('form') as HTMLFormElement, {
    async onSubmit(form) {
      console.log(form);
    }
  });
  
  return container;
};
