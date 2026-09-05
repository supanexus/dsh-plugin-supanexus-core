/** Relaunch the current dsh Host process (loopback-only API). */
export interface RestartLaunch {
    readonly file: string;
    readonly args: string[];
    readonly cwd: string;
    readonly viaShell: boolean;
}
export interface RespawnInvocation {
    readonly file: string;
    readonly args: string[];
    readonly viaShell: boolean;
    readonly detached: boolean;
}
export interface HostRestartResult {
    readonly pid: number;
    readonly helperPid: number | undefined;
    readonly logOut: string;
    readonly logErr: string;
}
/** The exact boot invocation the detached restart helper replays. */
export declare function restartLaunch(): RestartLaunch;
/** Platform-correct spawn invocation for the replacement host. */
export declare function respawnInvocation(launch: RestartLaunch, platform?: NodeJS.Platform): RespawnInvocation;
/** Reject proxied or non-loopback restart requests. */
export declare function isDirectLoopbackRequest(request: Request): boolean;
/**
 * Spawn a detached helper that waits for this process to exit and free its port,
 * then relaunch dsh with the same argv/env/cwd.
 */
export declare function scheduleHostRelaunch(kill?: (pid: number, signal: NodeJS.Signals) => void): HostRestartResult;
//# sourceMappingURL=restart-host.d.ts.map