/** Combined sidebar footer: balance + skill market (single slot occupant). */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-model-selection/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { skillMarketT } from '../skill-market/locales.ts'
import { SidebarFooterRoot } from './SidebarFooterRoot.tsx'

/**
 * Register one stacked footer action (avoids row-flex squeeze of two registrants).
 * Nested inject waits for `uiSession` + `modelDirectories` so WalletRoot can resolve
 * the active provider via `uiSession.adapter.current` (list.current is gone).
 */
export function registerSidebarFooter(
  ctx: ClientContext,
  settings: ConfigForm<SupaNexusUiSettings>,
): void {
  ctx.inject(['uiSession', 'modelDirectories'], (scope) => {
    scope.slots.inject('sidebar.footer.action', () => scope.slots.register({
      name: 'sidebar.footer.action',
      id: 'supanexus-sidebar-footer',
      order: 0,
      label: () => skillMarketT(scope.locale.getSnapshot().active)('nav'),
    }, (props) => <SidebarFooterRoot ctx={scope} settings={settings} {...props} />))
  })
}
