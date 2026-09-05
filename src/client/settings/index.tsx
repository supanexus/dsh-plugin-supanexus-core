/** Register the SupaNexus card on the Plugins settings tab. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from './slot-contract.ts'
import {
  SUPANEXUS_SETTINGS_NS,
  type SupaNexusUiSettings,
} from '../../shared/settings-contract.ts'
import { SupaNexusSettingsCard } from './SupaNexusSettingsCard.tsx'

/** Register `settings.plugin.item` keyed by the Host `supanexus` namespace. */
export function registerPluginSettings(
  ctx: ClientContext,
  scope: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: SUPANEXUS_SETTINGS_NS,
  }, (props) => <SupaNexusSettingsCard ctx={ctx} scope={scope} {...props} />))
}
