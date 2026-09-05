/** Derive whether the sidebar wallet should render. */

import { PROVIDER_ROUTE_ID } from '../../shared/provider.ts'

/**
 * Show wallet when the user preference allows it, SupaNexus is connected,
 * and the active session model provider is the SupaNexus route (`supanexus`).
 */
export function shouldShowWallet(
  connected: boolean,
  provider: string | null | undefined,
  showWallet = false,
): boolean {
  return showWallet && connected && provider === PROVIDER_ROUTE_ID
}
