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

export const getElement = (value: string | HTMLElement) => {
    if (value instanceof HTMLElement) return value;
    return document.querySelector(value as string);
};

export const selectElement = <T = HTMLElement>(
    element: TSelector<T>,
    constructor = HTMLElement,
    parent: Element = document.body
) => {
    const selected =
        element instanceof constructor
            ? element
            : parent.querySelector(element as string);

    if (!(selected instanceof constructor)) {
        throw new Error(
            `Either did not found an element "${element}" inside of "${parent}", or the element found is not an instance of "${constructor}". This will generally happen if you initialize a component without a proper element, or if the element markup does not have the required children elements.`
        );
    }

    return selected as T;
};
