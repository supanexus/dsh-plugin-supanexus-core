/** Brand slot registration for SupaNexus. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { readShowBrand } from '../settings/useShowWalletPref.ts'
import { SupaNexusBrandMark, SupaNexusBrandNameSlot } from './Brand.tsx'
import { clearTabBranding, watchTabBrandingPatches } from './patchShellBranding.ts'

/**
 * When `showBrand` is on: occupy brand slots (priority -1 shadows DSH official / shell).
 * When off: dispose occupants so `ui-brand-official` or sidebar fallbacks render again.
 */
export function registerBrand(
  ctx: ClientContext,
  scope: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.effect(() => {
    let disposeSlots: (() => void) | undefined
    let stopPatches: (() => void) | undefined

    const sync = () => {
      disposeSlots?.()
      disposeSlots = undefined
      stopPatches?.()
      stopPatches = undefined

      if (!readShowBrand(scope)) {
        clearTabBranding()
        return
      }

      stopPatches = watchTabBrandingPatches()
      disposeSlots = ctx.slots.inject('sidebar.brand.mark', () =>
        ctx.slots.inject('sidebar.brand.name', () =>
          ctx.slots.inject('conversation.hero.brand.mark', function* () {
            yield ctx.slots.register({
              name: 'sidebar.brand.mark',
              priority: -1,
              registrant: '@supanexus/dsh-plugin-supanexus-core',
            }, SupaNexusBrandMark)
            yield ctx.slots.register({
              name: 'sidebar.brand.name',
              priority: -1,
              registrant: '@supanexus/dsh-plugin-supanexus-core',
            }, () => <SupaNexusBrandNameSlot ctx={ctx} />)
            yield ctx.slots.register({
              name: 'conversation.hero.brand.mark',
              priority: -1,
              registrant: '@supanexus/dsh-plugin-supanexus-core',
            }, SupaNexusBrandMark)
          })))
    }

    sync()
    const unsub = scope.subscribe(sync)
    return () => {
      unsub()
      stopPatches?.()
      disposeSlots?.()
      clearTabBranding()
    }
  }, 'supanexus-core: brand')
}
