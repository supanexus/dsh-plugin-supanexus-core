/** Run `dsh plugin add` from the Host process. */
import type { Config } from '../config.ts';
export interface InstallRunResult {
    readonly ok: boolean;
    readonly exitCode: number;
    readonly stderr: string;
    readonly stdout: string;
    readonly cliCommand: string;
}
/** Resolve CLI entry for `node <entry> plugin --profile …`. */
export declare function resolveCliEntry(config: Config): string;
/** Resolve Node binary for spawning the CLI. */
export declare function resolveNodeBinary(): string;
/** Execute profile plugin install via staged CLI. */
export declare function runProfilePluginInstall(config: Config, spec: string): InstallRunResult;
/** Execute profile plugin remove via staged CLI. */
export declare function runProfilePluginRemove(config: Config, packageName: string): InstallRunResult;
//# sourceMappingURL=install-runner.d.ts.map