import type { PluginInstallAttempt } from '../../shared/plugin-market-contract.ts';
export declare class InstallPluginError extends Error {
    readonly attempts?: readonly PluginInstallAttempt[];
    readonly log?: string;
    constructor(message: string, options?: {
        readonly attempts?: readonly PluginInstallAttempt[];
        readonly log?: string;
    });
}
//# sourceMappingURL=install-error.d.ts.map