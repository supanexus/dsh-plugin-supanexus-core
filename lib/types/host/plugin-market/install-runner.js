/** Run `dsh plugin add` from the Host process. */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
function nodeProcess() {
    return process;
}
function envString(key) {
    const value = nodeProcess().env[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
/** Resolve CLI entry for `node <entry> plugin --profile …`. */
export function resolveCliEntry(config) {
    if (config.dshCliEntry.length > 0) {
        if (!existsSync(config.dshCliEntry)) {
            throw new Error(`DSH CLI 入口不存在：${config.dshCliEntry}`);
        }
        return config.dshCliEntry;
    }
    const fromEnv = envString('DSH_CLI_ENTRY');
    if (fromEnv !== undefined && existsSync(fromEnv))
        return fromEnv;
    const workdir = nodeProcess().cwd();
    const candidates = [
        join(workdir, 'apps/cli/lib/bin.js'),
        join(workdir, 'engine/apps/cli/lib/bin.js'),
        join(workdir, '../engine/apps/cli/lib/bin.js'),
        join(workdir, '../../engine/apps/cli/lib/bin.js'),
    ];
    for (const candidate of candidates) {
        if (existsSync(candidate))
            return candidate;
    }
    throw new Error('DSH CLI 未找到。请设置 DSH_CLI_ENTRY 或先在 engine 目录执行 pnpm run build。');
}
/** Resolve Node binary for spawning the CLI. */
export function resolveNodeBinary() {
    return envString('WHALE_DSH_NODE') ?? envString('DSH_NODE') ?? nodeProcess().execPath;
}
/** Execute profile plugin install via staged CLI. */
export function runProfilePluginInstall(config, spec) {
    return runProfilePluginCommand(config, 'add', spec);
}
/** Execute profile plugin remove via staged CLI. */
export function runProfilePluginRemove(config, packageName) {
    return runProfilePluginCommand(config, 'remove', packageName);
}
function runProfilePluginCommand(config, subcommand, target) {
    const cliEntry = resolveCliEntry(config);
    const nodeBinary = resolveNodeBinary();
    const profile = config.profileName;
    const engineCwd = join(cliEntry, '..', '..', '..');
    const args = [cliEntry, 'plugin', '--profile', profile, subcommand, target];
    const cliCommand = `${nodeBinary} ${args.join(' ')}`;
    const result = spawnSync(nodeBinary, args, {
        cwd: existsSync(engineCwd) ? engineCwd : nodeProcess().cwd(),
        encoding: 'utf8',
        shell: nodeProcess().platform === 'win32',
    });
    const exitCode = result.status ?? 1;
    const stderr = typeof result.stderr === 'string' ? result.stderr : '';
    const stdout = typeof result.stdout === 'string' ? result.stdout : '';
    if (result.error !== undefined) {
        const code = result.error.code;
        if (code === 'ENOENT') {
            return {
                ok: false,
                exitCode: 127,
                stderr: 'pnpm 或 node 未找到，请确认已安装 pnpm 并可在 PATH 中调用。',
                stdout,
                cliCommand,
            };
        }
        return {
            ok: false,
            exitCode,
            stderr: result.error.message,
            stdout,
            cliCommand,
        };
    }
    return { ok: exitCode === 0, exitCode, stderr, stdout, cliCommand };
}
//# sourceMappingURL=install-runner.js.map