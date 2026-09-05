import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { type SupaNexusUiSettings } from '../../shared/settings-contract.ts';
export interface SupaNexusSettingsCardProps extends PropsRuntime<'settings.plugin.item'> {
    readonly ctx: ClientContext;
    readonly scope: SettingsScope<SupaNexusUiSettings>;
}
/** Plugin-config card: region + balance + brand visibility. */
export declare function SupaNexusSettingsCard(props: SupaNexusSettingsCardProps): import("react").JSX.Element | null;
//# sourceMappingURL=SupaNexusSettingsCard.d.ts.map