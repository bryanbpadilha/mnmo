import type { TSelector } from "./types";

export const uid = (function () {
    let id = 0;
    const prefixed: Record<string, number> = {};

    return (prefix?: string) => {
        if (!prefix) return "mnmo-" + id++ + "";

        if (prefixed[prefix] == undefined) {
            prefixed[prefix] = 0;
            return "mnmo-" + prefix + "-" + prefixed[prefix];
        }

        prefixed[prefix] = prefixed[prefix] + 1;
        return "mnmo-" + prefix + "-" + prefixed[prefix];
    };
})();

// TODO: this should be a generic
type TElementConstructor = {
    new (): HTMLElement;
    prototype: HTMLElement;
};

export const selectElement = <T extends HTMLElement>(
    selector: TSelector<T>,
    constructor: TElementConstructor | TElementConstructor[],
    parent: Element = document.body
) => {
    const isInstanceOfConstructor = (element: any) => {
        if (!Array.isArray(constructor)) {
            return element instanceof constructor;
        }

        return constructor.filter((item) => element instanceof item).length > 0;
    };

    const element = isInstanceOfConstructor(selector)
        ? selector
        : parent.querySelector(selector as string);

    if (!element) {
        throw new Error(
            `Did not found an element "${selector}" inside of "${parent}". This will generally happen if you initialize a component with an improper element, or if the element markup does not have the required children elements.`
        );
    }

    if (!isInstanceOfConstructor(element)) {
        throw new Error(
            `The element "${element}" selected as "${selector}" inside of "${parent}" is not an instance of "${constructor}". This will generally happen if you initialize a compoment with an improper element, or if the element markup does not have the required children elements.`
        );
    }

    return element as T;
};
