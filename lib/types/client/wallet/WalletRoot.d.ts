import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
export interface WalletRootProps extends PropsRuntime<'sidebar.footer.action'> {
    readonly ctx: ClientContext;
    readonly settings: SettingsScope<SupaNexusUiSettings>;
}
/**
 * Sidebar balance row (amount as label) + detail modal.
 * Visible when the plugin setting allows it, SupaNexus is connected, and the
 * active session's model provider is `supanexus`.
 */
export declare function WalletRoot({ wide, ctx, settings }: WalletRootProps): import("react").JSX.Element | null;
//# sourceMappingURL=WalletRoot.d.ts.map