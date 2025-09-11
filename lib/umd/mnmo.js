(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mnmo = {}));
})(this, (function (exports) { 'use strict';

    const uid = (function () {
        let id = 0;
        const prefixed = {};
        return (prefix) => {
            if (!prefix)
                return "mnmo-" + id++ + "";
            if (prefixed[prefix] == undefined) {
                prefixed[prefix] = 0;
                return "mnmo-" + prefix + "-" + prefixed[prefix];
            }
            prefixed[prefix] = prefixed[prefix] + 1;
            return "mnmo-" + prefix + "-" + prefixed[prefix];
        };
    })();
    const selectElement = (selector, constructor, parent = document.body) => {
        const isInstanceOfConstructor = (element) => {
            if (!Array.isArray(constructor)) {
                return element instanceof constructor;
            }
            return constructor.filter((item) => element instanceof item).length > 0;
        };
        const element = isInstanceOfConstructor(selector)
            ? selector
            : parent.querySelector(selector);
        if (!element) {
            throw new Error(`Did not found an element "${selector}" inside of "${parent}". This will generally happen if you initialize a component with an improper element, or if the element markup does not have the required children elements.`);
        }
        if (!isInstanceOfConstructor(element)) {
            throw new Error(`The element "${element}" selected as "${selector}" inside of "${parent}" is not an instance of "${constructor}". This will generally happen if you initialize a compoment with an improper element, or if the element markup does not have the required children elements.`);
        }
        return element;
    };

    class Form {
        constructor(element, config) {
            this.element = selectElement(element, HTMLFormElement);
            this.config = config;
            this.isDirty = false;
            this.isSubmitted = false;
            this.element.addEventListener("input", (event) => {
                this.handleInput(event);
            });
            this.element.addEventListener("change", (event) => {
                this.handleChange(event);
            });
            this.element.addEventListener("submit", (event) => {
                this.handleSubmit(event);
            });
            this.element.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            }, true);
        }
        async emit(key, event) {
            if (this.config && this.config[key]) {
                if (typeof this.config[key] === "function") {
                    await this.config[key](this, event);
                }
            }
        }
        handleInput(event) {
            var _a;
            if (!this.isDirty)
                this.isDirty = true;
            (_a = this.inputs) === null || _a === void 0 ? void 0 : _a.forEach((input) => input.validate());
            this.emit("onInput", event);
        }
        handleChange(event) {
            if (!this.isDirty)
                this.isDirty = true;
            this.emit("onChange", event);
        }
        handleSubmit(event) {
            if (!this.isSubmitted)
                this.isSubmitted = true;
            this.emit("onSubmit", event);
        }
        handleInvalid(event) {
            if (!this.isSubmitted)
                this.isSubmitted = true;
            event.preventDefault();
            this.emit("onInvalid", event);
        }
        append(...inputs) {
            var _a, _b;
            for (const input of inputs.flat()) {
                if (input.form) {
                    throw new Error("An input can not be in two forms.");
                }
                input.form = this;
                this.inputs = (_b = (_a = this.inputs) === null || _a === void 0 ? void 0 : _a.concat(input)) !== null && _b !== void 0 ? _b : [input];
            }
        }
        getInput(name) {
            var _a;
            return (_a = this.inputs) === null || _a === void 0 ? void 0 : _a.filter((input) => input.name === name)[0];
        }
        getInputById(id) {
            var _a;
            return (_a = this.inputs) === null || _a === void 0 ? void 0 : _a.filter((input) => input.id === id)[0];
        }
        getInputByAttribute(key, value) {
            var _a;
            return (_a = this.inputs) === null || _a === void 0 ? void 0 : _a.filter((input) => input.getAttribute(key) === value)[0];
        }
        get errors() {
            var _a, _b, _c, _d;
            let errors = {};
            const invalidElements = Array.from(this.elements).filter((element) => !element.validity.valid);
            for (const input of invalidElements) {
                errors[(_b = (_a = input.name) !== null && _a !== void 0 ? _a : input.id) !== null && _b !== void 0 ? _b : uid("input")] =
                    input.validationMessage;
            }
            if (this.inputs) {
                for (const input of this.inputs) {
                    errors[(_d = (_c = input.name) !== null && _c !== void 0 ? _c : input.id) !== null && _d !== void 0 ? _d : uid("input")] = input.error;
                }
            }
            return errors;
        }
        get values() {
            let values = {};
            const inputs = Array.from(this.elements).filter((element) => element.name);
            for (const input of inputs) {
                const { name } = input;
                const isMultipleCheckbox = input.type == "checkbox" &&
                    inputs
                        .map((input) => input.name)
                        .filter((item) => item === name).length > 1;
                if (isMultipleCheckbox || input.multiple) {
                    values[name] = Array.from(this.data.getAll(name));
                }
                else {
                    values[name] = this.data.get(name);
                }
            }
            if (this.inputs) {
                for (const input of this.inputs) {
                    values[input.name] = input.value;
                }
            }
            return values;
        }
        get data() {
            return new FormData(this.element);
        }
        get elements() {
            return this.element.elements;
        }
        get isValid() {
            return Object.values(this.errors).every((error) => !error || error.length == 0);
        }
    }

    class Input {
        constructor(properties) {
            this.supportedConstraints = properties.supportedConstraints;
            this.isTouched = false;
            this.isValidated = false;
        }
        emit(key, event) {
            var _a;
            if (this.config && this.config[key]) {
                this.config[key](this, (_a = this.form) !== null && _a !== void 0 ? _a : undefined, event);
            }
        }
        handleChange(event) {
            this.isTouched = true;
            this.validate();
            this.emit("onChange", event);
        }
        handleInvalid(event) {
            this.validate();
            this.emit("onInvalid", event);
        }
        syncConstraintEntry(key) {
            if (this.config && this.config[key]) {
                const constraint = this.config[key];
                let constraintValue;
                let constraintMessage;
                if (typeof constraint === "object") {
                    constraintValue = constraint.value;
                    constraintMessage = constraint.message;
                }
                else {
                    constraintValue = this.config[key];
                }
                for (const element of this.elements) {
                    element.setAttribute(key, String(constraintValue));
                }
                if (constraintMessage) {
                    for (const element of this.elements) {
                        element.setAttribute(`${key}-message`, constraintMessage);
                    }
                }
            }
        }
        syncConstraints() {
            this.supportedConstraints.forEach((key) => this.syncConstraintEntry(key));
        }
        getDefaultValidationMessage() {
            var _a, _b;
            return ((_b = (_a = this.defaultValidationMessage) !== null && _a !== void 0 ? _a : this.elements[0].getAttribute("validation-message")) !== null && _b !== void 0 ? _b : this.elements[0].validationMessage);
        }
        getCustomValidationMessage(key) {
            const customMessage = this.elements[0].getAttribute(`${key}-message`);
            if (!key || !customMessage) {
                return this.getDefaultValidationMessage();
            }
            return customMessage;
        }
        validate() {
            this.isValidated = true;
            if (this.dynamicValidity && this.dynamicValidity.length > 0) {
                this.setCustomValidity(this.dynamicValidity);
            }
            else if (this.validityError) {
                const [errorName, constraint] = this.validityError;
                const message = this.getCustomValidationMessage(constraint);
                this.setCustomValidity(message);
            }
            else {
                this.setCustomValidity("");
            }
        }
        setCustomValidity(validity) {
            for (const element of this.elements) {
                element.setCustomValidity(validity);
            }
        }
        checkValidity() {
            this.validate();
            return this.elements.every((element) => element.checkValidity());
        }
        reportValidity() {
            this.validate();
            return this.elements.every((element) => element.reportValidity());
        }
        getAttribute(key) {
            return this.elements[0].getAttribute(key);
        }
        get dynamicValidity() {
            var _a, _b;
            const validityFn = (_a = this.config) === null || _a === void 0 ? void 0 : _a.dynamicValidity;
            return validityFn && validityFn(this, (_b = this.form) !== null && _b !== void 0 ? _b : undefined);
        }
        get defaultValidationMessage() {
            var _a;
            return (_a = this.config) === null || _a === void 0 ? void 0 : _a.validationMessage;
        }
        get validity() {
            return this.elements[0].validity;
        }
        get validityError() {
            return this.errorConstraintMap.filter(([errorName, constraintName]) => this.validity[errorName])[0];
        }
        get elements() {
            return [];
        }
        get isValid() {
            return !this.error || this.error.length == 0;
        }
        get error() {
            if (!this.isValidated)
                this.validate();
            return this.elements[0].validationMessage;
        }
        get id() {
            return this.elements[0].id;
        }
        get name() {
            return this.elements[0].name;
        }
        get value() {
            return this.elements[0].value;
        }
        get errorConstraintMap() {
            const errorConstraintMap = [
                ["badInput"],
                ["typeMismatch"],
            ];
            for (const constraint of this.supportedConstraints) {
                switch (constraint) {
                    case "required":
                        errorConstraintMap.push(["valueMissing", "required"]);
                        break;
                    case "pattern":
                        errorConstraintMap.push(["patternMismatch", "pattern"]);
                        break;
                    case "min":
                        errorConstraintMap.push(["rangeUnderflow", "min"]);
                        break;
                    case "max":
                        errorConstraintMap.push(["rangeOverflow", "max"]);
                        break;
                    case "minLength":
                        errorConstraintMap.push(["tooShort", "minLength"]);
                        break;
                    case "maxLength":
                        errorConstraintMap.push(["tooLong", "maxLength"]);
                        break;
                    case "step":
                        errorConstraintMap.push(["stepMismatch", "step"]);
                        break;
                }
            }
            return errorConstraintMap;
        }
    }

    // Input masking inspired by https://github.com/alpinejs/alpine/blob/main/packages/mask/src/index.js
    const backspaceMask = (value) => {
        const isLastCharValid = value.length == 0 || /[0-9a-zA-Z]/.test(value[value.length - 1]);
        if (!isLastCharValid) {
            return backspaceMask(value.slice(0, value.length - 1));
        }
        else {
            return value;
        }
    };
    const stripDown = (value, mask) => {
        let inputToBeStripped = value;
        let output = "";
        let regexes = {
            "9": /[0-9]/,
            a: /[a-zA-Z]/,
            "*": /[a-zA-Z0-9]/,
        };
        let wildcardTemplate = "";
        // Strip away non wildcard template characters.
        for (let i = 0; i < mask.length; i++) {
            if (["9", "a", "*"].includes(mask[i])) {
                wildcardTemplate += mask[i];
                continue;
            }
            for (let j = 0; j < inputToBeStripped.length; j++) {
                if (inputToBeStripped[j] === mask[i]) {
                    inputToBeStripped =
                        inputToBeStripped.slice(0, j) +
                            inputToBeStripped.slice(j + 1);
                    break;
                }
            }
        }
        for (let i = 0; i < wildcardTemplate.length; i++) {
            let found = false;
            for (let j = 0; j < inputToBeStripped.length; j++) {
                if (regexes[wildcardTemplate[i]].test(inputToBeStripped[j])) {
                    output += inputToBeStripped[j];
                    inputToBeStripped =
                        inputToBeStripped.slice(0, j) +
                            inputToBeStripped.slice(j + 1);
                    found = true;
                    break;
                }
            }
            if (!found)
                break;
        }
        return output;
    };
    const buildUp = (value, mask) => {
        const strippedValue = stripDown(value, mask);
        let clean = Array.from(strippedValue);
        let output = "";
        for (let i = 0; i < mask.length; i++) {
            if (!["9", "a", "*"].includes(mask[i])) {
                output += mask[i];
                continue;
            }
            if (clean.length === 0)
                break;
            output += clean.shift();
        }
        return output;
    };
    const restoreCursorPosition = (value, mask, event, callback) => {
        const target = event.target;
        let cursorPosition = target.selectionStart;
        let unformattedValue = target.value;
        callback();
        let beforeLeftOfCursorBeforeFormatting = unformattedValue.slice(0, cursorPosition !== null && cursorPosition !== void 0 ? cursorPosition : undefined);
        let newPosition = buildUp(stripDown(beforeLeftOfCursorBeforeFormatting, mask), mask).length;
        target.setSelectionRange(newPosition, newPosition);
    };
    const maskValue = (value, mask, event) => {
        var _a;
        let output = buildUp(value, mask);
        if ((_a = event === null || event === void 0 ? void 0 : event.inputType) === null || _a === void 0 ? void 0 : _a.includes("delete")) {
            output = backspaceMask(value);
        }
        return output;
    };

    class Textbox extends Input {
        constructor(element, config) {
            var _a, _b;
            super({
                supportedConstraints: [
                    "required",
                    "step",
                    "min",
                    "max",
                    "minLength",
                    "maxLength",
                    "pattern",
                ],
            });
            this.element = selectElement(element, [HTMLInputElement, HTMLTextAreaElement]);
            this.config = config;
            this.mask = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.mask) !== null && _b !== void 0 ? _b : this.element.getAttribute("mask");
            this.syncConstraints();
            if (this.mask && !["tel", "text"].includes(this.element.type)) {
                throw new Error('Textbox masking is only allowed with input type of "tel" or "text"');
            }
            this.element.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            });
            this.element.addEventListener("input", (e) => {
                if (!this.mask) {
                    this.handleChange(e);
                    return;
                }
                const value = this.element.value;
                const mask = typeof this.mask === "string" ? this.mask : this.mask(value);
                const event = e;
                restoreCursorPosition(value, mask, event, () => {
                    this.element.value = maskValue(value, mask, event);
                });
                this.handleChange(e);
            });
        }
        get elements() {
            return [this.element];
        }
        get value() {
            var _a;
            if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.valueAs) {
                return this.config.valueAs(this.element.value);
            }
            else {
                return this.element.value;
            }
        }
    }

    class RadioGroup extends Input {
        constructor(element, config) {
            super({
                supportedConstraints: ["required"],
            });
            this.element = selectElement(element, HTMLElement);
            this.config = config;
            this.radioButtons = Array.from(this.element.querySelectorAll("input[type=radio]"));
            this.syncConstraints();
            Array.from(this.radioButtons).forEach((button) => button.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            }));
            Array.from(this.radioButtons).forEach((button) => button.addEventListener("input", (event) => {
                this.handleChange(event);
            }));
        }
        get elements() {
            return this.radioButtons;
        }
        get checked() {
            return this.radioButtons.filter((button) => button.checked)[0];
        }
        get value() {
            return this.checked ? this.checked.value : null;
        }
    }

    class CheckboxGroup extends Input {
        constructor(element, config) {
            super({
                supportedConstraints: ["required"],
            });
            this.element = selectElement(element, HTMLElement);
            this.config = config;
            this.checkboxes = Array.from(this.element.querySelectorAll("input[type=checkbox]"));
            this.syncConstraints();
            Array.from(this.checkboxes).forEach((button) => button.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            }));
            Array.from(this.checkboxes).forEach((button) => button.addEventListener("input", (event) => {
                this.handleChange(event);
            }));
        }
        get elements() {
            return this.checkboxes;
        }
        get checked() {
            return this.checkboxes.filter((button) => button.checked);
        }
        get value() {
            if (this.checkboxes.length > 1) {
                return this.checked
                    ? this.checked.map((element) => element.value)
                    : null;
            }
            else {
                return this.checked ? this.checked[0].value : null;
            }
        }
    }

    class Checkbox extends Input {
        constructor(element, config) {
            super({
                supportedConstraints: ["required"],
            });
            this.element = selectElement(element, HTMLInputElement);
            this.config = config;
            this.syncConstraints();
            this.element.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            });
            this.element.addEventListener("input", (event) => {
                this.handleChange(event);
            });
        }
        get elements() {
            return [this.element];
        }
        get checked() {
            return this.element.checked;
        }
        get value() {
            return this.element.checked ? this.element.value : null;
        }
    }

    class Select extends Input {
        constructor(element, config) {
            super({
                supportedConstraints: ["required"],
            });
            this.element = selectElement(element, HTMLSelectElement);
            this.config = config;
            this.syncConstraints();
            this.element.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            });
            this.element.addEventListener("input", (event) => {
                this.handleChange(event);
            });
        }
        get elements() {
            return [this.element];
        }
    }

    class Tabs {
        constructor(element, config) {
            this.element = selectElement(element, HTMLElement);
            this.config = config;
            if (!this.element.querySelector("[role=tablist]")) ;
            this.tabList = selectElement("[role=tablist]", HTMLElement, this.element);
            this.tabList.id = uid("tablist");
            this.tabs = Array.from(this.tabList.querySelectorAll("[role=tab]"));
            this.tabPanels = Array.from(this.element.querySelectorAll("[role=tabpanel]"));
            for (var i = 0; i < this.tabs.length; i += 1) {
                const tab = this.tabs[i];
                const tabPanel = this.tabPanels[i];
                if (!tabPanel) {
                    throw new Error("Found no tabpanel for one of the tabs.");
                }
                tab.id = uid("tab");
                tabPanel.id = uid("tabpanel");
                tabPanel.setAttribute("aria-labelledby", tab.id);
                tab.tabIndex = -1;
                tab.setAttribute("aria-selected", "false");
                tab.setAttribute("aria-controls", tabPanel.id);
                tab.addEventListener("keydown", (event) => {
                    this.handleKeyDown(event);
                });
                tab.addEventListener("click", (event) => {
                    this.handleClick(tab, tabPanel);
                });
            }
            this.firstTab = this.tabs[0];
            this.lastTab = this.tabs[this.tabs.length - 1];
            this.select(this.firstTab);
        }
        preventSelection() {
            this.preventedSelection = true;
        }
        select(selected) {
            if (typeof selected === "number") {
                this.selectByIndex(selected);
            }
            else {
                this.selectByTab(selected);
            }
        }
        selectByIndex(index) {
            this.selectedTab = this.tabs[index];
            this.selectedTabPanel = this.tabPanels[index];
            this.handleSelection();
        }
        selectByTab(selectedTab) {
            this.selectedTab = selectedTab;
            this.selectedTabPanel = this.tabPanels[this.tabs.indexOf(selectedTab)];
            this.handleSelection();
        }
        async handleSelection() {
            var _a;
            if (!this.selectedTab || !this.selectedTabPanel) {
                throw Error("Tab selection out of range.");
            }
            if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onSelect) {
                await this.config.onSelect(this);
            }
            if (this.preventedSelection) {
                this.preventedSelection = undefined;
                return;
            }
            for (var i = 0; i < this.tabs.length; i += 1) {
                const tab = this.tabs[i];
                if (this.selectedTab === tab) {
                    tab.setAttribute("aria-selected", "true");
                    tab.removeAttribute("tabindex");
                    this.tabPanels[i].removeAttribute("hidden");
                    this.currentTab = this.selectedTab;
                    this.currentTabPanel = this.selectedTabPanel;
                }
                else {
                    tab.setAttribute("aria-selected", "false");
                    tab.tabIndex = -1;
                    this.tabPanels[i].setAttribute("hidden", "true");
                }
            }
        }
        moveFocusToTab(currentTab) {
            currentTab.focus();
        }
        moveFocusToPreviousTab(currentTab) {
            let index;
            if (currentTab === this.firstTab) {
                this.moveFocusToTab(this.lastTab);
            }
            else {
                index = this.tabs.indexOf(currentTab);
                this.moveFocusToTab(this.tabs[index - 1]);
            }
        }
        moveFocusToNextTab(currentTab) {
            let index;
            if (currentTab === this.lastTab) {
                this.moveFocusToTab(this.firstTab);
            }
            else {
                index = this.tabs.indexOf(currentTab);
                this.moveFocusToTab(this.tabs[index + 1]);
            }
        }
        handleClick(tab, tabPanel) {
            this.selectByTab(tab);
        }
        handleKeyDown(event) {
            const target = event.currentTarget;
            let flag = false;
            switch (event.key) {
                case "ArrowLeft":
                    this.moveFocusToPreviousTab(target);
                    flag = true;
                    break;
                case "ArrowRight":
                    this.moveFocusToNextTab(target);
                    flag = true;
                    break;
                case "Home":
                    this.moveFocusToTab(this.firstTab);
                    flag = true;
                    break;
                case "End":
                    this.moveFocusToTab(this.lastTab);
                    flag = true;
                    break;
            }
            if (flag) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

    class Listbox {
        constructor(element, config) {
            var _a, _b;
            this.element = selectElement(element, HTMLElement);
            this.config = config;
            this.element.setAttribute("tabindex", "0");
            this.options = Array.from(this.element.querySelectorAll("[role=option]"));
            for (const option of this.options) {
                if (!option.id) {
                    option.id = uid("listboxitem");
                }
                option.addEventListener("click", () => (this.selected = option));
            }
            this._selected = null;
            this.selected =
                (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.filter((option) => option.getAttribute("aria-selected") == "true")[0]) !== null && _b !== void 0 ? _b : null;
            this.element.addEventListener("keydown", this.checkKeyDown.bind(this));
        }
        get selected() {
            return this._selected;
        }
        set selected(selectedOption) {
            var _a;
            if (!selectedOption) {
                this._selected = null;
                this.element.removeAttribute("aria-activedescendant");
                return;
            }
            for (const option of this.options) {
                if (option == selectedOption) {
                    option.setAttribute("aria-selected", "true");
                }
                else {
                    option.removeAttribute("aria-selected");
                }
            }
            this._selected = selectedOption;
            this.element.setAttribute("aria-activedescendant", this.selected.id);
            if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onSelect) {
                this.config.onSelect(this);
            }
        }
        get value() {
            var _a;
            if (!this.selected)
                return null;
            return (_a = this.selected.getAttribute("value")) !== null && _a !== void 0 ? _a : this.selected.textContent;
        }
        checkKeyDown(event) {
            let current;
            let next;
            let previous;
            if (this.selected) {
                current = this.options.indexOf(this.selected);
                next = current == this.options.length - 1 ? current : current + 1;
                previous = current == 0 ? current : current - 1;
            }
            else {
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

    class FileInput extends Input {
        constructor(element, config) {
            super({
                supportedConstraints: ["required"],
            });
            this.element = selectElement(element, HTMLInputElement);
            this.config = config;
            this.syncConstraints();
            this.element.addEventListener("invalid", (event) => {
                this.handleInvalid(event);
            });
            this.element.addEventListener("input", (event) => {
                this.handleChange(event);
            });
        }
        get elements() {
            return [this.element];
        }
    }

    class Popover {
    }

    class Combobox extends Input {
    }

    exports.Checkbox = Checkbox;
    exports.CheckboxGroup = CheckboxGroup;
    exports.Combobox = Combobox;
    exports.FileInput = FileInput;
    exports.Form = Form;
    exports.Input = Input;
    exports.Listbox = Listbox;
    exports.Popover = Popover;
    exports.RadioGroup = RadioGroup;
    exports.Select = Select;
    exports.Tabs = Tabs;
    exports.Textbox = Textbox;
    exports.selectElement = selectElement;
    exports.uid = uid;

}));
//# sourceMappingURL=mnmo.js.map
