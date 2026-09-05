/** Browser fetch wrappers for SupaNexus host API routes. */
import { type AuthStartResponse, type AuthStatusResponse } from '../../shared/auth-contract.ts';
/** Start OAuth flow; host silently probes lines before returning authorize URL. */
export declare function startAuth(locale?: string): Promise<AuthStartResponse>;
/** Poll auth flow status. */
export declare function fetchAuthStatus(flowId: string): Promise<AuthStatusResponse>;
//# sourceMappingURL=wire.d.ts.map