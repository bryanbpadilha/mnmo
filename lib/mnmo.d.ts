type TSelector<T extends HTMLElement> = T | string;

type TFormEvent = (form: Form, event: Event) => void;
type TFormSubmitEvent = (form: Form, event: SubmitEvent) => void | boolean;
interface IFormConfig {
    onInvalid?: TFormEvent;
    onChange?: TFormEvent;
    onInput?: TFormEvent;
    onSubmit?: TFormSubmitEvent;
}
declare class Form {
    element: HTMLFormElement;
    config?: IFormConfig;
    inputs?: Input[];
    isDirty: boolean;
    isSubmitted: boolean;
    constructor(element: TSelector<HTMLFormElement>, config?: IFormConfig);
    private emit;
    private handleInput;
    private handleChange;
    private handleSubmit;
    private handleInvalid;
    append(...inputs: Input[]): void;
    getInput(name: string): Input | undefined;
    getInputById(id: string): Input | undefined;
    getInputByAttribute(key: string, value: string): Input | undefined;
    get errors(): {
        [key: string]: string;
    };
    get values(): {
        [key: string]: any;
    };
    get data(): FormData;
    get elements(): HTMLFormControlsCollection;
    get isValid(): boolean;
}

type TInputDynamicValidity = (input: Input, form?: Form) => string;
type TInputConstraints = Array<[
    "required",
    "pattern",
    "max",
    "min",
    "maxLength",
    "minLength",
    "step"
][number]>;
type IInputErrorConstraintMap = Array<[
    [
        "badInput"
    ],
    [
        "typeMismatch"
    ],
    [
        "valueMissing",
        "required"
    ],
    [
        "patternMismatch",
        "pattern"
    ],
    [
        "rangeOverflow",
        "max"
    ],
    [
        "rangeUnderflow",
        "min"
    ],
    [
        "stepMismatch",
        "step"
    ],
    [
        "tooLong",
        "maxLength"
    ],
    [
        "tooShort",
        "minLength"
    ]
][number]>;
type TInputEvent<T> = (input: T, form?: Form) => void;
type TInputConstraintEntry<T> = T | {
    value: T;
    message: string;
};
interface IInputProperties {
    supportedConstraints: TInputConstraints;
}
declare class Input {
    config?: Record<string, any>;
    supportedConstraints: IInputProperties["supportedConstraints"];
    form?: Form;
    isTouched: boolean;
    isValidated: boolean;
    constructor(properties: IInputProperties);
    protected emit<T>(key: string, event: T): void;
    protected handleChange(event: Event): void;
    protected handleInvalid(event: Event): void;
    protected syncConstraintEntry(key: string): void;
    syncConstraints(): void;
    protected getDefaultValidationMessage(): string;
    protected getCustomValidationMessage(key?: string): string;
    validate(): void;
    setCustomValidity(validity: string): void;
    checkValidity(): boolean;
    reportValidity(): boolean;
    getAttribute(key: string): string | null;
    get dynamicValidity(): string | undefined;
    get defaultValidationMessage(): string | undefined;
    get validity(): ValidityState;
    get validityError(): ["badInput"] | ["typeMismatch"] | ["valueMissing", "required"] | ["patternMismatch", "pattern"] | ["rangeOverflow", "max"] | ["rangeUnderflow", "min"] | ["stepMismatch", "step"] | ["tooLong", "maxLength"] | ["tooShort", "minLength"];
    get elements(): (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];
    get isValid(): boolean;
    get error(): string;
    get id(): string;
    get name(): string;
    get value(): any;
    get errorConstraintMap(): IInputErrorConstraintMap;
}

interface ITextboxConfig {
    onChange?: TInputEvent<Textbox>;
    onInvalid?: TInputEvent<Textbox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    step?: TInputConstraintEntry<number>;
    min?: TInputConstraintEntry<number | string>;
    max?: TInputConstraintEntry<number | string>;
    minLength?: TInputConstraintEntry<number>;
    maxLength?: TInputConstraintEntry<number>;
    pattern?: TInputConstraintEntry<string>;
    dynamicValidity?: TInputDynamicValidity;
    mask?: string | ((value: string) => string);
    valueAs?: (value: string) => any;
}
declare class Textbox extends Input {
    element: HTMLInputElement | HTMLTextAreaElement;
    config?: ITextboxConfig;
    mask?: string | ((value: string) => string) | null;
    constructor(element: TSelector<HTMLTextAreaElement | HTMLInputElement>, config?: ITextboxConfig);
    get elements(): HTMLInputElement[];
    get value(): any;
}

