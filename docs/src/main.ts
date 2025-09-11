import "./styles.css";
import { initTextboxDemo } from "./demos/textbox";
import { initComboboxDemo } from "./demos/combobox";
import { initFormDemo } from "./demos/form";
import { initTabsDemo } from "./demos/tabs";

document.addEventListener("DOMContentLoaded", () => {
    initTextboxDemo();
    initComboboxDemo();
    initFormDemo();
    initTabsDemo();
});
