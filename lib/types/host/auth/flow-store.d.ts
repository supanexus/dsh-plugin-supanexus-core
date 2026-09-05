/** In-memory OAuth flow state (one flow per quick-setup attempt). */
import type { AuthPhase, ProviderModelEntry } from '../../shared/auth-contract.ts';
import type { SupaLine } from '../../shared/line.ts';
export interface FlowResult {
    readonly baseURL: string;
    readonly models: readonly ProviderModelEntry[];
    readonly credentialRef: string;
    readonly line: SupaLine;
}
export interface AuthFlow {
    readonly flowId: string;
    readonly line: SupaLine;
    readonly verifier: string;
    readonly state: string;
    readonly redirectUri: string;
    readonly authorizeUrl: string;
    readonly locale?: string;
    phase: AuthPhase;
    readonly createdAt: number;
    consumed: boolean;
    result?: FlowResult;
    errorMessage?: string;
}
/** Register a new flow; line is immutable for the lifetime of the flow. */
export declare function createFlow(entry: Omit<AuthFlow, 'phase' | 'createdAt' | 'consumed'>): AuthFlow;
/** Lookup by flow id. */
export declare function getFlow(flowId: string): AuthFlow | undefined;
/** Lookup by OAuth state (callback). */
export declare function getFlowByState(state: string): AuthFlow | undefined;
/** Mark state consumed to prevent replay. */
export declare function consumeState(state: string): AuthFlow | undefined;
export declare function setPhase(flowId: string, phase: AuthPhase): void;
export declare function completeFlow(flowId: string, result: FlowResult): void;
export declare function failFlow(flowId: string, message: string): void;
/** Test helper: reset all flows. */
export declare function resetFlows(): void;
//# sourceMappingURL=flow-store.d.ts.map