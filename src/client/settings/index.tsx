/** Register the SupaNexus card on the Plugins page. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import {
  SUPANEXUS_SETTINGS_NS,
  type SupaNexusUiSettings,
} from '../../shared/settings-contract.ts'
import { SupaNexusSettingsCard } from './SupaNexusSettingsCard.tsx'
import { en, zh } from './locales.ts'

const LOCALE_NS = 'supanexus.settings'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'supanexus.settings': keyof typeof zh
  }
}

/** Register `plugins.item` while Host serves the SupaNexus volatile Config. */
export function registerPluginSettings(
  ctx: ClientContext,
  scope: ConfigForm<SupaNexusUiSettings>,
): void {
  const t = ctx.locale.bind(LOCALE_NS)
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'supanexus-core: settings dictionaries')
  ctx.effect(() => ctx.configForms.whileServed([SUPANEXUS_SETTINGS_NS], () => ctx.slots.inject('plugins.item', () => ctx.slots.register({
    name: 'plugins.item',
    id: 'supanexus',
    order: 5,
    label: () => t('title'),
    locale: LOCALE_NS,
  }, (props) => (
    <SupaNexusSettingsCard ctx={ctx} scope={scope} {...props} />
  )))), 'supanexus-core: plugins.item')
}
