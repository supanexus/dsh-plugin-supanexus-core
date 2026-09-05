import type { Context as ClientContext } from '@deepseek-ai/cordis';
export type QuickSetupPhase = 'idle' | 'starting' | 'awaiting-approval' | 'writing' | 'done' | 'error';
export interface UseQuickSetupOptions {
    readonly ctx: ClientContext;
    readonly locale: string | undefined;
}
export interface QuickSetupState {
    readonly phase: QuickSetupPhase;
    readonly flowId: string | undefined;
    readonly authorizeUrl: string | undefined;
    readonly message: string | undefined;
    readonly start: () => Promise<void>;
    readonly reopenAuth: () => void;
}
/** Quick-setup state machine: authorize → poll → write provider (line probe runs on host). */
export declare function useQuickSetup(options: UseQuickSetupOptions): QuickSetupState;
//# sourceMappingURL=useQuickSetup.d.ts.map