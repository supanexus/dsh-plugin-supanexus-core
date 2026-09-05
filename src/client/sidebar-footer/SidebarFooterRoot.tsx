import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { SkillMarketRoot } from '../skill-market/SkillMarketRoot.tsx'
import { WalletRoot } from '../wallet/WalletRoot.tsx'
import css from './sidebar-footer.module.css'

export interface SidebarFooterRootProps extends PropsRuntime<'sidebar.footer.action'> {
  readonly ctx: ClientContext
  readonly settings: SettingsScope<SupaNexusUiSettings>
}

/**
 * One footer occupant stacking wallet + skill market vertically.
 * Official `.footerActions` is a row flex; two separate registrants sit side-by-side and squeeze each other.
 */
export function SidebarFooterRoot(props: SidebarFooterRootProps) {
  const { settings, ...rest } = props
  return (
    <div className={css.stack}>
      <WalletRoot {...rest} settings={settings} />
      <SkillMarketRoot {...rest} settings={settings} />
    </div>
  )
}
