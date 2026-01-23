'use strict';

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
        // Bind handlers to 'this' context and store references
        this.boundHandleInput = (event) => this.handleInput(event);
        this.boundHandleChange = (event) => this.handleChange(event);
        // Cast SubmitEvent to Event for generic listener compatibility or handle strictly
        this.boundHandleSubmit = (event) => this.handleSubmit(event);
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.element.addEventListener("input", this.boundHandleInput);
        this.element.addEventListener("change", this.boundHandleChange);
        this.element.addEventListener("submit", this.boundHandleSubmit);
        this.element.addEventListener("invalid", this.boundHandleInvalid, true);
    }
    /**
     * Removes all event listeners, destroys attached inputs,
     * and clears references to prevent memory leaks.
     */
    destroy() {
        this.element.removeEventListener("input", this.boundHandleInput);
        this.element.removeEventListener("change", this.boundHandleChange);
        this.element.removeEventListener("submit", this.boundHandleSubmit);
        this.element.removeEventListener("invalid", this.boundHandleInvalid, true);
        if (this.inputs) {
            this.inputs.forEach((input) => input.destroy());
            this.inputs = [];
        }
        this.config = undefined;
        // logic reset
        this.isDirty = false;
        this.isSubmitted = false;
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
        // Track attributes modified by this class to clean them up on destroy
        this.appliedConstraints = [];
        this.supportedConstraints = properties.supportedConstraints;
        this.isTouched = false;
        this.isValidated = false;
        this.appliedConstraints = [];
    }
    /**
     * Cleans up side effects:
     * 1. Removes validation attributes applied by JS.
     * 2. Resets custom validity.
     * 3. Disconnects from form.
     */
    destroy() {
        // Remove attributes we added
        for (const attribute of this.appliedConstraints) {
            for (const element of this.elements) {
                element.removeAttribute(attribute);
            }
        }
        this.appliedConstraints = [];
        // Reset validity state
        this.setCustomValidity("");
        this.isTouched = false;
        this.isValidated = false;
        this.form = undefined;
        this.config = undefined;
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
        if (this.config && this.config[key] !== undefined) {
            const constraint = this.config[key];
            let constraintValue;
            let constraintMessage;
            if (typeof constraint === "object" &&
                constraint !== null &&
                "value" in constraint) {
                constraintValue = constraint.value;
                constraintMessage = constraint.message;
            }
            else {
                constraintValue = constraint;
            }
            // Apply Attribute
            for (const element of this.elements) {
                if (typeof constraintValue === "boolean" && !constraintValue) {
                    continue;
                }
                const strValue = String(constraintValue);
                element.setAttribute(key, strValue);
                // Track it so we can remove it on destroy
                if (!this.appliedConstraints.includes(key)) {
                    this.appliedConstraints.push(key);
                }
            }
            // Apply Message Attribute
            if (constraintMessage) {
                const msgKey = `${key}-message`;
                for (const element of this.elements) {
                    element.setAttribute(msgKey, constraintMessage);
                }
                if (!this.appliedConstraints.includes(msgKey)) {
                    this.appliedConstraints.push(msgKey);
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
        // Apply config constraints to DOM
        this.syncConstraints();
        if (this.mask && !["tel", "text"].includes(this.element.type)) {
            throw new Error('Textbox masking is only allowed with input type of "tel" or "text"');
        }
        this.boundHandleInvalid = (event) => {
            this.handleInvalid(event);
        };
        this.boundHandleInput = (e) => {
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
        };
        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }
    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
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
        // Bind once, apply to all
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.boundHandleInput = (event) => this.handleChange(event);
        this.radioButtons.forEach((button) => {
            button.addEventListener("invalid", this.boundHandleInvalid);
            button.addEventListener("input", this.boundHandleInput);
        });
    }
    destroy() {
        this.radioButtons.forEach((button) => {
            button.removeEventListener("invalid", this.boundHandleInvalid);
            button.removeEventListener("input", this.boundHandleInput);
        });
        super.destroy();
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
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.boundHandleInput = (event) => this.handleChange(event);
        this.checkboxes.forEach((button) => {
            button.addEventListener("invalid", this.boundHandleInvalid);
            button.addEventListener("input", this.boundHandleInput);
        });
    }
    destroy() {
        this.checkboxes.forEach((button) => {
            button.removeEventListener("invalid", this.boundHandleInvalid);
            button.removeEventListener("input", this.boundHandleInput);
        });
        super.destroy();
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
            return this.checked && this.checked.length > 0
                ? this.checked[0].value
                : null;
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
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.boundHandleInput = (event) => this.handleChange(event);
        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }
    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
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
        // Bind handlers
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.boundHandleInput = (event) => this.handleChange(event);
        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }
    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
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
        // Ensure the selected option is visible within the listbox container
        this.scrollSelectedIntoView();
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
                this.selected = this.options[next];
                break;
            case "ArrowUp":
                event.preventDefault();
                this.selected = this.options[previous];
                break;
        }
    }
    scrollSelectedIntoView() {
        const container = this.element;
        const option = this._selected;
        if (!container || !option)
            return;
        option.scrollIntoView({ block: "nearest", inline: "nearest" });
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
        this.boundHandleInvalid = (event) => this.handleInvalid(event);
        this.boundHandleInput = (event) => this.handleChange(event);
        this.element.addEventListener("invalid", this.boundHandleInvalid);
        this.element.addEventListener("input", this.boundHandleInput);
    }
    destroy() {
        this.element.removeEventListener("invalid", this.boundHandleInvalid);
        this.element.removeEventListener("input", this.boundHandleInput);
        super.destroy();
    }
    get elements() {
        return [this.element];
    }
}

