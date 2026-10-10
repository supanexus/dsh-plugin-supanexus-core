import { jsx as _jsx } from "react/jsx-runtime";
import { skillMarketT } from "../skill-market/locales.js";
import { SidebarFooterRoot } from "./SidebarFooterRoot.js";
/**
 * Register one stacked footer action (avoids row-flex squeeze of two registrants).
 * Nested inject waits for `uiSession` + `modelDirectories` so WalletRoot can resolve
 * the active provider via `uiSession.adapter.current` (list.current is gone).
 */
export function registerSidebarFooter(ctx, settings) {
    ctx.inject(['uiSession', 'modelDirectories'], (scope) => {
        scope.slots.inject('sidebar.footer.action', () => scope.slots.register({
            name: 'sidebar.footer.action',
            id: 'supanexus-sidebar-footer',
            order: 0,
            label: () => skillMarketT(scope.locale.getSnapshot().active)('nav'),
        }, (props) => _jsx(SidebarFooterRoot, { ctx: scope, settings: settings, ...props })));
    });
}
//# sourceMappingURL=index.js.map
