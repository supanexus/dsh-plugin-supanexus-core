import { jsx as _jsx } from "react/jsx-runtime";
import { QuickSetupCard } from "./QuickSetupCard.js";
/** Register the Models settings footer quick-setup card. */
export function registerQuickSetup(ctx) {
    const locale = ctx.locale.getSnapshot().active;
    ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
        name: 'settings.models.footer',
        id: 'supanexus-quick-setup',
        order: 0,
    }, () => _jsx(QuickSetupCard, { ctx: ctx, locale: locale })));
}
//# sourceMappingURL=index.js.map