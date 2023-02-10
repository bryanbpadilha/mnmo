import { StoryFn, Meta } from "@storybook/html";
import { Form } from "./Form";
import { Validator } from "../../lib";
import { InputTextbox } from "../InputTextbox";
import { InputMapper } from "../../lib/InputMapper/InputMapper";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <form id="example-form">
      <div class="grid">
        <label>
          <div>Name</div>
          <input type="text" name="name" />
        </label>

        <label>
          <div>Email</div>
          <input type="email" name="email" />
        </label>
      </div>

      <div class="grid">
        <label>
          <div>Pet</div>
          <select name="pet">
            <option value="">Select...</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="hamster">Hamster</option>
            <option value="parrot">Parrot</option>
            <option value="spider">Spider</option>
            <option value="goldfish">Goldfish</option>
          </select>
        </label>

        <label>
          <div>Date</div>
          <input type="date" name="date" />
        </label>
      </div>

      <div class="grid">
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

        <fieldset>
          <legend>Yes or no?</legend>

          <label>
            <input type="radio" name="yesOrNo" value="yes" />
            <span>Yes</span>
          </label>

          <label>
            <input type="radio" name="yesOrNo" value="no" />
            <span>No</span>
          </label>
        </fieldset>
      </div>

      <button type="submit">Submit</button>
    </form>
  `;

  const formElement = container.querySelector<HTMLFormElement>("#example-form");

  if (!formElement) throw new Error("Form element not found.");

  const form = new Form(formElement, {
    async onSubmit(form) {
      alert(JSON.stringify(form.data, null, 2));
    },

    onInvalid(form) {
      console.log(form.errors);
    },
    
    inputMapper: new InputMapper(),

    validator: {
      name: new Validator().required("This field is required."),
      email: new Validator()
        .required("This field is required.")
        .email("Please use a valid email."),
      date: new Validator().required("This field is required."),
      pet: new Validator().required("This field is required."),
      yesOrNo: new Validator().required("This field is required."),
      colors: new Validator().required("This field is required."),
    },
  });

  console.log(form);

  return container;
};
