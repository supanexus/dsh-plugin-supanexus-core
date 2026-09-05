import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts';
export interface SidebarFooterRootProps extends PropsRuntime<'sidebar.footer.action'> {
    readonly ctx: ClientContext;
    readonly settings: SettingsScope<SupaNexusUiSettings>;
}
/**
 * One footer occupant stacking wallet + skill market vertically.
 * Official `.footerActions` is a row flex; two separate registrants sit side-by-side and squeeze each other.
 */
export declare function SidebarFooterRoot(props: SidebarFooterRootProps): import("react").JSX.Element;
//# sourceMappingURL=SidebarFooterRoot.d.ts.map