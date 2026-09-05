/** `supanexus` settings namespace registration. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const SUPANEXUS_NS: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Persisted plugin state (not provider profile — that lives in llm-pi-ai). */
export interface SupaNexusSettings {
    deviceName: string;
    deviceId: string;
    resolvedLine: string;
    resolvedAt: number;
    latencyMs: number;
    pinnedLine: string;
    apiKeyId: string;
    keyPrefix: string;
    connectedAt: number;
    /** When false, hide the sidebar balance module (default false on first install). */
    showWallet: boolean;
    /** When false, hide SupaNexus brand chrome (default true). */
    showBrand: boolean;
}
export declare const SupaNexusSettingsSchema: z<SupaNexusSettings>;
export declare const DEFAULT_SETTINGS: SupaNexusSettings;
/** Register the supanexus settings section when the settings service is available. */
export declare function registerSettingsNamespace(ctx: Context): void;
//# sourceMappingURL=namespace.d.ts.map