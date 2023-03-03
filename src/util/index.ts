export const uid = (function () {
    let id = 0;
    return (prefix?: string) => {
        return prefix ? prefix + "-" + id : id + "";
    };
})();

export const getElement = (value: string | HTMLElement) => {
    if (value instanceof HTMLElement) return value;
    return document.querySelector(value as string);
};
