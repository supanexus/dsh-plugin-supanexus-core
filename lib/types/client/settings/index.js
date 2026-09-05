import { jsx as _jsx } from "react/jsx-runtime";
import { SUPANEXUS_SETTINGS_NS, } from "../../shared/settings-contract.js";
import { SupaNexusSettingsCard } from "./SupaNexusSettingsCard.js";
/** Register `settings.plugin.item` keyed by the Host `supanexus` namespace. */
export function registerPluginSettings(ctx, scope) {
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
        name: 'settings.plugin.item',
        key: SUPANEXUS_SETTINGS_NS,
    }, (props) => _jsx(SupaNexusSettingsCard, { ctx: ctx, scope: scope, ...props })));
}
//# sourceMappingURL=index.js.map