/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
const oppositeAlignmentMap = {
  start: 'end',
  end: 'start'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
const yAxisSides = /*#__PURE__*/new Set(['top', 'bottom']);
function getSideAxis(placement) {
  return yAxisSides.has(getSide(placement)) ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
}
const lrPlacement = ['left', 'right'];
const rlPlacement = ['right', 'left'];
const tbPlacement = ['top', 'bottom'];
const btPlacement = ['bottom', 'top'];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case 'left':
    case 'right':
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip$1 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);

      // If a reset by the arrow was caused due to an alignment offset being
      // added, we should skip any logic now since `flip()` has already done its
      // work.
      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === 'alignment' ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow ||
          // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every(d => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
            // Try next placement and re-run the lifecycle.
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$filter2;
                const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis ||
                    // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === 'y';
                  }
                  return true;
                }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

const originSides = /*#__PURE__*/new Set(['left', 'top']);

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.

async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === 'y';
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset$1 = function (options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);

      // If the placement is the same and the arrow caused an alignment offset
      // then we don't need to change the positioning coordinates.
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift$1 = function (options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};

function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
const invalidOverflowDisplayValues = /*#__PURE__*/new Set(['inline', 'contents']);
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !invalidOverflowDisplayValues.has(display);
}
const tableElements = /*#__PURE__*/new Set(['table', 'td', 'th']);
function isTableElement(element) {
  return tableElements.has(getNodeName(element));
}
const topLayerSelectors = [':popover-open', ':modal'];
function isTopLayer(element) {
  return topLayerSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });
}
const transformProperties = ['transform', 'translate', 'scale', 'rotate', 'perspective'];
const willChangeValues = ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'];
const containValues = ['paint', 'layout', 'strict', 'content'];
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return transformProperties.some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || willChangeValues.some(value => (css.willChange || '').includes(value)) || containValues.some(value => (css.contain || '').includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
const lastTraversableNodeNames = /*#__PURE__*/new Set(['html', 'body', '#document']);
function isLastTraversableNode(node) {
  return lastTraversableNodeNames.has(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

function getCssDimensions(element) {
  const css = getComputedStyle$1(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

// If <html> has a CSS width greater than the viewport, then this will be
// incorrect for RTL.
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}

function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === 'fixed';
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle$1(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Safety check: ensure the scrollbar space is reasonable in case this
// calculation is affected by unusual styles.
// Most scrollbars leave 15-18px of space.
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  // <html> `overflow: hidden` + `scrollbar-gutter: stable` reduces the
  // visual width of the <html> but this is not considered in the size
  // of `html.clientWidth`.
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === 'CSS1Compat' ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    // If the <body> scrollbar is on the left, the width needs to be extended
    // by the scrollbar amount so there isn't extra space on the right.
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x,
    y
  };
}

const absoluteOrFixed = /*#__PURE__*/new Set(['absolute', 'fixed']);
// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && absoluteOrFixed.has(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}

function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);

  // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
  // Firefox with layout.scrollbar.side = 3 in about:config to test this.
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}

function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === 'static';
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;

  // Firefox returns the <html> element as the offsetParent if it's non-static,
  // while Chrome and Safari return the <body> element. The <body> element must
  // be used to perform the correct calculations even if the <html> element is
  // non-static.
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}

