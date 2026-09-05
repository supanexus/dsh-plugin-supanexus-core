import { SUPANEXUS_SETTINGS_NS, } from "../shared/settings-contract.js";
import { registerBrand } from "./brand/index.js";
import { registerHero } from "./hero/index.js";
import { registerPluginSettings } from "./settings/index.js";
import { registerQuickSetup } from "./quick-setup/index.js";
import { registerSidebarFooter } from "./sidebar-footer/index.js";
/** Required client services. */
export const inject = [
    'slots',
    'remote',
    'remote.settings',
    'remote.pluginInventory',
    'locale',
    'connection',
    'settingsScope',
];
/**
 * Register all SupaNexus client features (orchestration only).
 * @param ctx - Client root context.
 */
export function apply(ctx) {
    const settings = ctx.settingsScope.bind({
        namespace: SUPANEXUS_SETTINGS_NS,
    });
    registerBrand(ctx, settings);
    registerHero(ctx, settings);
    registerQuickSetup(ctx);
    registerPluginSettings(ctx, settings);
    registerSidebarFooter(ctx, settings);
}
//# sourceMappingURL=index.js.map