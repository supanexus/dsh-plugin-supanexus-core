/** Skill market sidebar entry + modal. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { SkillMarketRoot } from './SkillMarketRoot.tsx'
import { skillMarketT } from './locales.ts'

/**
 * Register the sidebar footer skill market action alone.
 * Prefer {@link registerSidebarFooter} which stacks wallet + skill market.
 */
export function registerSkillMarket(
  ctx: ClientContext,
  settings: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'supanexus-skill-market',
    order: 0,
    label: () => skillMarketT(ctx.locale.getSnapshot().active)('nav'),
  }, (props) => <SkillMarketRoot ctx={ctx} settings={settings} {...props} />))
}
