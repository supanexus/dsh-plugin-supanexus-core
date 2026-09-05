import { useEffect, useState } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'

/** Subscribe to DSH active locale for reactive client copy. */
export function useClientLocale(ctx: ClientContext): string | undefined {
  const [locale, setLocale] = useState(() => ctx.locale.getSnapshot().active)
  useEffect(() => ctx.locale.subscribe(() => {
    setLocale(ctx.locale.getSnapshot().active)
  }), [ctx])
  return locale
}
