import { jsx as _jsx } from "react/jsx-runtime";
import { WalletRoot } from "./WalletRoot.js";
import { walletT } from "./locales.js";
/**
 * Register the sidebar footer wallet action alone.
 * Prefer {@link registerSidebarFooter} which stacks wallet + skill market.
 */
export function registerWallet(ctx, settings) {
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'supanexus-wallet',
        order: -10,
        label: () => walletT(ctx.locale.getSnapshot().active)('nav'),
    }, (props) => _jsx(WalletRoot, { ctx: ctx, settings: settings, ...props })));
}
//# sourceMappingURL=index.js.map