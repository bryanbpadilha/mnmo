export const uid = (function () {
    let id = 0;
    return (prefix?: string) => {
        return prefix ? prefix + "-" + id : id + "";
    };
})();
