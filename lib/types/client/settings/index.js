import { jsx as _jsx } from "react/jsx-runtime";
import { SUPANEXUS_SETTINGS_NS, } from "../../shared/settings-contract.js";
import { SupaNexusSettingsCard } from "./SupaNexusSettingsCard.js";
import { en, zh } from "./locales.js";
const LOCALE_NS = 'supanexus.settings';
/** Register `plugins.item` while Host serves the SupaNexus volatile Config. */
export function registerPluginSettings(ctx, scope) {
    const t = ctx.locale.bind(LOCALE_NS);
    ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'supanexus-core: settings dictionaries');
    ctx.effect(() => ctx.configForms.whileServed([SUPANEXUS_SETTINGS_NS], () => ctx.slots.inject('plugins.item', () => ctx.slots.register({
        name: 'plugins.item',
        id: 'supanexus',
        order: 5,
        label: () => t('title'),
        locale: LOCALE_NS,
    }, (props) => (_jsx(SupaNexusSettingsCard, { ctx: ctx, scope: scope, ...props }))))), 'supanexus-core: plugins.item');
}
//# sourceMappingURL=index.js.map