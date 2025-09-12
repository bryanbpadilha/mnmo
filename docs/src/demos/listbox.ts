import { Listbox } from "../mnmo";

export function initListboxDemo() {
    const element = document.querySelector(
        "#demo-listbox"
    ) as HTMLElement | null;
    if (!element) return;
    new Listbox(element);
}
