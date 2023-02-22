import { StoryFn, Meta } from "@storybook/html";
import { Form, Textbox } from "../components";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <form>
      <label>
        <div>Email</div>
        <input name="email" type="email" required />
      </label>

      <label>
        <div>Images</div>
        <input name="images" type="file" multiple required />
      </label>

      <fieldset>
        <legend>Colors</legend>
        <label>
          <input type="checkbox" name="colors" value="red" />
          <span>Red</span>
        </label>
        <label>
          <input type="checkbox" name="colors" value="green" />
          <span>Green</span>
        </label>
        <label>
          <input type="checkbox" name="colors" value="blue" />
          <span>Blue</span>
        </label>
      </fieldset>

      <p>
        <label>
          <input type="radio" name="terms" required />
          <span>Terms of Condition</span>
        </label>
      </p>

      <button type="submit">Submit</button>
    </form>
  `;

  const textbox = new Textbox(
    container.querySelector("[name=email]") as HTMLInputElement,
    {
      validationMessage: "Please use a valid email.",
    }
  );

  const form = new Form(container.querySelector("form") as HTMLFormElement, {
    async onSubmit(form) {
      console.log("submit", form.values);
    },
  });

  return container;
};
