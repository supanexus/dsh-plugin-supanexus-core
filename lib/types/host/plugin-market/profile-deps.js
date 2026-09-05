/** Read installed plugin dependency specs from the active DSH profile. */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
const DSH_HOME_ENV = 'DSH_HOME';
function expandHomePath(path) {
    if (path === '~')
        return homedir();
    if (path.startsWith('~/') || path.startsWith('~\\'))
        return join(homedir(), path.slice(2));
    return path;
}
/** Resolve Harness home (`$DSH_HOME` or `~/.dsh`). */
export function resolveDshHome() {
    const env = process.env;
    const fromEnv = env[DSH_HOME_ENV];
    if (fromEnv !== undefined && fromEnv.trim().length > 0) {
        return resolve(expandHomePath(fromEnv.trim()));
    }
    return join(homedir(), '.dsh');
}
/** Resolve one profile directory under Harness home. */
export function resolveProfileDir(profileName) {
    return join(resolveDshHome(), 'profiles', profileName);
}
function packageInstallDir(profileDir, packageName) {
    if (packageName.startsWith('@')) {
        const slash = packageName.indexOf('/');
        return join(profileDir, 'node_modules', packageName.slice(0, slash), packageName.slice(slash + 1));
    }
    return join(profileDir, 'node_modules', packageName);
}
/** Installed package.json `version` when the dependency is materialized under the profile. */
export function readInstalledPackageVersion(profileName, packageName) {
    const profileDir = resolveProfileDir(profileName);
    const packageJsonPath = join(packageInstallDir(profileDir, packageName), 'package.json');
    if (!existsSync(packageJsonPath))
        return undefined;
    try {
        const manifest = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const version = manifest.version?.trim();
        return version !== undefined && version.length > 0 ? version : undefined;
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=profile-deps.js.map