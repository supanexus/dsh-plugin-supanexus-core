/** Settings namespace shared by Host registration and Client cards. */

export const SUPANEXUS_SETTINGS_NS = 'supanexus' as const

/** Field that controls sidebar balance visibility. */
export const SHOW_WALLET_FIELD = 'showWallet' as const

/** Field that controls SupaNexus brand chrome (sidebar + hero + tab). */
export const SHOW_BRAND_FIELD = 'showBrand' as const

/** Field that pins the platform region (`global` | `cn`). */
export const PINNED_LINE_FIELD = 'pinnedLine' as const

/** Client-facing subset of the `supanexus` settings section. */
export interface SupaNexusUiSettings {
  /** Sidebar balance entry (default false on first install). */
  showWallet: boolean
  /** SupaNexus brand mark / name / hero / tab patches (default true). */
  showBrand: boolean
  /** Active dual-line id after connect / auto-select (`global` | `cn`). */
  resolvedLine?: string
  /** User-selected region preference (`global` | `cn`); drives auth / console / wallet. */
  pinnedLine?: string
}
