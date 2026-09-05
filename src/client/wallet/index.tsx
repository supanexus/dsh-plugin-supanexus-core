/** Wallet sidebar entry + modal. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { WalletRoot } from './WalletRoot.tsx'
import { walletT } from './locales.ts'

/**
 * Register the sidebar footer wallet action alone.
 * Prefer {@link registerSidebarFooter} which stacks wallet + skill market.
 */
export function registerWallet(
  ctx: ClientContext,
  settings: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'supanexus-wallet',
    order: -10,
    label: () => walletT(ctx.locale.getSnapshot().active)('nav'),
  }, (props) => <WalletRoot ctx={ctx} settings={settings} {...props} />))
}
