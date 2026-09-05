/** Host HTTP routes: plugin plaza proxy + install bridge. */
import { apiErr, apiOk } from "../../shared/auth-contract.js";
import { PLUGIN_CATEGORIES_PATH, PLUGIN_INSTALL_PATH, PLUGIN_LISTINGS_PATH, PLUGIN_UNINSTALL_PATH, PLUGIN_UPGRADE_STATUS_PATH, PLUGIN_REMOTE_VERSION_PATH, PLUGIN_TOGGLE_STATUS_PATH, PLUGIN_TOGGLE_PATH, RESTART_HOST_PATH, buildCliInstallCommand, buildCliRemoveCommand, buildInstallSpecFor, canTogglePlugin, canUninstallPlugin, formatCommandLog, formatInstallAttemptsLog, orderRepositories, primaryTargetRef, } from "../../shared/plugin-market-contract.js";
import { resolveLine } from "../line/resolver.js";
import { resolvePluginCatalogOrigin } from "./catalog-origin.js";
import { fetchListingByCode, fetchPublicCategories, fetchPublicListings } from "./gateway-client.js";
import { fetchRemotePackageManifest } from "./remote-package-json.js";
import { runProfilePluginInstall, runProfilePluginRemove } from "./install-runner.js";
import { packageEnabled, setPackageEnabled } from "./patch-layer.js";
import { isDirectLoopbackRequest, scheduleHostRelaunch } from "./restart-host.js";
import { buildUpgradeStatusEntry } from "./upgrade-status.js";
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
function normalizeLocale(raw) {
    if (raw !== null && raw.startsWith('zh'))
        return 'zh-CN';
    if (raw === 'zh-CN' || raw === 'en-US')
        return raw;
    return raw !== null && raw.length > 0 ? raw : 'zh-CN';
}
function formatInstallError(run) {
    if (run.stderr.includes('allowBuilds'))
        return run.stderr;
    return run.stderr.trim().length > 0
        ? run.stderr.trim()
        : `安装失败（退出码 ${String(run.exitCode)}）`;
}
function tryInstallWithFallback(config, listing, candidates) {
    const attempts = [];
    for (const repo of candidates) {
        const spec = buildInstallSpecFor(repo, listing.install_code);
        const run = runProfilePluginInstall(config, spec);
        const attemptBase = {
            provider: repo.provider,
            spec,
            cliCommand: run.cliCommand,
            stdout: run.stdout,
            stderr: run.stderr,
        };
        if (run.ok) {
            const successAttempts = [
                ...attempts,
                { ...attemptBase, ok: true },
            ];
            const success = {
                ok: true,
                spec,
                packageName: listing.package_name,
                provider: repo.provider,
                needsRestart: true,
                cliCommand: buildCliInstallCommand(spec, config.profileName),
                attempts: successAttempts,
            };
            return { success };
        }
        attempts.push({
            ...attemptBase,
            ok: false,
            message: formatInstallError(run),
        });
    }
    const summary = attempts
        .map(a => `${a.provider}: ${a.message ?? 'failed'}`)
        .join('; ');
    return { failure: summary.length > 0 ? summary : '所有渠道安装均失败。', attempts };
}
/** Register plugin market Host API routes. */
export function registerPluginMarketRoutes(ctx, config) {
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_LISTINGS_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const { winner } = await resolveLine(ctx, config);
                const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
                const params = new URLSearchParams(url.searchParams);
                if (!params.has('locale')) {
                    params.set('locale', normalizeLocale(url.searchParams.get('locale')));
                }
                const data = await fetchPublicListings(catalogOrigin, params);
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法加载插件列表。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-listings');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_CATEGORIES_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const { winner } = await resolveLine(ctx, config);
                const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
                const params = new URLSearchParams(url.searchParams);
                if (!params.has('locale')) {
                    params.set('locale', normalizeLocale(url.searchParams.get('locale')));
                }
                const data = await fetchPublicCategories(catalogOrigin, params);
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法加载插件分类。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-categories');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_INSTALL_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const action = url.searchParams.get('action')?.trim();
                if (action === 'restart') {
                    if (!isDirectLoopbackRequest(request)) {
                        return jsonResponse(apiErr('仅允许本机 loopback 请求重启 Host。'), 403);
                    }
                    scheduleHostRelaunch();
                    return jsonResponse(apiOk({ restarting: true }), 202);
                }
                const installCode = url.searchParams.get('installCode')?.trim() ?? '';
                if (installCode.length === 0) {
                    return jsonResponse(apiErr('缺少 installCode。'), 400);
                }
                const locale = normalizeLocale(url.searchParams.get('locale'));
                const { winner } = await resolveLine(ctx, config);
                const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
                const listing = await fetchListingByCode(catalogOrigin, installCode, locale);
                const candidates = orderRepositories(listing, winner.line.id);
                if (candidates.length === 0) {
                    return jsonResponse(apiErr('该插件未配置可用仓库渠道。'), 400);
                }
                const result = tryInstallWithFallback(config, listing, candidates);
                if ('failure' in result) {
                    return jsonResponse({
                        ok: false,
                        message: result.failure,
                        code: 'INSTALL_FAILED',
                        attempts: result.attempts,
                        log: formatInstallAttemptsLog(result.attempts),
                    }, 400);
                }
                return jsonResponse(apiOk(result.success));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '安装失败。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-install');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_UNINSTALL_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const packageName = url.searchParams.get('packageName')?.trim() ?? '';
                if (packageName.length === 0) {
                    return jsonResponse(apiErr('缺少 packageName。'), 400);
                }
                if (!canUninstallPlugin({ package_name: packageName, install_code: '' })) {
                    return jsonResponse(apiErr('该插件不允许卸载。'), 403);
                }
                const installCode = url.searchParams.get('installCode')?.trim() ?? '';
                if (installCode.length > 0 && !canUninstallPlugin({ package_name: packageName, install_code: installCode })) {
                    return jsonResponse(apiErr('该插件不允许卸载。'), 403);
                }
                const run = runProfilePluginRemove(config, packageName);
                const cliCommand = buildCliRemoveCommand(packageName, config.profileName);
                if (!run.ok) {
                    const message = run.stderr.trim().length > 0
                        ? run.stderr.trim()
                        : `卸载失败（退出码 ${String(run.exitCode)}）`;
                    return jsonResponse({
                        ok: false,
                        message,
                        code: 'UNINSTALL_FAILED',
                        log: formatCommandLog({ ...run, message }),
                    }, 400);
                }
                return jsonResponse(apiOk({
                    packageName,
                    needsRestart: true,
                    cliCommand,
                    stdout: run.stdout,
                    stderr: run.stderr,
                    log: formatCommandLog(run),
                }));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '卸载失败。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-uninstall');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_UPGRADE_STATUS_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const rawCodes = url.searchParams.get('installCodes')?.trim() ?? '';
                const installCodes = rawCodes
                    .split(',')
                    .map(code => code.trim())
                    .filter(code => code.length > 0);
                if (installCodes.length === 0) {
                    return jsonResponse(apiErr('缺少 installCodes。'), 400);
                }
                const locale = normalizeLocale(url.searchParams.get('locale'));
                const { winner } = await resolveLine(ctx, config);
                const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
                const resolved = await Promise.all(installCodes.map(async (installCode) => {
                    try {
                        const listing = await fetchListingByCode(catalogOrigin, installCode, locale);
                        return buildUpgradeStatusEntry(listing, {
                            profileName: config.profileName,
                        });
                    }
                    catch {
                        return {
                            install_code: installCode,
                            upgradeable: false,
                            installed_version: null,
                            listing_version: null,
                        };
                    }
                }));
                const data = { items: resolved };
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法检查插件更新。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-upgrade-status');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_REMOTE_VERSION_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const installCode = url.searchParams.get('installCode')?.trim() ?? '';
                if (installCode.length === 0) {
                    return jsonResponse(apiErr('缺少 installCode。'), 400);
                }
                const locale = normalizeLocale(url.searchParams.get('locale'));
                const { winner } = await resolveLine(ctx, config);
                const catalogOrigin = resolvePluginCatalogOrigin(config, winner.line);
                const listing = await fetchListingByCode(catalogOrigin, installCode, locale);
                const targetRef = primaryTargetRef(listing, winner.line.id);
                const candidates = orderRepositories(listing, winner.line.id);
                const remote = await fetchRemotePackageManifest(candidates, targetRef);
                const data = {
                    version: remote?.version ?? null,
                    provider: remote?.provider ?? null,
                };
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法读取远端 package.json 版本。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-remote-version');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_TOGGLE_STATUS_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const raw = url.searchParams.get('packageNames')?.trim() ?? '';
                const packageNames = raw
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0);
                if (packageNames.length === 0) {
                    return jsonResponse(apiErr('缺少 packageNames。'), 400);
                }
                const items = packageNames.map((packageName) => {
                    const toggleable = canTogglePlugin({ package_name: packageName, install_code: '' });
                    const status = packageEnabled(config.profileName, packageName);
                    return {
                        package_name: packageName,
                        enabled: status.enabled,
                        row_ids: status.rowIds,
                        toggleable,
                    };
                });
                const data = { items };
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法读取插件开关状态。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-toggle-status');
    ctx.effect(() => ctx.connection.fetch.register({
        path: PLUGIN_TOGGLE_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const url = new URL(request.url);
                const packageName = url.searchParams.get('packageName')?.trim() ?? '';
                if (packageName.length === 0) {
                    return jsonResponse(apiErr('缺少 packageName。'), 400);
                }
                if (!canTogglePlugin({ package_name: packageName, install_code: '' })) {
                    return jsonResponse(apiErr('该插件不允许开关。'), 403);
                }
                const enabledParam = url.searchParams.get('enabled')?.trim().toLowerCase() ?? '';
                if (enabledParam !== 'true' && enabledParam !== 'false') {
                    return jsonResponse(apiErr('enabled 须为 true 或 false。'), 400);
                }
                const enabled = enabledParam === 'true';
                const result = await setPackageEnabled(config.profileName, packageName, enabled);
                if (!result.ok) {
                    return jsonResponse(apiErr(result.reason ?? '开关写入失败。'), 400);
                }
                const data = {
                    package_name: packageName,
                    enabled,
                    row_ids: result.rowIds,
                    needsRefresh: true,
                };
                return jsonResponse(apiOk(data));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '插件开关失败。';
                return jsonResponse(apiErr(message), 400);
            }
        },
    }), 'supanexus: plugin-toggle');
    ctx.effect(() => ctx.connection.fetch.register({
        path: RESTART_HOST_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            if (!isDirectLoopbackRequest(request)) {
                return jsonResponse(apiErr('仅允许本机 loopback 请求重启 Host。'), 403);
            }
            scheduleHostRelaunch();
            return jsonResponse(apiOk({ restarting: true }), 202);
        },
    }), 'supanexus: restart-host');
}
//# sourceMappingURL=routes.js.map