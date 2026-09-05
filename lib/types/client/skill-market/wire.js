/** Browser fetch wrappers for plugin market Host API routes. */
import { PLUGIN_CATEGORIES_PATH, PLUGIN_INSTALL_PATH, PLUGIN_LISTINGS_PATH, PLUGIN_UNINSTALL_PATH, PLUGIN_UPGRADE_STATUS_PATH, PLUGIN_REMOTE_VERSION_PATH, PLUGIN_TOGGLE_STATUS_PATH, PLUGIN_TOGGLE_PATH, RESTART_HOST_PATH, formatInstallAttemptsLog, } from "../../shared/plugin-market-contract.js";
import { InstallPluginError } from "./install-error.js";
async function readResponseBody(response) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    const text = await response.text();
    if (text.length === 0)
        return {};
    try {
        return JSON.parse(text);
    }
    catch {
        return { message: text };
    }
}
async function parseJson(response) {
    const body = await readResponseBody(response);
    if (!response.ok || body.ok === false) {
        if (response.status === 404) {
            throw new Error(typeof body.message === 'string' && body.message.length > 0
                ? body.message
                : 'HOST_API_NOT_FOUND');
        }
        const message = typeof body.message === 'string' && body.message.length > 0
            ? body.message
            : `HTTP ${String(response.status)}`;
        throw new Error(message);
    }
    return body;
}
/** List published plugins via Host proxy. */
export async function listPluginListings(params) {
    const url = new URL(PLUGIN_LISTINGS_PATH, window.location.origin);
    if (params?.locale !== undefined)
        url.searchParams.set('locale', params.locale);
    if (params?.source !== undefined && params.source.length > 0) {
        url.searchParams.set('source', params.source);
    }
    if (params?.layer !== undefined && params.layer.length > 0) {
        url.searchParams.set('layer', params.layer);
    }
    if (params?.category !== undefined && params.category.length > 0) {
        url.searchParams.set('category', params.category);
    }
    if (params?.q !== undefined && params.q.length > 0)
        url.searchParams.set('q', params.q);
    const page = params?.page != null && params.page > 0 ? Math.floor(params.page) : 1;
    const pageSize = params?.page_size != null && params.page_size > 0
        ? Math.min(50, Math.floor(params.page_size))
        : 12;
    url.searchParams.set('page', String(page));
    url.searchParams.set('page_size', String(pageSize));
    const response = await fetch(url);
    const body = await parseJson(response);
    return {
        items: body.items ?? [],
        total_count: body.total_count ?? 0,
        page: body.page ?? page,
        page_size: body.page_size ?? pageSize,
        has_next_page: !!body.has_next_page,
    };
}
/** List plugin categories via Host proxy. */
export async function listPluginCategories(params) {
    const url = new URL(PLUGIN_CATEGORIES_PATH, window.location.origin);
    if (params?.locale !== undefined)
        url.searchParams.set('locale', params.locale);
    const response = await fetch(url);
    const body = await parseJson(response);
    return { items: body.items ?? [] };
}
/** Install a plugin by install code via Host bridge (GET; connection.fetch is GET-only). */
export async function installPlugin(installCode, locale) {
    const url = new URL(PLUGIN_INSTALL_PATH, window.location.origin);
    url.searchParams.set('installCode', installCode);
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    const body = await readResponseBody(response);
    const failureMessage = 'message' in body && typeof body.message === 'string' && body.message.length > 0
        ? body.message
        : undefined;
    if (!response.ok || body.ok === false) {
        if (response.status === 404) {
            throw new InstallPluginError(failureMessage ?? 'HOST_API_NOT_FOUND');
        }
        const message = failureMessage ?? `HTTP ${String(response.status)}`;
        const attempts = body.attempts;
        const log = typeof body.log === 'string' && body.log.length > 0
            ? body.log
            : attempts !== undefined
                ? formatInstallAttemptsLog(attempts)
                : undefined;
        throw new InstallPluginError(message, {
            ...(attempts !== undefined ? { attempts } : {}),
            ...(log !== undefined ? { log } : {}),
        });
    }
    const log = body.attempts !== undefined
        ? formatInstallAttemptsLog(body.attempts)
        : undefined;
    const success = body;
    return log !== undefined ? { ...success, log } : success;
}
/** Uninstall a plugin by package name via Host bridge. */
export async function uninstallPlugin(packageName, installCode) {
    const url = new URL(PLUGIN_UNINSTALL_PATH, window.location.origin);
    url.searchParams.set('packageName', packageName);
    if (installCode !== undefined && installCode.length > 0) {
        url.searchParams.set('installCode', installCode);
    }
    const response = await fetch(url);
    const body = await readResponseBody(response);
    const failureMessage = 'message' in body && typeof body.message === 'string' && body.message.length > 0
        ? body.message
        : undefined;
    if (!response.ok || body.ok === false) {
        if (response.status === 404) {
            throw new InstallPluginError(failureMessage ?? 'HOST_API_NOT_FOUND');
        }
        const message = failureMessage ?? `HTTP ${String(response.status)}`;
        const log = typeof body.log === 'string' && body.log.length > 0 ? body.log : undefined;
        throw new InstallPluginError(message, {
            ...(log !== undefined ? { log } : {}),
        });
    }
    const log = typeof body.log === 'string' && body.log.length > 0
        ? body.log
        : undefined;
    const success = body;
    return log !== undefined ? { ...success, log } : success;
}
/** Batch upgrade hints for installed plugins via Host bridge. */
export async function fetchPluginUpgradeStatus(installCodes, locale) {
    const url = new URL(PLUGIN_UPGRADE_STATUS_PATH, window.location.origin);
    url.searchParams.set('installCodes', installCodes.join(','));
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    const body = await parseJson(response);
    return { items: body.items ?? [] };
}
/** Fetch remote package.json version for upgrade confirm. */
export async function fetchPluginRemoteVersion(installCode, locale) {
    const url = new URL(PLUGIN_REMOTE_VERSION_PATH, window.location.origin);
    url.searchParams.set('installCode', installCode);
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    const body = await parseJson(response);
    return {
        version: body.version ?? null,
        provider: body.provider ?? null,
    };
}
/** Batch enabled/disabled state for installed plugins. */
export async function fetchPluginToggleStatus(packageNames) {
    const url = new URL(PLUGIN_TOGGLE_STATUS_PATH, window.location.origin);
    url.searchParams.set('packageNames', packageNames.join(','));
    const response = await fetch(url);
    const body = await parseJson(response);
    return { items: body.items ?? [] };
}
/** Toggle one installed plugin via profile cordis.patch.yml. */
export async function setPluginEnabled(packageName, enabled) {
    const url = new URL(PLUGIN_TOGGLE_PATH, window.location.origin);
    url.searchParams.set('packageName', packageName);
    url.searchParams.set('enabled', enabled ? 'true' : 'false');
    const response = await fetch(url);
    const body = await parseJson(response);
    return {
        package_name: body.package_name ?? packageName,
        enabled: body.enabled ?? enabled,
        row_ids: body.row_ids ?? [],
        needsRefresh: body.needsRefresh ?? true,
    };
}
/** Restart dsh web Host via loopback API (web profile). */
export async function restartHostService() {
    const fallback = new URL(PLUGIN_INSTALL_PATH, window.location.origin);
    fallback.searchParams.set('action', 'restart');
    const candidates = [
        new URL(RESTART_HOST_PATH, window.location.origin),
        fallback,
    ];
    let sawMissingApi = false;
    for (const url of candidates) {
        const response = await fetch(url);
        const body = await readResponseBody(response);
        if (response.ok && body.ok !== false)
            return;
        const message = typeof body.message === 'string' && body.message.length > 0
            ? body.message
            : `HTTP ${String(response.status)}`;
        if (response.status === 404 || message === 'not found' || message === 'HOST_API_NOT_FOUND') {
            sawMissingApi = true;
            continue;
        }
        throw new Error(message);
    }
    throw new Error(sawMissingApi ? 'HOST_RESTART_API_MISSING' : '重启失败');
}
//# sourceMappingURL=wire.js.map