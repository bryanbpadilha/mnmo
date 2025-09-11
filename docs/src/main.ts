import "./styles.css";
import { initTextboxDemo } from "./demos/textbox";
import { initFormDemo } from "./demos/form";
import { initTabsDemo } from "./demos/tabs";

document.addEventListener("DOMContentLoaded", () => {
    initTextboxDemo();
    initFormDemo();
    initTabsDemo();
});
