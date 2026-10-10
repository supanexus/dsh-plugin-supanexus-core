import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type SupaNexusUiSettings } from '../../shared/settings-contract.ts';
export interface SupaNexusSettingsCardProps extends PropsRuntime<'plugins.item'>, PropsLocale<'supanexus.settings'> {
    readonly ctx: ClientContext;
    readonly scope: ConfigForm<SupaNexusUiSettings>;
}
/** Plugins page contribution: summary one-liner or full settings form. */
export declare function SupaNexusSettingsCard(props: SupaNexusSettingsCardProps): string | import("react").JSX.Element | null;
//# sourceMappingURL=SupaNexusSettingsCard.d.ts.map