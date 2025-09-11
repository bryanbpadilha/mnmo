import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";
import {
    Input,
    TInputConstraintEntry,
    TInputDynamicValidity,
    TInputEvent,
} from "../Input";
import { Listbox } from "../Listbox";
import { Popover } from "../Popover";

export interface IComboboxConfig {
    onChange?: TInputEvent<Combobox>;
    onInvalid?: TInputEvent<Combobox>;
    // Constraints
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
    // Behavior
    onOpen?: (combobox: Combobox) => void | Promise<void>;
    onClose?: (combobox: Combobox) => void | Promise<void>;
    filter?: (option: HTMLElement, query: string) => boolean;
}

export class Combobox extends Input {
    // Trigger button that shows current value
    trigger: HTMLElement;
    // Dialog container (popover content)
    dialog: HTMLElement;
    // Search input inside dialog
    search: HTMLInputElement;
    // Listbox container
    listbox: Listbox;
    // Popover instance for positioning and open/close logic
    popover: Popover;
    // Hidden input used for form integration and validation
    hiddenInput: HTMLInputElement;

    // Pending selection (not yet committed)
    pendingSelected: HTMLElement | null;

    config?: IComboboxConfig;

    constructor(trigger: TSelector<HTMLElement>, config?: IComboboxConfig) {
        super({
            supportedConstraints: ["required"],
        });

        this.trigger = selectElement(trigger, HTMLElement);
        this.config = config;

        // Locate popover/dialog via aria-controls on trigger
        const popoverId = this.trigger.getAttribute("aria-controls");
        if (!popoverId) {
            throw new Error(
                "Combobox trigger must have aria-controls referencing the popover/dialog element id."
            );
        }

        this.dialog = selectElement<HTMLElement>("#" + popoverId, HTMLElement);

        // Find search input inside the dialog
        this.search = selectElement<HTMLInputElement>(
            'input[role="combobox"]',
            HTMLInputElement,
            this.dialog
        );

        // Find listbox via search aria-controls or first [role=listbox]
        const listboxId = this.search.getAttribute("aria-controls");
        const listboxEl = listboxId
            ? selectElement<HTMLElement>("#" + listboxId, HTMLElement)
            : selectElement<HTMLElement>(
                  '[role="listbox"]',
                  HTMLElement,
                  this.dialog
              );

        // Initialize Listbox
        this.listbox = new Listbox(listboxEl, {
            onSelect: () => {
                // Only hold selection in memory; do not commit yet
                this.pendingSelected = this.listbox.selected;
            },
        });

        // Commit on option click
        this.listbox.element.addEventListener("click", (e) => {
            const option = (e.target as HTMLElement).closest(
                '[role="option"]'
            ) as HTMLElement | null;
            if (option) {
                // Ensure listbox and pending reflect the clicked option
                this.listbox.selected = option;
                this.pendingSelected = option;
                this.commitSelection();
            }
        });

        // Initialize pending selection
        this.pendingSelected = this.listbox.selected;

        // Hidden input for form value and validity
        this.hiddenInput = this.ensureHiddenInput();

        // Sync constraints onto hidden input
        this.syncConstraints();

        // Accessibility states
        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        // The search is always expanded within the dialog list context
        this.search.setAttribute("aria-expanded", "true");

        // Initialize Popover
        this.popover = new Popover(this.trigger, this.dialog, {
            open: false,
            onOpen: async () => {
                this.trigger.setAttribute("aria-expanded", "true");
                // Focus the search field when opened
                queueMicrotask(() => this.search.focus());
                if (this.config?.onOpen) await this.config.onOpen(this);
            },
            onClose: async () => {
                this.trigger.setAttribute("aria-expanded", "false");
                this.resetListboxState();
                if (this.config?.onClose) await this.config.onClose(this);
            },
        });

        // Wire events
        this.hiddenInput.addEventListener("invalid", (event) => {
            this.handleInvalid(event);
        });

        // Toggle on trigger click
        this.trigger.addEventListener("click", () => {
            this.popover.toggle();
        });

        // Basic keyboard support on trigger
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

        // Search/filter behavior
        this.search.addEventListener("input", () => {
            this.applyFilter(this.search.value);
        });

        this.search.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowDown":
                case "ArrowUp":
                    // Delegate navigation to listbox
                    e.preventDefault();
                    this.listbox.checkKeyDown(e as KeyboardEvent);
                    break;
                case "Enter":
                    e.preventDefault();
                    // Commit current selection or first visible
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

        // Initialize from pre-selected option (if any)
        if (this.listbox.selected) {
            this.updateValueFromSelected();
        } else {
            // Initialize trigger label if value present on hidden input
            if (this.hiddenInput.value) {
                this.trigger.textContent = this.hiddenInput.value;
            }
        }
    }

    private ensureHiddenInput() {
        // Try to find an existing hidden input immediately following the trigger
        let hidden = this.trigger.nextElementSibling as HTMLInputElement | null;
        if (!hidden || hidden.tagName !== "INPUT" || hidden.type !== "hidden") {
            hidden = document.createElement("input");
            hidden.type = "hidden";
            // Derive name from trigger@name if present, otherwise from id, or generate
            const name =
                (this.trigger as HTMLButtonElement).name ||
                this.trigger.getAttribute("name") ||
                this.trigger.getAttribute("id") ||
                uid("combobox");
            hidden.name = name;
            this.trigger.insertAdjacentElement("afterend", hidden);
        }
        return hidden;
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

        // Refresh the listbox.options to include only visible options for keyboard nav
        this.listbox.options = this.getVisibleOptions();

        // If current selected is hidden after filter, clear selection
        if (
            this.listbox.selected &&
            this.listbox.selected.hasAttribute("hidden")
        ) {
            this.listbox.selected = null;
        }
    }

    private commitSelection() {
        this.updateValueFromSelected();
        // Emit a change event for Input semantics
        this.handleChange(new Event("change"));
    }

    private updateValueFromSelected() {
        const value = this.listbox.value ?? "";
        const label =
            this.listbox.selected?.getAttribute("label") ??
            this.listbox.selected?.textContent ??
            String(value);

        this.hiddenInput.value = String(value);
        // Update button text to show current selection
        if (label) {
            this.trigger.textContent = label;
        }
    }

    // Input API integration

    get elements() {
        return [this.hiddenInput];
    }

    get value() {
        return this.hiddenInput.value;
    }

    private resetListboxState() {
        // Clear search and remove filters
        this.search.value = "";
        const allOptions = Array.from(
            this.listbox.element.querySelectorAll('[role="option"]')
        ) as HTMLElement[];

        for (const option of allOptions) {
            option.removeAttribute("hidden");
        }

        // Refresh options set
        this.listbox.options = allOptions;

        // Select the committed value, if any
        const committed = this.hiddenInput.value;
        if (committed) {
            const match = allOptions.find(
                (o) => (o.getAttribute("value") ?? o.textContent) === committed
            );
            this.listbox.selected = match ?? null;
        } else {
            this.listbox.selected = null;
        }

        // Reset pending to current selected
        this.pendingSelected = this.listbox.selected;
    }
}
