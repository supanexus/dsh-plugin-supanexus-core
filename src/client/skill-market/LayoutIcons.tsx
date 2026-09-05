export function GridCols3Icon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="3" height="10" rx="0.8" fill="currentColor" />
      <rect x="6.5" y="3" width="3" height="10" rx="0.8" fill="currentColor" />
      <rect x="11" y="3" width="3" height="10" rx="0.8" fill="currentColor" />
    </svg>
  )
}

export function ListCol1Icon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="2.6" rx="0.6" fill="currentColor" />
      <rect x="2" y="6.7" width="12" height="2.6" rx="0.6" fill="currentColor" />
      <rect x="2" y="10.4" width="12" height="2.6" rx="0.6" fill="currentColor" />
    </svg>
  )
}
