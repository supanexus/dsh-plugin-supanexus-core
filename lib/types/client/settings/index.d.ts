/** Register the SupaNexus card on the Plugins settings tab. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/** Register `settings.plugin.item` keyed by the Host `supanexus` namespace. */
export declare function registerPluginSettings(ctx: ClientContext, scope: SettingsScope<SupaNexusUiSettings>): void;
//# sourceMappingURL=index.d.ts.map