const getElementRects = async function (data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};

function isRTL(element) {
  return getComputedStyle$1(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};

function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          // If the reference is clipped, the ratio is 0. Throttle the refresh
          // to prevent an infinite loop of updates.
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1000);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        // It's possible that even though the ratio is reported as 1, the
        // element is not actually fully within the IntersectionObserver's root
        // area anymore. This can happen under performance constraints. This may
        // be a bug in the browser's IntersectionObserver implementation. To
        // work around this, we compare the element's bounding rect now with
        // what it was at the time we created the IntersectionObserver. If they
        // are not equal then the element moved, so we refresh.
        refresh();
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = offset$1;

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = shift$1;

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = flip$1;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

class Popover {
    constructor(reference, floating, config) {
        var _a;
        this.isOpen = false;
        this.reference = selectElement(reference, HTMLElement);
        this.floating = selectElement(floating, HTMLElement);
        this.config = config;
        if (!this.floating.id) {
            this.floating.id = uid("popover");
        }
        // Default hidden unless configured as open
        if (!((_a = this.config) === null || _a === void 0 ? void 0 : _a.open)) {
            this.hide();
        }
        else {
            this.show();
        }
        this.onDocumentClick = (e) => {
            const target = e.target;
            if (!this.isOpen)
                return;
            const clickedOutside = !this.floating.contains(target) &&
                !this.reference.contains(target);
            if (clickedOutside) {
                this.hide();
            }
        };
        this.onDocumentKeydown = (e) => {
            if (e.key === "Escape" && this.isOpen) {
                this.hide();
            }
        };
    }
    async updatePosition() {
        var _a, _b, _c, _d;
        const { x, y } = await computePosition(this.reference, this.floating, {
            placement: (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.placement) !== null && _b !== void 0 ? _b : "bottom-start",
            strategy: "absolute",
            middleware: [
                offset((_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.offset) !== null && _d !== void 0 ? _d : 6),
                flip(),
                shift({ padding: 8 }),
            ],
        });
        Object.assign(this.floating.style, {
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
        });
    }
    startAutoUpdate() {
        this.cleanupAutoUpdate = autoUpdate(this.reference, this.floating, () => {
            this.updatePosition();
        });
    }
    stopAutoUpdate() {
        if (this.cleanupAutoUpdate) {
            this.cleanupAutoUpdate();
            this.cleanupAutoUpdate = undefined;
        }
    }
    show() {
        var _a;
        if (this.isOpen)
            return;
        this.isOpen = true;
        this.floating.removeAttribute("hidden");
        this.updatePosition();
        this.startAutoUpdate();
        document.addEventListener("mousedown", this.onDocumentClick, true);
        document.addEventListener("keydown", this.onDocumentKeydown, true);
        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onOpen)
            this.config.onOpen(this);
    }
    hide() {
        var _a;
        if (!this.isOpen) {
            this.floating.setAttribute("hidden", "true");
            return;
        }
        this.isOpen = false;
        this.floating.setAttribute("hidden", "true");
        this.stopAutoUpdate();
        document.removeEventListener("mousedown", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onDocumentKeydown, true);
        if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onClose)
            this.config.onClose(this);
    }
    toggle() {
        if (this.isOpen)
            this.hide();
        else
            this.show();
    }
}

