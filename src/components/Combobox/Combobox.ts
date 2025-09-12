import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
import { Listbox } from "../Listbox";
import { IPopoverConfig, Popover } from "../Popover";

export interface IComboboxConfig {
    onChange?: TInputEvent<Combobox>;
    onInvalid?: TInputEvent<Combobox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
    onOpen?: (combobox: Combobox) => void | Promise<void>;
    onClose?: (combobox: Combobox) => void | Promise<void>;
    filter?: (option: HTMLElement, query: string) => boolean;
    popover?: Partial<Pick<IPopoverConfig, "offset" | "placement">>;
}

export class Combobox extends Input {
    trigger: HTMLElement;
    dialog: HTMLElement;
    search: HTMLInputElement;
    listbox: Listbox;
    popover: Popover;
    memInput: HTMLInputElement; // In-memory input used only for validity/constraints integration
    pendingSelected: HTMLElement | null;
    config?: IComboboxConfig;
    private _value: string;

    constructor(trigger: TSelector<HTMLElement>, config?: IComboboxConfig) {
        super({
            supportedConstraints: ["required"],
        });

        this.trigger = selectElement(trigger, HTMLElement);
        this.config = config;
        this._value = "";

        const popoverId = this.trigger.getAttribute("aria-controls");
        if (!popoverId) {
            throw new Error(
                "Combobox trigger must have aria-controls referencing the popover/dialog element id."
            );
        }

        this.dialog = selectElement<HTMLElement>("#" + popoverId, HTMLElement);

        this.search = selectElement<HTMLInputElement>(
            'input[role="combobox"]',
            HTMLInputElement,
            this.dialog
        );

        const derivedName =
            (this.trigger as HTMLButtonElement).name ||
            this.trigger.getAttribute("name") ||
            this.trigger.getAttribute("id") ||
            uid("combobox");

        // Create in-memory input for validity handling and Form integration (not attached to DOM)
        this.memInput = document.createElement("input");
        this.memInput.type = "text";
        this.memInput.name = derivedName;

        const listboxId = this.search.getAttribute("aria-controls");
        const listboxEl = listboxId
            ? selectElement<HTMLElement>("#" + listboxId, HTMLElement)
            : selectElement<HTMLElement>(
                  '[role="listbox"]',
                  HTMLElement,
                  this.dialog
              );

        this.listbox = new Listbox(listboxEl, {
            onSelect: () => {
                this.pendingSelected = this.listbox.selected;
            },
        });

        this.pendingSelected = this.listbox.selected ?? null;

        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        this.search.setAttribute("aria-expanded", "true");
        this.syncConstraints();

        this.popover = new Popover(this.trigger, this.dialog, {
            open: false,
            onOpen: async () => {
                this.trigger.setAttribute("aria-expanded", "true");
                queueMicrotask(() => this.search.focus());
                if (this.config?.onOpen) await this.config.onOpen(this);
            },
            onClose: async () => {
                this.trigger.setAttribute("aria-expanded", "false");
                this.resetListboxState();
                if (this.config?.onClose) await this.config.onClose(this);
            },
            ...config?.popover,
        });

        this.search.addEventListener("invalid", (event) => {
            this.handleInvalid(event);
        });

        this.trigger.addEventListener("click", () => {
            this.popover.toggle();
        });

        this.trigger.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "Enter":
                case " ":
                case "ArrowDown":
                case "ArrowUp":
                    e.preventDefault();
                    this.popover.show();
                    break;
            }
        });

        this.search.addEventListener("input", () => {
            this.applyFilter(this.search.value);
        });

        this.search.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowDown":
                case "ArrowUp":
                    e.preventDefault();
                    this.listbox.checkKeyDown(e as KeyboardEvent);
                    break;
                case "Enter":
                    e.preventDefault();
                    if (!this.listbox.selected) {
                        const firstVisible = this.getVisibleOptions()[0];
                        if (firstVisible) {
                            this.listbox.selected = firstVisible;
                            this.pendingSelected = firstVisible;
                        }
                    }
                    this.commitSelection();
                    break;
                case "Escape":
                    e.preventDefault();
                    this.popover.hide();
                    this.trigger.focus();
                    break;
            }
        });

        this.listbox.element.addEventListener("click", (e) => {
            const option = (e.target as HTMLElement).closest(
                '[role="option"]'
            ) as HTMLElement | null;
            if (option) {
                this.listbox.selected = option;
                this.pendingSelected = option;
                this.commitSelection();
            }
        });

        if (this.listbox.selected) {
            this.updateValueFromSelected();
        }
    }

    private getVisibleOptions() {
        return Array.from(
            this.listbox.element.querySelectorAll(
                '[role="option"]:not([hidden])'
            ) as unknown as HTMLElement[]
        );
    }

    private applyFilter(query: string) {
        const normalized = query.trim().toLowerCase();
        const allOptions = Array.from(
            this.listbox.element.querySelectorAll('[role="option"]')
        ) as HTMLElement[];

        for (const option of allOptions) {
            const shouldShow =
                this.config?.filter?.(option, query) ??
                option.textContent?.toLowerCase().includes(normalized) ??
                false;

            if (normalized.length === 0 || shouldShow) {
                option.removeAttribute("hidden");
            } else {
                option.setAttribute("hidden", "true");
            }
        }

        this.listbox.options = this.getVisibleOptions();

        if (
            this.listbox.selected &&
            this.listbox.selected.hasAttribute("hidden")
        ) {
            this.listbox.selected = null;
        }
    }

    private commitSelection() {
        this.updateValueFromSelected();
        this.handleChange(new Event("change"));
    }

    private updateValueFromSelected() {
        const value = this.listbox.value ?? "";
        const label =
            this.listbox.selected?.getAttribute("label") ??
            this.listbox.selected?.textContent ??
            String(value);

        this._value = String(value);

        if (label) {
            this.trigger.textContent = label;
        }

        this.validate();
    }

    private resetListboxState() {
        this.search.value = "";
        const allOptions = Array.from(
            this.listbox.element.querySelectorAll('[role="option"]')
        ) as HTMLElement[];

        for (const option of allOptions) {
            option.removeAttribute("hidden");
        }

        this.listbox.options = allOptions;

        const committed = this._value;
        if (committed) {
            const match = allOptions.find(
                (o) => (o.getAttribute("value") ?? o.textContent) === committed
            );
            this.listbox.selected = match ?? null;
        } else {
            this.listbox.selected = null;
        }

        this.pendingSelected = this.listbox.selected;
    }

    // Apply constraints/messages to the in-memory input (not the search field)
    syncConstraints() {
        // Clear existing attributes
        this.memInput.removeAttribute("required");
        this.memInput.removeAttribute("required-message");
        this.memInput.removeAttribute("validation-message");

        // Determine "required" from config or trigger attribute
        let required = false;
        let requiredMessage: string | undefined;

        const req = this.config?.required;
        if (req) {
            if (typeof req === "object") {
                required = !!req.value;
                requiredMessage = req.message;
            } else {
                required = true;
            }
        } else if (this.trigger.hasAttribute("required")) {
            required = true;
        }

        if (required) this.memInput.setAttribute("required", "true");
        if (requiredMessage)
            this.memInput.setAttribute("required-message", requiredMessage);
        if (this.config?.validationMessage) {
            this.memInput.setAttribute(
                "validation-message",
                this.config.validationMessage
            );
        }
    }

    // Validate using the committed value mirrored into the in-memory input
    validate() {
        this.memInput.value = this._value ?? "";
        super.validate();
    }

    get elements() {
        // Bind validity/constraints to the in-memory input
        return [this.memInput];
    }

    get value() {
        return this._value;
    }
}
