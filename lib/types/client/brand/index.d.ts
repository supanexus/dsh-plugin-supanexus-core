/** Brand slot registration for SupaNexus. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/**
 * When `showBrand` is on: occupy brand slots (priority -1 shadows DSH official / shell).
 * When off: dispose occupants so `ui-brand-official` or sidebar fallbacks render again.
 */
export declare function registerBrand(ctx: ClientContext, scope: SettingsScope<SupaNexusUiSettings>): void;
//# sourceMappingURL=index.d.ts.map