import type { TSelector } from "./types";
export declare const uid: (prefix?: string) => string;
type TElementConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement;
};
export declare const selectElement: <T extends HTMLElement>(
    selector: TSelector<T>,
    constructor: TElementConstructor | TElementConstructor[],
    parent?: Element
) => T;
export {};
