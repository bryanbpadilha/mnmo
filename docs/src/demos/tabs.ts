import { Tabs } from "../mnmo";
import { createLogger } from "../utils/logger";

export function initTabsDemo() {
    const log = createLogger("#log-tabs");
    const tabs = new Tabs("#demo-tabs", {
        onSelect: async (t: Tabs) => {
            const idx = t.tabs.indexOf(t.selectedTab!);
            log.info("tabs:onSelect", {
                index: idx,
                tabId: t.selectedTab?.id,
                panelId: t.selectedTabPanel?.id,
            });
        },
    });

    // Initial log
    if ((tabs as any).currentTab) {
        const idx = tabs.tabs.indexOf((tabs as any).currentTab);
        log.info("tabs:init", { index: idx });
    }
}
