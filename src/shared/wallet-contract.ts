/** Host ↔ Client contract for SupaNexus wallet / budget deep-link. */

/** Lightweight connection probe for sidebar visibility. */
export const WALLET_STATUS_PATH = '/api/supanexus.wallet.status' as const

/** Fetch organization balance (Host refreshes harness session first). */
export const WALLET_PATH = '/api/supanexus.wallet' as const

/** Console path for spend budget / usage policies. */
export const USAGE_POLICIES_PATH = '/usage-policies' as const

/** Minimum Client poll interval for wallet (Harness rate-limit guidance). */
export const WALLET_POLL_MS = 60_000 as const

/** Build the console spend-budget URL from a configured origin. */
export function buildUsagePoliciesUrl(consoleOrigin: string): string {
  const base = consoleOrigin.replace(/\/+$/, '')
  return `${base}${USAGE_POLICIES_PATH}`
}

/** Host status body: whether SupaNexus credentials exist. */
export interface WalletStatusResponse {
  readonly connected: boolean
  /** False when live API key no longer matches OAuth-stored keyPrefix. */
  readonly credentialAligned: boolean
  readonly usagePoliciesUrl: string
  readonly keyPrefix?: string
}

/** Successful wallet balance payload. */
export interface WalletBalanceData {
  readonly organizationId: string
  readonly name: string
  readonly availableBalance: string
  readonly currency: string
  readonly subscriptionActive: boolean
  readonly pointsRemaining: string
  readonly pointsGranted: string
  readonly planCode: string
  readonly planName: string
  readonly subscriptionStatus: string
  readonly nextPointsResetAtUnix: number
  readonly periodEndUnix: number
  readonly usagePoliciesUrl: string
  readonly keyPrefix?: string
}

/** Wallet fetch success body. */
export type WalletBalanceResponse = WalletBalanceData & {
  readonly connected: true
}

/** Error codes returned on wallet failures (Client branching). */
export const WALLET_ERROR = {
  notConnected: 'wallet.not_connected',
  sessionRevoked: 'wallet.session_revoked',
  noDevice: 'wallet.no_device',
  credentialMismatch: 'wallet.credential_mismatch',
} as const

/** Sidebar trigger rotation interval (points ↔ balance). */
export const WALLET_TRIGGER_ROTATE_MS = 4_000 as const
