import { StoryFn, Meta } from "@storybook/html";
import { Form, CheckboxGroup, Textbox } from "../components";
import { Select } from "../components/Select/Select";

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
        <div>Animal</div>
        <select name="animal" required>
          <option value="">Select...</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>        
        </select>
      </label>

      <fieldset id="colors">
        <legend>Colors</legend>
        <label>
          <input type="checkbox" name="colors" value="red" required />
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

      <button type="submit">Submit</button>
    </form>
  `;

  const textbox = new Textbox(
    container.querySelector("[name=email]") as HTMLInputElement,
    {
      validationMessage: "Please use a valid email.",
    }
  );

  const colors = new CheckboxGroup(
    container.querySelector("#colors") as HTMLElement,
    {
      validationMessage: "Please select a color.",
    }
  );

  const animal = new Select(
    container.querySelector("[name=animal]") as HTMLSelectElement,
    {
      validationMessage: "Please select an animal.",
    }
  );

  const form = new Form(container.querySelector("form") as HTMLFormElement, {
    async onSubmit(form) {
      console.log("submit", form.values);
    },
  });

  form.append(textbox, animal, colors);

  return container;
};
