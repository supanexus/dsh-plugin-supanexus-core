import { useState } from 'react'
import css from './skill-market.module.css'

export function PluginListingIcon({
  url,
  name,
}: {
  readonly url?: string | null | undefined
  readonly name: string
}) {
  const [failed, setFailed] = useState(false)
  const iconUrl = url?.trim()

  if (iconUrl === undefined || iconUrl.length === 0 || failed) {
    return (
      <span className={css.cardIconFallback} aria-hidden>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
      </span>
    )
  }

  return (
    <img
      src={iconUrl}
      alt={name}
      className={css.cardIcon}
      onError={() => { setFailed(true) }}
    />
  )
}
