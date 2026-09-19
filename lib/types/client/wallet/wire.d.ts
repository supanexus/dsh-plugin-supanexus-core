/** Browser fetch wrappers for wallet Host API routes. */
import { type WalletBalanceResponse, type WalletStatusResponse } from '../../shared/wallet-contract.ts';
/** Normalize Host wallet payloads so missing subscription fields never crash UI. */
export declare function normalizeWalletStatus(raw: WalletStatusResponse): WalletStatusResponse;
/** Normalize Host balance payloads for older Host builds without points fields. */
export declare function normalizeWalletBalance(raw: WalletBalanceResponse): WalletBalanceResponse;
/** Probe whether SupaNexus credentials exist (sidebar visibility). */
export declare function fetchWalletStatus(): Promise<WalletStatusResponse>;
/** Fetch organization balance via Host (refresh + wallet). */
export declare function fetchWalletBalance(locale?: string): Promise<WalletBalanceResponse>;
//# sourceMappingURL=wire.d.ts.map