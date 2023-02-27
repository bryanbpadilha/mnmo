import { StoryFn, Meta } from "@storybook/html";
import { Checkbox } from "../components";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <p>The input below has no form attached to it.</p>

    <p>
      <label>
        <input type="checkbox" name="terms" />
        <span>Terms and conditions.</span>
      </label>
    </p>

    <button id="report-btn">Report Validity</button>
  `;

  const checkbox = new Checkbox(container.querySelector("[name=terms]") as HTMLInputElement, {
    required: true,
    validationMessage: 'Bla bla required'
  });

  const reportButton = container.querySelector('#report-btn') as HTMLButtonElement;

  reportButton.addEventListener('click', () => {
    checkbox.reportValidity();

    if (checkbox.validity.valid) {
      console.log(checkbox.value);
    }
  })

  return container;
};
