import { jsx as _jsx } from "react/jsx-runtime";
import { SkillMarketRoot } from "./SkillMarketRoot.js";
import { skillMarketT } from "./locales.js";
/**
 * Register the sidebar footer skill market action alone.
 * Prefer {@link registerSidebarFooter} which stacks wallet + skill market.
 */
export function registerSkillMarket(ctx, settings) {
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'supanexus-skill-market',
        order: 0,
        label: () => skillMarketT(ctx.locale.getSnapshot().active)('nav'),
    }, (props) => _jsx(SkillMarketRoot, { ctx: ctx, settings: settings, ...props })));
}
//# sourceMappingURL=index.js.map