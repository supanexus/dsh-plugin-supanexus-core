/** Host ↔ Client contract for SupaNexus wallet / budget deep-link. */
/** Lightweight connection probe for sidebar visibility. */
export declare const WALLET_STATUS_PATH: "/api/supanexus.wallet.status";
/** Fetch organization balance (Host refreshes harness session first). */
export declare const WALLET_PATH: "/api/supanexus.wallet";
/** Console path for spend budget / usage policies. */
export declare const USAGE_POLICIES_PATH: "/usage-policies";
/** Minimum Client poll interval for wallet (Harness rate-limit guidance). */
export declare const WALLET_POLL_MS: 60000;
/** Build the console spend-budget URL from a configured origin. */
export declare function buildUsagePoliciesUrl(consoleOrigin: string): string;
/** Host status body: whether SupaNexus credentials exist. */
export interface WalletStatusResponse {
    readonly connected: boolean;
    readonly usagePoliciesUrl: string;
    readonly keyPrefix?: string;
}
/** Successful wallet balance payload. */
export interface WalletBalanceData {
    readonly organizationId: string;
    readonly name: string;
    readonly availableBalance: string;
    readonly currency: string;
    readonly usagePoliciesUrl: string;
    readonly keyPrefix?: string;
}
/** Wallet fetch success body. */
export type WalletBalanceResponse = WalletBalanceData & {
    readonly connected: true;
};
/** Error codes returned on wallet failures (Client branching). */
export declare const WALLET_ERROR: {
    readonly notConnected: "wallet.not_connected";
    readonly sessionRevoked: "wallet.session_revoked";
    readonly noDevice: "wallet.no_device";
};
//# sourceMappingURL=wallet-contract.d.ts.map