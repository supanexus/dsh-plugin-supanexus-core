/** Write SupaNexus provider profile into engine-standard llm-pi-ai settings. */
import type { ProviderModelEntry } from '../../shared/auth-contract.ts';
interface SettingsNamespaceSummary {
    readonly ns: string;
    readonly revision: number;
}
interface SettingsDescribeValue {
    readonly namespaces: ReadonlyArray<SettingsNamespaceSummary>;
}
type RemoteResult<T> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: {
        readonly message: string;
        readonly code?: string;
    };
};
/** Minimal settings remote face used by quick-setup writes. */
export interface SettingsWriteRemote {
    describe(): Promise<RemoteResult<SettingsDescribeValue>>;
    mutate(ns: string, ops: ReadonlyArray<{
        op: string;
        path: readonly string[];
        value?: unknown;
    }>, expectedRevision: number | undefined): Promise<RemoteResult<unknown>>;
}
export interface ProviderWriteInput {
    readonly baseURL: string;
    readonly models: readonly ProviderModelEntry[];
}
/** Create or replace the supanexus provider row (credentials already on Host). */
export declare function writeSupaNexusProvider(settings: SettingsWriteRemote, input: ProviderWriteInput): Promise<void>;
export {};
//# sourceMappingURL=provider-write.d.ts.map