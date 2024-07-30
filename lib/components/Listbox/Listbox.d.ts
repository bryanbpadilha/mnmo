import type { TSelector } from "../../util/types";
interface IListboxConfig {
    onSelect?: (listbox: Listbox) => void | Promise<void>;
}
export declare class Listbox {
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
export {};