interface IRadioGroupConfig {
    onChange?: TInputEvent<RadioGroup>;
    onInvalid?: TInputEvent<RadioGroup>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
declare class RadioGroup extends Input {
    element: HTMLElement;
    radioButtons: HTMLInputElement[];
    config?: IRadioGroupConfig;
    constructor(element: TSelector<HTMLElement>, config?: IRadioGroupConfig);
    get elements(): HTMLInputElement[];
    get checked(): HTMLInputElement | undefined;
    get value(): string | null;
}

interface ICheckboxGroupConfig {
    onChange?: TInputEvent<CheckboxGroup>;
    onInvalid?: TInputEvent<CheckboxGroup>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
declare class CheckboxGroup extends Input {
    element: HTMLElement;
    checkboxes: HTMLInputElement[];
    constructor(element: TSelector<HTMLElement>, config?: ICheckboxGroupConfig);
    get elements(): HTMLInputElement[];
    get checked(): HTMLInputElement[] | undefined;
    get value(): string | string[] | null;
}

interface ICheckboxConfig {
    onChange?: TInputEvent<Checkbox>;
    onInvalid?: TInputEvent<Checkbox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
declare class Checkbox extends Input {
    element: HTMLInputElement;
    config?: ICheckboxConfig;
    constructor(element: TSelector<HTMLInputElement>, config?: ICheckboxConfig);
    get elements(): HTMLInputElement[];
    get checked(): boolean;
    get value(): string | null;
}

interface ISelectConfig {
    onChange?: TInputEvent<Select>;
    onInvalid?: TInputEvent<Select>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
declare class Select extends Input {
    element: HTMLSelectElement;
    config?: ISelectConfig;
    constructor(element: TSelector<HTMLSelectElement>, config?: ISelectConfig);
    get elements(): HTMLSelectElement[];
}

interface ITabsConfig {
    onSelect?: (tabs: Tabs) => void | Promise<void>;
}
declare class Tabs {
    element: HTMLElement;
    config?: ITabsConfig;
    tabList: HTMLElement;
    tabs: HTMLElement[];
    tabPanels: HTMLElement[];
    firstTab: HTMLElement;
    lastTab: HTMLElement;
    preventedSelection?: boolean;
    currentTab?: HTMLElement;
    selectedTab?: HTMLElement;
    currentTabPanel?: HTMLElement;
    selectedTabPanel?: HTMLElement;
    constructor(element: TSelector<HTMLElement>, config?: ITabsConfig);
    preventSelection(): void;
    select(selected: number | HTMLElement): void;
    selectByIndex(index: number): void;
    selectByTab(selectedTab: HTMLElement): void;
    private handleSelection;
    private moveFocusToTab;
    private moveFocusToPreviousTab;
    private moveFocusToNextTab;
    private handleClick;
    private handleKeyDown;
}

interface IListboxConfig {
    onSelect?: (listbox: Listbox) => void | Promise<void>;
}
declare class Listbox {
    element: HTMLElement;
    config?: IListboxConfig;
    options: HTMLElement[];
    _selected: HTMLElement | null;
    constructor(element: TSelector<HTMLElement>, config?: IListboxConfig);
    get selected(): HTMLElement | null;
    set selected(selectedOption: HTMLElement | null);
    get value(): string | null;
    checkKeyDown(event: KeyboardEvent): void;
}

interface IFileInputConfig {
    onChange?: TInputEvent<FileInput>;
    onInvalid?: TInputEvent<FileInput>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
}
declare class FileInput extends Input {
    element: HTMLInputElement;
    config?: IFileInputConfig;
    constructor(element: TSelector<HTMLInputElement>, config?: IFileInputConfig);
    get elements(): HTMLInputElement[];
}

interface IPopoverConfig {
    placement?: any;
    offset?: number;
    open?: boolean;
    onOpen?: (popover: Popover) => void | Promise<void>;
    onClose?: (popover: Popover) => void | Promise<void>;
}
declare class Popover {
    reference: HTMLElement;
    floating: HTMLElement;
    config?: IPopoverConfig;
    isOpen: boolean;
    private cleanupAutoUpdate?;
    private onDocumentClick;
    private onDocumentKeydown;
    constructor(reference: TSelector<HTMLElement>, floating: TSelector<HTMLElement>, config?: IPopoverConfig);
    updatePosition(): Promise<void>;
    private startAutoUpdate;
    private stopAutoUpdate;
    show(): void;
    hide(): void;
    toggle(): void;
}

interface IComboboxConfig {
    onChange?: TInputEvent<Combobox>;
    onInvalid?: TInputEvent<Combobox>;
    validationMessage?: string;
    required?: TInputConstraintEntry<true>;
    dynamicValidity?: TInputDynamicValidity;
    onOpen?: (combobox: Combobox) => void | Promise<void>;
    onClose?: (combobox: Combobox) => void | Promise<void>;
    filter?: (option: HTMLElement, query: string) => boolean;
}
declare class Combobox extends Input {
    trigger: HTMLElement;
    dialog: HTMLElement;
    search: HTMLInputElement;
    listbox: Listbox;
    popover: Popover;
    hiddenInput: HTMLInputElement;
    pendingSelected: HTMLElement | null;
    config?: IComboboxConfig;
    constructor(trigger: TSelector<HTMLElement>, config?: IComboboxConfig);
    private ensureHiddenInput;
    private getVisibleOptions;
    private applyFilter;
    private commitSelection;
    private updateValueFromSelected;
    get elements(): HTMLInputElement[];
    get value(): string;
    private resetListboxState;
}

declare const uid: (prefix?: string) => string;
type TElementConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement;
};
declare const selectElement: <T extends HTMLElement>(selector: TSelector<T>, constructor: TElementConstructor | TElementConstructor[], parent?: Element) => T;

export { Checkbox, CheckboxGroup, Combobox, FileInput, Form, type ICheckboxConfig, type ICheckboxGroupConfig, type IComboboxConfig, type IFileInputConfig, type IFormConfig, type IInputErrorConstraintMap, type IInputProperties, type IPopoverConfig, type IRadioGroupConfig, type ISelectConfig, type ITextboxConfig, Input, Listbox, Popover, RadioGroup, Select, type TFormEvent, type TFormSubmitEvent, type TInputConstraintEntry, type TInputConstraints, type TInputDynamicValidity, type TInputEvent, Tabs, Textbox, selectElement, uid };
