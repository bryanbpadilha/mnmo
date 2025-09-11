import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";
import {
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
} from "@floating-ui/dom";

export interface IPopoverConfig {
    placement?: any;
    offset?: number;
    open?: boolean;
    onOpen?: (popover: Popover) => void | Promise<void>;
    onClose?: (popover: Popover) => void | Promise<void>;
}

export class Popover {
    reference: HTMLElement;
    floating: HTMLElement;
    config?: IPopoverConfig;

    isOpen: boolean = false;

    private cleanupAutoUpdate?: () => void;

    private onDocumentClick: (e: MouseEvent) => void;
    private onDocumentKeydown: (e: KeyboardEvent) => void;

    constructor(
        reference: TSelector<HTMLElement>,
        floating: TSelector<HTMLElement>,
        config?: IPopoverConfig
    ) {
        this.reference = selectElement(reference, HTMLElement);
        this.floating = selectElement(floating, HTMLElement);
        this.config = config;

        if (!this.floating.id) {
            this.floating.id = uid("popover");
        }

        // Default hidden unless configured as open
        if (!this.config?.open) {
            this.hide();
        } else {
            this.show();
        }

        this.onDocumentClick = (e) => {
            const target = e.target as Node;
            if (!this.isOpen) return;

            const clickedOutside =
                !this.floating.contains(target) &&
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
        const { x, y } = await computePosition(this.reference, this.floating, {
            placement: (this.config?.placement as any) ?? "bottom-start",
            strategy: "absolute",
            middleware: [
                offset(this.config?.offset ?? 6),
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

    private startAutoUpdate() {
        this.cleanupAutoUpdate = autoUpdate(
            this.reference,
            this.floating,
            () => {
                this.updatePosition();
            }
        );
    }

    private stopAutoUpdate() {
        if (this.cleanupAutoUpdate) {
            this.cleanupAutoUpdate();
            this.cleanupAutoUpdate = undefined;
        }
    }

    show() {
        if (this.isOpen) return;
        this.isOpen = true;

        this.floating.removeAttribute("hidden");
        this.updatePosition();
        this.startAutoUpdate();

        document.addEventListener("mousedown", this.onDocumentClick, true);
        document.addEventListener("keydown", this.onDocumentKeydown, true);

        if (this.config?.onOpen) this.config.onOpen(this);
    }

    hide() {
        if (!this.isOpen) {
            this.floating.setAttribute("hidden", "true");
            return;
        }

        this.isOpen = false;
        this.floating.setAttribute("hidden", "true");

        this.stopAutoUpdate();

        document.removeEventListener("mousedown", this.onDocumentClick, true);
        document.removeEventListener("keydown", this.onDocumentKeydown, true);

        if (this.config?.onClose) this.config.onClose(this);
    }

    toggle() {
        if (this.isOpen) this.hide();
        else this.show();
    }
}
