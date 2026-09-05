/** Plugin plaza (skill market) shared contract — types, paths, install spec helpers. */
export const PLUGIN_LISTINGS_PATH = '/api/supanexus.plugin-listings';
export const PLUGIN_CATEGORIES_PATH = '/api/supanexus.plugin-categories';
/** GET with `?installCode=` — connection.fetch only supports GET/HEAD. */
export const PLUGIN_INSTALL_PATH = '/api/supanexus.plugin-install';
/** GET — loopback-only Host relaunch for web / local dsh web. */
export const RESTART_HOST_PATH = '/api/supanexus.restart-host';
/** GET with `?packageName=` — remove an installed plugin from the profile. */
export const PLUGIN_UNINSTALL_PATH = '/api/supanexus.plugin-uninstall';
/** GET with `?installCodes=` — batch upgrade hints for installed plugins. */
export const PLUGIN_UPGRADE_STATUS_PATH = '/api/supanexus.plugin-upgrade-status';
/** GET with `?installCode=` — fetch remote package.json version at operational ref. */
export const PLUGIN_REMOTE_VERSION_PATH = '/api/supanexus.plugin-remote-version';
/** GET with `?packageNames=` — batch enabled/disabled state from user patch layer. */
export const PLUGIN_TOGGLE_STATUS_PATH = '/api/supanexus.plugin-toggle-status';
/** GET with `?packageName=&enabled=` — enable/disable via cordis.patch.yml. */
export const PLUGIN_TOGGLE_PATH = '/api/supanexus.plugin-toggle';
export const PROTECTED_UNINSTALL_PACKAGE_NAME = '@supanexus/dsh-plugin-supanexus-core';
export const PROTECTED_UNINSTALL_INSTALL_CODE = 'supanexus-core';
export function formatInstallAttemptsLog(attempts) {
    const blocks = [];
    for (const attempt of attempts) {
        const header = `[${attempt.provider}] ${attempt.cliCommand ?? attempt.spec}`;
        const lines = [header];
        if (attempt.stdout !== undefined && attempt.stdout.trim().length > 0) {
            lines.push(attempt.stdout.trimEnd());
        }
        if (attempt.stderr !== undefined && attempt.stderr.trim().length > 0) {
            lines.push(attempt.stderr.trimEnd());
        }
        if (!attempt.ok && attempt.message !== undefined && attempt.message.length > 0) {
            lines.push(attempt.message);
        }
        blocks.push(lines.join('\n'));
    }
    return blocks.join('\n\n');
}
/** Whether skill market may offer uninstall for this listing. */
export function canUninstallPlugin(item) {
    if (item.install_code === PROTECTED_UNINSTALL_INSTALL_CODE)
        return false;
    if (item.package_name === PROTECTED_UNINSTALL_PACKAGE_NAME)
        return false;
    return !item.package_name.endsWith('dsh-plugin-supanexus-core');
}
/** Whether skill market may offer enable/disable for this listing. */
export function canTogglePlugin(item) {
    return canUninstallPlugin(item);
}
export function formatCommandLog(run) {
    const lines = [run.cliCommand];
    if (run.stdout !== undefined && run.stdout.trim().length > 0) {
        lines.push(run.stdout.trimEnd());
    }
    if (run.stderr !== undefined && run.stderr.trim().length > 0) {
        lines.push(run.stderr.trimEnd());
    }
    if (run.message !== undefined && run.message.length > 0) {
        lines.push(run.message);
    }
    return lines.join('\n');
}
const PROVIDER_PREFERENCE_CN = ['gitee', 'github', 'npm'];
const PROVIDER_PREFERENCE_GLOBAL = ['github', 'gitee', 'npm'];
function listRepositories(item) {
    if (item.repositories !== undefined && item.repositories.length > 0) {
        return item.repositories;
    }
    if (item.repository !== undefined)
        return [item.repository];
    return [];
}
/** 按线路偏好排出候选渠道；cn 优先 gitee，global 优先 github。 */
export function orderRepositories(item, lineId) {
    const repos = listRepositories(item);
    if (repos.length === 0)
        return [];
    const order = lineId === 'cn' ? PROVIDER_PREFERENCE_CN : PROVIDER_PREFERENCE_GLOBAL;
    const out = [];
    const seen = new Set();
    for (const provider of order) {
        const hit = repos.find(r => r.provider === provider);
        if (hit !== undefined && !seen.has(hit.provider)) {
            seen.add(hit.provider);
            out.push(hit);
        }
    }
    for (const repo of repos) {
        if (!seen.has(repo.provider))
            out.push(repo);
    }
    return out;
}
/** 单渠道 → `dsh plugin add` spec。 */
export function buildInstallSpecFor(repo, installCode) {
    const repoUrl = repo.url?.trim() ?? '';
    if (repoUrl.length === 0)
        return installCode;
    try {
        const u = new URL(repoUrl);
        if (u.hostname === 'github.com' || u.hostname === 'www.github.com') {
            const slug = u.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
            const ref = repo.default_ref?.trim();
            return ref !== undefined && ref.length > 0 ? `github:${slug}#${ref}` : `github:${slug}`;
        }
        if (u.hostname === 'gitee.com' || u.hostname === 'www.gitee.com') {
            const slug = u.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
            const ref = repo.default_ref?.trim();
            return ref !== undefined && ref.length > 0 ? `gitee:${slug}#${ref}` : `gitee:${slug}`;
        }
    }
    catch {
        /* ignore */
    }
    return installCode;
}
/** Build `dsh plugin add` package spec from a listing row (first candidate). */
export function buildInstallSpec(item, lineId = 'global') {
    const [first] = orderRepositories(item, lineId);
    if (first === undefined)
        return item.install_code;
    return buildInstallSpecFor(first, item.install_code);
}
/** Full CLI command shown to users (profile placeholder). */
export function buildCliInstallCommand(spec, profile = 'web') {
    return `dsh plugin --profile ${profile} add ${spec}`;
}
/** Full CLI remove command shown to users (profile placeholder). */
export function buildCliRemoveCommand(packageName, profile = 'web') {
    return `dsh plugin --profile ${profile} remove ${packageName}`;
}
/** 展示用：取第一个可用仓库 URL（不区分线路）。 */
export function primaryRepositoryUrl(item) {
    const [first] = orderRepositories(item, 'global');
    const url = first?.url?.trim();
    return url && url.length > 0 ? url : undefined;
}
export function repositoryProviderLabel(provider) {
    if (provider === 'github')
        return 'GitHub';
    if (provider === 'gitee')
        return 'Gitee';
    return provider;
}
/** Parse `major.minor.patch` with optional leading `v` and pre-release suffix. */
export function parseSemver(version) {
    const trimmed = version.trim();
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(trimmed);
    if (match === null)
        return null;
    return [
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
        match[4] ?? '',
    ];
}
/** Compare two semver strings; returns null when either side is invalid. */
export function compareSemver(left, right) {
    const a = parseSemver(left);
    const b = parseSemver(right);
    if (a === null || b === null)
        return null;
    if (a[0] !== b[0])
        return a[0] - b[0];
    if (a[1] !== b[1])
        return a[1] - b[1];
    if (a[2] !== b[2])
        return a[2] - b[2];
    if (a[3] === b[3])
        return 0;
    if (a[3] === '')
        return 1;
    if (b[3] === '')
        return -1;
    return a[3].localeCompare(b[3]);
}
/** Whether the operational listing version is strictly newer than the installed version. */
export function versionIndicatesUpgrade(listingVersion, installedVersion) {
    const listing = listingVersion?.trim() ?? '';
    const installed = installedVersion?.trim() ?? '';
    if (listing.length === 0 || installed.length === 0)
        return false;
    const cmp = compareSemver(listing, installed);
    return cmp !== null && cmp > 0;
}
/** Operational default_ref from the first repository candidate on the active line. */
export function primaryTargetRef(item, lineId) {
    const [first] = orderRepositories(item, lineId);
    return first?.default_ref?.trim() ?? '';
}
//# sourceMappingURL=plugin-market-contract.js.map