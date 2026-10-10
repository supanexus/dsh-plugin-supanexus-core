/** Register the SupaNexus card on the Plugins page. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import { type SupaNexusUiSettings } from '../../shared/settings-contract.ts';
import { zh } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'supanexus.settings': keyof typeof zh;
    }
}
/** Register `plugins.item` while Host serves the SupaNexus volatile Config. */
export declare function registerPluginSettings(ctx: ClientContext, scope: ConfigForm<SupaNexusUiSettings>): void;
//# sourceMappingURL=index.d.ts.map