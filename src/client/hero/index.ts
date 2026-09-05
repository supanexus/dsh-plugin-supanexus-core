/** Hero headline DOM patches until official slots ship. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'
import { readShowBrand } from '../settings/useShowWalletPref.ts'
import { clearHeroChrome, watchHeroChromePatches } from './patchHeroHeadline.ts'

/** Watch and patch hero chrome copy when brand styling is enabled. */
export function registerHero(
  ctx: ClientContext,
  scope: SettingsScope<SupaNexusUiSettings>,
): void {
  ctx.effect(() => {
    let stopPatches: (() => void) | undefined
    const sync = () => {
      stopPatches?.()
      stopPatches = undefined
      if (readShowBrand(scope)) {
        stopPatches = watchHeroChromePatches()
      } else if (typeof document !== 'undefined' && document.body !== null) {
        clearHeroChrome(document.body)
      }
    }
    sync()
    const unsub = scope.subscribe(sync)
    return () => {
      unsub()
      stopPatches?.()
    }
  }, 'supanexus-core: hero-chrome')
}
