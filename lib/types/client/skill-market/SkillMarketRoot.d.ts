import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
export interface SkillMarketRootProps extends PropsRuntime<'sidebar.footer.action'> {
    readonly ctx: ClientContext;
    readonly settings: SettingsScope<SupaNexusUiSettings>;
}
/** Sidebar footer trigger + skill market modal. */
export declare function SkillMarketRoot({ wide, ctx, settings }: SkillMarketRootProps): import("react").JSX.Element;
//# sourceMappingURL=SkillMarketRoot.d.ts.map