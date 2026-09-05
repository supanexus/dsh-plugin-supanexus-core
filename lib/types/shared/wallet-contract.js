/** Host ↔ Client contract for SupaNexus wallet / budget deep-link. */
/** Lightweight connection probe for sidebar visibility. */
export const WALLET_STATUS_PATH = '/api/supanexus.wallet.status';
/** Fetch organization balance (Host refreshes harness session first). */
export const WALLET_PATH = '/api/supanexus.wallet';
/** Console path for spend budget / usage policies. */
export const USAGE_POLICIES_PATH = '/usage-policies';
/** Minimum Client poll interval for wallet (Harness rate-limit guidance). */
export const WALLET_POLL_MS = 60_000;
/** Build the console spend-budget URL from a configured origin. */
export function buildUsagePoliciesUrl(consoleOrigin) {
    const base = consoleOrigin.replace(/\/+$/, '');
    return `${base}${USAGE_POLICIES_PATH}`;
}
/** Error codes returned on wallet failures (Client branching). */
export const WALLET_ERROR = {
    notConnected: 'wallet.not_connected',
    sessionRevoked: 'wallet.session_revoked',
    noDevice: 'wallet.no_device',
};
//# sourceMappingURL=wallet-contract.js.map