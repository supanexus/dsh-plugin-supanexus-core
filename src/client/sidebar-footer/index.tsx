/** Combined sidebar footer: balance + skill market (single slot occupant). */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { skillMarketT } from '../skill-market/locales.ts'
import { SidebarFooterRoot } from './SidebarFooterRoot.tsx'

/** Register one stacked footer action (avoids row-flex squeeze of two registrants). */
export function registerSidebarFooter(
  ctx: ClientContext,
  settings: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'supanexus-sidebar-footer',
    order: 0,
    label: () => skillMarketT(ctx.locale.getSnapshot().active)('nav'),
  }, (props) => <SidebarFooterRoot ctx={ctx} settings={settings} {...props} />))
}
