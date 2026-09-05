import type { SupaLine } from './line.ts';
/** Connection fetch routes (GET only). */
export declare const AUTH_START_PATH: "/api/supanexus.auth.start";
export declare const AUTH_STATUS_PATH: "/api/supanexus.auth.status";
/** Auth flow phases exposed to the browser. */
export type AuthPhase = 'awaiting-approval' | 'exchanging' | 'credential' | 'done' | 'error';
/** Request modalities a SupaNexus model may accept (pi-ai `input` field). */
export type ProviderModelInput = 'text' | 'image';
/** One model entry for the provider profile. */
export interface ProviderModelEntry {
    readonly id: string;
    readonly name?: string;
    readonly contextWindow?: number;
    /** When set, written into `llm-pi-ai` as `models[].input` (Vision gate). */
    readonly input?: readonly ProviderModelInput[];
}
/** Successful auth.start response. */
export interface AuthStartResponse {
    readonly flowId: string;
    readonly authorizeUrl: string;
    readonly line: SupaLine;
    readonly latencyMs: number;
}
/** Per-line probe row. */
export interface LineProbeEntry {
    readonly line: SupaLine;
    readonly latencyMs: number | null;
    readonly reachable: boolean;
}
/** auth.status success body. */
export interface AuthStatusResponse {
    readonly phase: AuthPhase;
    readonly flowId?: string;
    readonly authorizeUrl?: string;
    readonly line?: SupaLine;
    readonly latencyMs?: number;
    readonly baseURL?: string;
    readonly models?: readonly ProviderModelEntry[];
    readonly credentialRef?: string;
    readonly message?: string;
}
/** JSON error body for plugin API routes. */
export interface ApiErrorResponse {
    readonly ok: false;
    readonly message: string;
    readonly code?: string;
}
export type ApiResponse<T> = T | ApiErrorResponse;
export declare function apiOk<T>(data: T): T & {
    readonly ok: true;
};
export declare function apiErr(message: string, code?: string): ApiErrorResponse;
//# sourceMappingURL=auth-contract.d.ts.map