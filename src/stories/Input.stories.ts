import { StoryFn, Meta } from "@storybook/html";
import { Textbox } from "../components";

export default {} as Meta;

export const Example: StoryFn = (): HTMLElement => {
  const container = document.createElement("div");

  container.innerHTML = /* html */ `
    <p>The input below has no form attached to it.</p>

    <label>
      <div>Email</div>
      <input name="email" type="email" autocomplete="off" required required-message="Very important field ahead." />
    </label>

    <button id="report-btn">Report Validity</button>
  `;

  const textbox = new Textbox(container.querySelector("[name=email]") as HTMLInputElement, {
    validationMessage: 'Please use a valid email.',
  });

  const reportButton = container.querySelector('#report-btn') as HTMLButtonElement;

  reportButton.addEventListener('click', () => {
    textbox.reportValidity();
  })
  
  return container;
};
