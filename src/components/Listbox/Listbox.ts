import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";

interface IListboxConfig {
    onSelect?: (listbox: Listbox) => void | Promise<void>;
}

export class Listbox {
    element: HTMLElement;
    config?: IListboxConfig;
    options: HTMLElement[];
    _selected: HTMLElement | null;

    constructor(element: TSelector<HTMLElement>, config?: IListboxConfig) {
        this.element = selectElement(element, HTMLElement);
        this.config = config;
        this.element.setAttribute("tabindex", "0");

        this.options = Array.from(
            this.element.querySelectorAll("[role=option]")
        ) as HTMLElement[];

        for (const option of this.options) {
            option.id = uid("listboxitem");
            option.addEventListener("click", () => (this.selected = option));
        }

        this._selected = null;
        this.selected =
            this.options?.filter(
                (option) => option.getAttribute("aria-selected") == "true"
            )[0] ?? null;

        this.element.addEventListener("keydown", this.checkKeyDown.bind(this));
    }

    get selected() {
        return this._selected;
    }

    set selected(selectedOption: HTMLElement | null) {
        if (!selectedOption) {
            this._selected = null;
            this.element.removeAttribute("aria-activedescendant");
            return;
        }

        for (const option of this.options) {
            if (option == selectedOption) {
                option.setAttribute("aria-selected", "true");
            } else {
                option.removeAttribute("aria-selected");
            }
        }

        this._selected = selectedOption;
        this.element.setAttribute(
            "aria-activedescendant",
            (this.selected as HTMLElement).id
        );

        if (this.config?.onSelect) {
            this.config.onSelect(this);
        }
    }

    get value() {
        if (!this.selected) return null;
        return this.selected.getAttribute("value") ?? this.selected.textContent;
    }

    checkKeyDown(event: KeyboardEvent) {
        let current;
        let next;
        let previous;

        if (this.selected) {
            current = this.options.indexOf(this.selected);
            next = current == this.options.length - 1 ? current : current + 1;
            previous = current == 0 ? current : current - 1;
        } else {
            next = 0;
            previous = 0;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                console.log("ArrowDown");
                this.selected = this.options[next];
                break;
            case "ArrowUp":
                event.preventDefault();
                console.log("ArrowUp");
                this.selected = this.options[previous];
                break;
        }
    }
}
