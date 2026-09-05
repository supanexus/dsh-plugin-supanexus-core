import { jsx as _jsx } from "react/jsx-runtime";
import { skillMarketT } from "../skill-market/locales.js";
import { SidebarFooterRoot } from "./SidebarFooterRoot.js";
/** Register one stacked footer action (avoids row-flex squeeze of two registrants). */
export function registerSidebarFooter(ctx, settings) {
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'supanexus-sidebar-footer',
        order: 0,
        label: () => skillMarketT(ctx.locale.getSnapshot().active)('nav'),
    }, (props) => _jsx(SidebarFooterRoot, { ctx: ctx, settings: settings, ...props })));
}
//# sourceMappingURL=index.js.map