/** Wallet sidebar entry + modal. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/**
 * Register the sidebar footer wallet action alone.
 * Prefer {@link registerSidebarFooter} which stacks wallet + skill market.
 */
export declare function registerWallet(ctx: ClientContext, settings: SettingsScope<SupaNexusUiSettings>): void;
//# sourceMappingURL=index.d.ts.map