class Combobox extends Input {
    constructor(trigger, config) {
        var _a;
        super({
            supportedConstraints: ["required"],
        });
        this.trigger = selectElement(trigger, HTMLElement);
        this.config = config;
        this._value = "";
        const popoverId = this.trigger.getAttribute("aria-controls");
        if (!popoverId) {
            throw new Error("Combobox trigger must have aria-controls referencing the popover/dialog element id.");
        }
        this.dialog = selectElement("#" + popoverId, HTMLElement);
        this.search = selectElement('input[role="combobox"]', HTMLInputElement, this.dialog);
        const derivedName = this.trigger.name ||
            this.trigger.getAttribute("name") ||
            this.trigger.getAttribute("id") ||
            uid("combobox");
        this.memInput = document.createElement("input");
        this.memInput.type = "text";
        this.memInput.name = derivedName;
        const listboxId = this.search.getAttribute("aria-controls");
        const listboxEl = listboxId
            ? selectElement("#" + listboxId, HTMLElement)
            : selectElement('[role="listbox"]', HTMLElement, this.dialog);
        this.listbox = new Listbox(listboxEl, {
            onSelect: (listbox) => {
                this.pendingSelected = listbox.selected;
            },
        });
        this.pendingSelected = (_a = this.listbox.selected) !== null && _a !== void 0 ? _a : null;
        this.trigger.setAttribute("aria-haspopup", "dialog");
        this.trigger.setAttribute("aria-expanded", "false");
        this.search.setAttribute("aria-expanded", "true");
        // Super constraints sync
        this.syncConstraints();
        this.popover = new Popover(this.trigger, this.dialog, {
            open: false,
            onOpen: async () => {
                var _a;
                this.trigger.setAttribute("aria-expanded", "true");
                queueMicrotask(() => this.search.focus());
                if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onOpen)
                    await this.config.onOpen(this);
            },
            onClose: async () => {
                var _a;
                this.trigger.setAttribute("aria-expanded", "false");
                this.resetListboxState();
                if ((_a = this.config) === null || _a === void 0 ? void 0 : _a.onClose)
                    await this.config.onClose(this);
            },
            ...config === null || config === void 0 ? void 0 : config.popover,
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
        this.trigger.addEventListener("keydown", this.boundHandleTriggerKeydown);
        this.search.addEventListener("input", this.boundHandleSearchInput);
        this.search.addEventListener("keydown", this.boundHandleSearchKeydown);
        this.listbox.element.addEventListener("click", this.boundHandleListboxClick);
        if (this.listbox.selected) {
            this.updateValueFromSelected();
        }
    }
    destroy() {
        // Remove Listeners
        this.search.removeEventListener("invalid", this.boundHandleSearchInvalid);
        this.trigger.removeEventListener("click", this.boundHandleTriggerClick);
        this.trigger.removeEventListener("keydown", this.boundHandleTriggerKeydown);
        this.search.removeEventListener("input", this.boundHandleSearchInput);
        this.search.removeEventListener("keydown", this.boundHandleSearchKeydown);
        this.listbox.element.removeEventListener("click", this.boundHandleListboxClick);
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
    handleTriggerKeydown(e) {
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
    handleSearchKeydown(e) {
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
    handleListboxClick(e) {
        const option = e.target.closest('[role="option"]');
        if (option) {
            this.listbox.selected = option;
            this.pendingSelected = option;
            this.commitSelection();
        }
    }
    // --- Existing Logic ---
    getVisibleOptions() {
        return Array.from(this.listbox.element.querySelectorAll('[role="option"]:not([hidden])'));
    }
    applyFilter(query) {
        // ... (Existing implementation from your provided code)
        const normalized = query.trim().toLowerCase();
        const root = this.listbox.element;
        const allOptions = Array.from(root.querySelectorAll('[role="option"]'));
        const allGroups = Array.from(root.querySelectorAll('[role="group"]'));
        // If query is empty, show everything
        if (normalized.length === 0) {
            for (const group of allGroups)
                group.removeAttribute("hidden");
            for (const option of allOptions)
                option.removeAttribute("hidden");
            this.listbox.options = this.getVisibleOptions();
            if (this.listbox.selected &&
                this.listbox.selected.hasAttribute("hidden")) {
                this.listbox.selected = null;
            }
            return;
        }
        const visibleOptions = new Set();
        const optionMatches = (option) => {
            var _a, _b, _c, _d;
            const custom = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.filter) === null || _b === void 0 ? void 0 : _b.call(_a, option, query);
            if (custom !== undefined && custom !== null)
                return custom;
            const text = (_d = (_c = option.textContent) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : "";
            return text.includes(normalized);
        };
        const getGroupLabel = (group) => {
            // ... (Existing logic)
            let label = "";
            const labelledby = group.getAttribute("aria-labelledby");
            if (labelledby) {
                for (const id of labelledby.split(/\s+/)) {
                    const el = document.getElementById(id);
                    if (el === null || el === void 0 ? void 0 : el.textContent)
                        label += el.textContent + " ";
                }
            }
            const ariaLabel = group.getAttribute("aria-label");
            if (ariaLabel)
                label += ariaLabel + " ";
            const heading = group.querySelector("[role='heading'], h1, h2, h3, h4, h5, h6");
            if (heading === null || heading === void 0 ? void 0 : heading.textContent)
                label += heading.textContent + " ";
            return label.trim().toLowerCase();
        };
        // Group Matching
        for (const group of allGroups) {
            const label = getGroupLabel(group);
            if (label && label.includes(normalized)) {
                const subOptions = Array.from(group.querySelectorAll('[role="option"]'));
                subOptions.forEach((o) => visibleOptions.add(o));
            }
        }
        // Option Matching
        for (const option of allOptions) {
            if (optionMatches(option))
                visibleOptions.add(option);
        }
        // Apply visibility
        for (const option of allOptions) {
            visibleOptions.has(option)
                ? option.removeAttribute("hidden")
                : option.setAttribute("hidden", "true");
        }
        for (const group of allGroups) {
            const hasVisibleOption = Array.from(group.querySelectorAll('[role="option"]')).some((o) => !o.hasAttribute("hidden"));
            hasVisibleOption
                ? group.removeAttribute("hidden")
                : group.setAttribute("hidden", "true");
        }
        this.listbox.options = this.getVisibleOptions();
        if (this.listbox.selected &&
            this.listbox.selected.hasAttribute("hidden")) {
            this.listbox.selected = null;
        }
    }
    commitSelection() {
        this.updateValueFromSelected();
        this.handleChange(new Event("change"));
    }
    updateValueFromSelected() {
        var _a, _b, _c, _d, _e;
        const value = (_a = this.listbox.value) !== null && _a !== void 0 ? _a : "";
        const label = (_e = (_c = (_b = this.listbox.selected) === null || _b === void 0 ? void 0 : _b.getAttribute("label")) !== null && _c !== void 0 ? _c : (_d = this.listbox.selected) === null || _d === void 0 ? void 0 : _d.textContent) !== null && _e !== void 0 ? _e : String(value);
        this._value = String(value);
        if (label) {
            this.triggerLabelElement.textContent = label;
        }
        this.validate();
    }
    resetListboxState() {
        this.search.value = "";
        const allOptions = Array.from(this.listbox.element.querySelectorAll('[role="option"]'));
        const allGroups = Array.from(this.listbox.element.querySelectorAll('[role="group"]'));
        for (const group of allGroups)
            group.removeAttribute("hidden");
        for (const option of allOptions)
            option.removeAttribute("hidden");
        this.listbox.options = allOptions;
        const committed = this._value;
        if (committed) {
            const match = allOptions.find((o) => { var _a; return ((_a = o.getAttribute("value")) !== null && _a !== void 0 ? _a : o.textContent) === committed; });
            this.listbox.selected = match !== null && match !== void 0 ? match : null;
        }
        else {
            this.listbox.selected = null;
        }
        this.pendingSelected = this.listbox.selected;
    }
    syncConstraints() {
        var _a, _b;
        this.memInput.removeAttribute("required");
        this.memInput.removeAttribute("required-message");
        this.memInput.removeAttribute("validation-message");
        let required = false;
        let requiredMessage;
        const req = (_a = this.config) === null || _a === void 0 ? void 0 : _a.required;
        if (req) {
            if (typeof req === "object") {
                required = !!req.value;
                requiredMessage = req.message;
            }
            else {
                required = true;
            }
        }
        else if (this.trigger.hasAttribute("required")) {
            required = true;
        }
        if (required)
            this.memInput.setAttribute("required", "true");
        if (requiredMessage)
            this.memInput.setAttribute("required-message", requiredMessage);
        if ((_b = this.config) === null || _b === void 0 ? void 0 : _b.validationMessage) {
            this.memInput.setAttribute("validation-message", this.config.validationMessage);
        }
    }
    validate() {
        var _a;
        this.memInput.value = (_a = this._value) !== null && _a !== void 0 ? _a : "";
        super.validate();
    }
    get triggerLabelElement() {
        var _a;
        if (this.trigger.hasAttribute("aria-labelledby")) {
            return ((_a = document.getElementById(this.trigger.getAttribute("aria-labelledby"))) !== null && _a !== void 0 ? _a : this.trigger);
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
//# sourceMappingURL=mnmo.js.map
