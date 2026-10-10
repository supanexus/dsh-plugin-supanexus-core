/** Combined sidebar footer: balance + skill market (single slot occupant). */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
/**
 * Register one stacked footer action (avoids row-flex squeeze of two registrants).
 * Nested inject waits for `sessions` + `modelDirectories` so WalletRoot can resolve
 * the active provider (otherwise the hook exits once and the balance stays hidden).
 */
export declare function registerSidebarFooter(ctx: ClientContext, settings: ConfigForm<SupaNexusUiSettings>): void;
//# sourceMappingURL=index.d.ts.map