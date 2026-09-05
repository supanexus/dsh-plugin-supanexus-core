/** Browser fetch wrappers for wallet Host API routes. */
import { type WalletBalanceResponse, type WalletStatusResponse } from '../../shared/wallet-contract.ts';
/** Probe whether SupaNexus credentials exist (sidebar visibility). */
export declare function fetchWalletStatus(): Promise<WalletStatusResponse>;
/** Fetch organization balance via Host (refresh + wallet). */
export declare function fetchWalletBalance(locale?: string): Promise<WalletBalanceResponse>;
//# sourceMappingURL=wire.d.ts.map