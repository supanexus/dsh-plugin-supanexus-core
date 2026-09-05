/** Models footer quick-setup feature. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings-models/client'
import { QuickSetupCard } from './QuickSetupCard.tsx'

/** Register the Models settings footer quick-setup card. */
export function registerQuickSetup(ctx: ClientContext): void {
  const locale = ctx.locale.getSnapshot().active
  ctx.slots.inject('settings.models.footer', () => ctx.slots.register({
    name: 'settings.models.footer',
    id: 'supanexus-quick-setup',
    order: 0,
  }, () => <QuickSetupCard ctx={ctx} locale={locale} />))
}
