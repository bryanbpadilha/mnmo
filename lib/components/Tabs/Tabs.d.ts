import type { TSelector } from "../../util/types";
interface ITabsConfig {
    onSelect?: (tabs: Tabs) => void | Promise<void>;
}
export declare class Tabs {
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
export {};
