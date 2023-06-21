import { selectElement, uid } from "../../util";
import type { TSelector } from "../../util/types";

interface ITabsConfig {
    onSelect?: (tabs: Tabs) => void | Promise<void>;
}

export class Tabs {
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

    constructor(element: TSelector<HTMLElement>, config?: ITabsConfig) {
        this.element = selectElement(element, HTMLElement);
        this.config = config;

        if (!this.element.querySelector("[role=tablist]")) {
        }

        this.tabList = selectElement<HTMLElement>(
            "[role=tablist]",
            HTMLElement,
            this.element
        );

        this.tabList.id = uid("tablist");

        this.tabs = Array.from<HTMLElement>(
            this.tabList.querySelectorAll("[role=tab]")
        );

        this.tabPanels = Array.from<HTMLElement>(
            this.element.querySelectorAll("[role=tabpanel]")
        );

        for (var i = 0; i < this.tabs.length; i += 1) {
            const tab = this.tabs[i];
            const tabPanel = this.tabPanels[i];

            if (!tabPanel) {
                throw new Error("Found no tabpanel for one of the tabs.");
            }

            tab.id = uid("tab");

            tabPanel.id = uid("tabpanel");
            tabPanel.setAttribute("aria-labelledby", tab.id);

            tab.tabIndex = -1;
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("aria-controls", tabPanel.id);

            tab.addEventListener("keydown", (event) => {
                this.handleKeyDown(event);
            });

            tab.addEventListener("click", (event) => {
                this.handleClick(tab, tabPanel);
            });
        }

        this.firstTab = this.tabs[0];
        this.lastTab = this.tabs[this.tabs.length - 1];

        this.select(this.firstTab);
    }

    preventSelection() {
        this.preventedSelection = true;
    }

    select(selected: number | HTMLElement) {
        if (typeof selected === "number") {
            this.selectByIndex(selected);
        } else {
            this.selectByTab(selected);
        }
    }

    selectByIndex(index: number) {
        this.selectedTab = this.tabs[index];
        this.selectedTabPanel = this.tabPanels[index];
        this.handleSelection();
    }

    selectByTab(selectedTab: HTMLElement) {
        this.selectedTab = selectedTab;
        this.selectedTabPanel = this.tabPanels[this.tabs.indexOf(selectedTab)];
        this.handleSelection();
    }

    private async handleSelection() {
        if (!this.selectedTab || !this.selectedTabPanel) {
            throw Error("Tab selection out of range.");
        }

        if (this.config?.onSelect) {
            await this.config.onSelect(this);
        }

        if (this.preventedSelection) {
            this.preventedSelection = undefined;
            return;
        }

        for (var i = 0; i < this.tabs.length; i += 1) {
            const tab = this.tabs[i];

            if (this.selectedTab === tab) {
                tab.setAttribute("aria-selected", "true");
                tab.removeAttribute("tabindex");
                this.tabPanels[i].removeAttribute("hidden");
                this.currentTab = this.selectedTab;
                this.currentTabPanel = this.selectedTabPanel;
            } else {
                tab.setAttribute("aria-selected", "false");
                tab.tabIndex = -1;
                this.tabPanels[i].setAttribute("hidden", "true");
            }
        }
    }

    private moveFocusToTab(currentTab: HTMLElement) {
        currentTab.focus();
    }

    private moveFocusToPreviousTab(currentTab: HTMLElement) {
        let index;

        if (currentTab === this.firstTab) {
            this.moveFocusToTab(this.lastTab);
        } else {
            index = this.tabs.indexOf(currentTab);
            this.moveFocusToTab(this.tabs[index - 1]);
        }
    }

    private moveFocusToNextTab(currentTab: HTMLElement) {
        let index;

        if (currentTab === this.lastTab) {
            this.moveFocusToTab(this.firstTab);
        } else {
            index = this.tabs.indexOf(currentTab);
            this.moveFocusToTab(this.tabs[index + 1]);
        }
    }

    private handleClick(tab: HTMLElement, tabPanel: HTMLElement) {
        this.selectByTab(tab);
    }

    private handleKeyDown(event: KeyboardEvent) {
        const target = event.currentTarget as HTMLElement;

        let flag = false;

        switch (event.key) {
            case "ArrowLeft":
                this.moveFocusToPreviousTab(target);
                flag = true;
                break;

            case "ArrowRight":
                this.moveFocusToNextTab(target);
                flag = true;
                break;

            case "Home":
                this.moveFocusToTab(this.firstTab);
                flag = true;
                break;

            case "End":
                this.moveFocusToTab(this.lastTab);
                flag = true;
                break;

            default:
                break;
        }

        if (flag) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
}
