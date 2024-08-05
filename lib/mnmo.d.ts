type TSelector<T extends HTMLElement> = T | string;

type TFormEvent = (form: Form, event: Event) => void;
type TFormSubmitEvent = (form: Form, event: SubmitEvent) => Promise<void>;
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
    isSubmitting: boolean;
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
    protected emit(event: string): void;
    protected handleChange(): void;
    protected handleInvalid(): void;
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

declare const uid: (prefix?: string) => string;
type TElementConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement;
};
declare const selectElement: <T extends HTMLElement>(selector: TSelector<T>, constructor: TElementConstructor | TElementConstructor[], parent?: Element) => T;

export { Checkbox, CheckboxGroup, FileInput, Form, type ICheckboxConfig, type ICheckboxGroupConfig, type IFileInputConfig, type IFormConfig, type IInputErrorConstraintMap, type IInputProperties, type IRadioGroupConfig, type ISelectConfig, type ITextboxConfig, Input, Listbox, RadioGroup, Select, type TFormEvent, type TFormSubmitEvent, type TInputConstraintEntry, type TInputConstraints, type TInputDynamicValidity, type TInputEvent, Tabs, Textbox, selectElement, uid };
