export type Logger = {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    clear: () => void;
};

const toText = (v: any) => {
    if (v == null) return String(v);
    if (typeof v === "string") return v;
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return String(v);
    }
};

export function createLogger(target: string | HTMLElement): Logger {
    const el =
        typeof target === "string"
            ? (document.querySelector(target) as HTMLElement)
            : target;

    const write = (level: string, args: any[]) => {
        const time = new Date().toLocaleTimeString();
        const line = `[${time}] ${level}: ` + args.map(toText).join(" ");
        el.textContent += line + "\n";
        el.scrollTop = el.scrollHeight;
    };

    return {
        log: (...a) => write("log", a),
        info: (...a) => write("info", a),
        warn: (...a) => write("warn", a),
        error: (...a) => write("error", a),
        clear: () => {
            el.textContent = "";
        },
    };
}
