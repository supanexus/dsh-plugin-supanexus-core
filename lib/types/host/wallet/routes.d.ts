/** Host routes for wallet status + balance (Harness refresh + wallet). */
import type { Context } from '@deepseek-ai/cordis';
import type { Config } from '../config.ts';
/** Test helper: clear in-memory access token cache. */
export declare function resetWalletAccessCache(): void;
/** Register wallet status and balance Host API routes. */
export declare function registerWalletRoutes(ctx: Context, config: Config): void;
//# sourceMappingURL=routes.d.ts.map