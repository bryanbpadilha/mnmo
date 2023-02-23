import { StoryFn, Meta } from "@storybook/html";
import { Form, RadioGroup, Textbox } from "../components";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <form>
      <label>
        <div>Email</div>
        <input name="email" type="email" required />
      </label>

      <fieldset id="colors">
        <legend>Colors</legend>
        <label>
          <input type="radio" name="colors" value="red" required />
          <span>Red</span>
        </label>
        <label>
          <input type="radio" name="colors" value="green" required />
          <span>Green</span>
        </label>
        <label>
          <input type="radio" name="colors" value="blue" required />
          <span>Blue</span>
        </label>
      </fieldset>

      <button type="submit">Submit</button>
    </form>
  `;

  const textbox = new Textbox(
    container.querySelector("[name=email]") as HTMLInputElement,
    {
      validationMessage: "Please use a valid email.",
    }
  );

  const colors = new RadioGroup(
    container.querySelector("#colors") as HTMLElement,
    {
      validationMessage: "Please select a color.",
    }
  );

  const form = new Form(container.querySelector("form") as HTMLFormElement, {
    async onSubmit(form) {
      console.log("submit", form.values);
    },
  });

  form.append(textbox, colors);

  return container;
};
