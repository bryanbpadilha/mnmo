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
    memInput: HTMLInputElement;
    pendingSelected: HTMLElement | null;
    config?: IComboboxConfig;
    private _value: string;

    // Bound handlers for cleanup
    private boundHandleSearchInvalid: (e: Event) => void;
    private boundHandleTriggerClick: (e: MouseEvent) => void;
    private boundHandleTriggerKeydown: (e: KeyboardEvent) => void;
    private boundHandleSearchInput: (e: Event) => void;
    private boundHandleSearchKeydown: (e: KeyboardEvent) => void;
    private boundHandleListboxClick: (e: MouseEvent) => void;

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
            onSelect: (listbox) => {
                this.pendingSelected = listbox.selected;
            },
        });

        this.pendingSelected = this.listbox.selected ?? null;

        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        this.search.setAttribute("aria-expanded", "true");
        // Super constraints sync
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

        // Initialize Bound Handlers
        this.boundHandleSearchInvalid = (event) => this.handleInvalid(event);
        this.boundHandleTriggerClick = () => this.popover.toggle();
        this.boundHandleTriggerKeydown = (e) => this.handleTriggerKeydown(e);
        this.boundHandleSearchInput = () => this.applyFilter(this.search.value);
        this.boundHandleSearchKeydown = (e) => this.handleSearchKeydown(e);
        this.boundHandleListboxClick = (e) => this.handleListboxClick(e);

        // Attach Listeners
        this.search.addEventListener("invalid", this.boundHandleSearchInvalid);
        this.trigger.addEventListener("click", this.boundHandleTriggerClick);
        this.trigger.addEventListener(
            "keydown",
            this.boundHandleTriggerKeydown
        );
        this.search.addEventListener("input", this.boundHandleSearchInput);
        this.search.addEventListener("keydown", this.boundHandleSearchKeydown);
        this.listbox.element.addEventListener(
            "click",
            this.boundHandleListboxClick
        );

        if (this.listbox.selected) {
            this.updateValueFromSelected();
        }
    }

    destroy() {
        // Remove Listeners
        this.search.removeEventListener(
            "invalid",
            this.boundHandleSearchInvalid
        );
        this.trigger.removeEventListener("click", this.boundHandleTriggerClick);
        this.trigger.removeEventListener(
            "keydown",
            this.boundHandleTriggerKeydown
        );
        this.search.removeEventListener("input", this.boundHandleSearchInput);
        this.search.removeEventListener(
            "keydown",
            this.boundHandleSearchKeydown
        );
        this.listbox.element.removeEventListener(
            "click",
            this.boundHandleListboxClick
        );

        // Cleanup Helper Classes
        // (Assuming Popover/Listbox have destroy methods, if not, at least we removed our listeners)
        // if (this.popover.destroy) this.popover.destroy();

        // Reset DOM attributes modified by this class
        this.trigger.removeAttribute("aria-haspopup");
        this.trigger.removeAttribute("aria-expanded");
        this.search.removeAttribute("aria-expanded");

        super.destroy();
    }

    // --- Extracted Handlers ---

    private handleTriggerKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case "Enter":
            case " ":
            case "ArrowDown":
            case "ArrowUp":
                e.preventDefault();
                this.popover.show();
                break;
        }
    }

    private handleSearchKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowDown":
            case "ArrowUp":
                e.preventDefault();
                this.listbox.checkKeyDown(e);
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
    }

    private handleListboxClick(e: MouseEvent) {
        const option = (e.target as HTMLElement).closest(
            '[role="option"]'
        ) as HTMLElement | null;
        if (option) {
            this.listbox.selected = option;
            this.pendingSelected = option;
            this.commitSelection();
        }
    }

    // --- Existing Logic ---

    private getVisibleOptions() {
        return Array.from(
            this.listbox.element.querySelectorAll(
                '[role="option"]:not([hidden])'
            ) as unknown as HTMLElement[]
        );
    }

    private applyFilter(query: string) {
        // ... (Existing implementation from your provided code)
        const normalized = query.trim().toLowerCase();
        const root = this.listbox.element;
        const allOptions = Array.from(
            root.querySelectorAll('[role="option"]')
        ) as HTMLElement[];
        const allGroups = Array.from(
            root.querySelectorAll('[role="group"]')
        ) as HTMLElement[];

        // If query is empty, show everything
        if (normalized.length === 0) {
            for (const group of allGroups) group.removeAttribute("hidden");
            for (const option of allOptions) option.removeAttribute("hidden");
            this.listbox.options = this.getVisibleOptions();
            if (
                this.listbox.selected &&
                this.listbox.selected.hasAttribute("hidden")
            ) {
                this.listbox.selected = null;
            }
            return;
        }

        const visibleOptions = new Set<HTMLElement>();

        const optionMatches = (option: HTMLElement) => {
            const custom = this.config?.filter?.(option, query);
            if (custom !== undefined && custom !== null) return custom;
            const text = option.textContent?.toLowerCase() ?? "";
            return text.includes(normalized);
        };

        const getGroupLabel = (group: HTMLElement) => {
            // ... (Existing logic)
            let label = "";
            const labelledby = group.getAttribute("aria-labelledby");
            if (labelledby) {
                for (const id of labelledby.split(/\s+/)) {
                    const el = document.getElementById(id);
                    if (el?.textContent) label += el.textContent + " ";
                }
            }
            const ariaLabel = group.getAttribute("aria-label");
            if (ariaLabel) label += ariaLabel + " ";
            const heading = group.querySelector(
                "[role='heading'], h1, h2, h3, h4, h5, h6"
            ) as HTMLElement | null;
            if (heading?.textContent) label += heading.textContent + " ";
            return label.trim().toLowerCase();
        };

        // Group Matching
        for (const group of allGroups) {
            const label = getGroupLabel(group);
            if (label && label.includes(normalized)) {
                const subOptions = Array.from(
                    group.querySelectorAll('[role="option"]')
                ) as HTMLElement[];
                subOptions.forEach((o) => visibleOptions.add(o));
            }
        }

        // Option Matching
        for (const option of allOptions) {
            if (optionMatches(option)) visibleOptions.add(option);
        }

        // Apply visibility
        for (const option of allOptions) {
            visibleOptions.has(option)
                ? option.removeAttribute("hidden")
                : option.setAttribute("hidden", "true");
        }
        for (const group of allGroups) {
            const hasVisibleOption = Array.from(
                group.querySelectorAll('[role="option"]')
            ).some((o) => !o.hasAttribute("hidden"));
            hasVisibleOption
                ? group.removeAttribute("hidden")
                : group.setAttribute("hidden", "true");
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
            this.triggerLabelElement.textContent = label;
        }

        this.validate();
    }

    private resetListboxState() {
        this.search.value = "";
        const allOptions = Array.from(
            this.listbox.element.querySelectorAll('[role="option"]')
        ) as HTMLElement[];
        const allGroups = Array.from(
            this.listbox.element.querySelectorAll('[role="group"]')
        ) as HTMLElement[];

        for (const group of allGroups) group.removeAttribute("hidden");
        for (const option of allOptions) option.removeAttribute("hidden");

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

    syncConstraints() {
        this.memInput.removeAttribute("required");
        this.memInput.removeAttribute("required-message");
        this.memInput.removeAttribute("validation-message");

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

    validate() {
        this.memInput.value = this._value ?? "";
        super.validate();
    }

    get triggerLabelElement() {
        if (this.trigger.hasAttribute("aria-labelledby")) {
            return (
                document.getElementById(
                    this.trigger.getAttribute("aria-labelledby") as string
                ) ?? this.trigger
            );
        }

        return this.trigger;
    }

    get elements() {
        return [this.memInput];
    }

    get value() {
        return this._value;
    }
}
