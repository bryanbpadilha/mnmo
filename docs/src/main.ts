import "./styles.css";
import { initTextboxDemo } from "./demos/textbox";
import { initComboboxDemo } from "./demos/combobox";
import { initFormDemo } from "./demos/form";
import { initMasterFormDemo } from "./demos/masterform";
import { initTabsDemo } from "./demos/tabs";
import { initListboxDemo } from "./demos/listbox";

document.addEventListener("DOMContentLoaded", () => {
    initTextboxDemo();
    initComboboxDemo();
    initMasterFormDemo();
    initFormDemo();
    initTabsDemo();
    initListboxDemo();
});
