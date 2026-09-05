/** Auth-line pinning + env-line healthz racing (separate caches). */
import { findLine, probeUrl } from "../../shared/line.js";
import { readSettings, patchSettings } from "../settings/device.js";
const defaultFetch = (url, signal) => fetch(url, { method: 'GET', signal });
/** Independent TTL cache for plugin-market env probing (never writes settings). */
let envCached;
let envCacheExpiresAt = 0;
/** Probe one line; any HTTP response counts as reachable. */
export async function probeLine(line, timeoutMs, doFetch = defaultFetch) {
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        await doFetch(probeUrl(line), controller.signal);
        return {
            line,
            latencyMs: Math.round(performance.now() - started),
            reachable: true,
        };
    }
    catch {
        return { line, latencyMs: null, reachable: false };
    }
    finally {
        clearTimeout(timer);
    }
}
function pickWinner(lines, entries) {
    const reachable = entries
        .filter(entry => entry.reachable && entry.latencyMs !== null)
        .sort((left, right) => {
        const delta = (left.latencyMs ?? 0) - (right.latencyMs ?? 0);
        if (delta !== 0)
            return delta;
        return lines.findIndex(line => line.id === left.line.id)
            - lines.findIndex(line => line.id === right.line.id);
    });
    if (reachable.length === 0) {
        throw new Error('两条线路均不可达，请检查网络后重试。');
    }
    const best = reachable[0];
    return {
        line: best.line,
        latencyMs: best.latencyMs ?? 0,
        resolvedAt: Date.now(),
    };
}
function firstNonEmpty(...candidates) {
    for (const raw of candidates) {
        const value = raw?.trim() ?? '';
        if (value.length > 0)
            return value;
    }
    return '';
}
function pinnedReport(line, source, now) {
    const winner = { line, latencyMs: 0, resolvedAt: now };
    return {
        winner,
        source,
        entries: [{ line, latencyMs: 0, reachable: true }],
    };
}
/**
 * Resolve the auth / platform region line.
 * Priority (non-empty string wins): pinnedOverride → config.pinnedLine → settings.pinnedLine → probe.
 * First auto probe also writes `pinnedLine` so the settings UI shows a selection.
 */
export async function resolveAuthLine(ctx, config, options = {}) {
    const settings = readSettings(ctx);
    const now = Date.now();
    const override = firstNonEmpty(options.pinnedOverride);
    if (override.length > 0) {
        const line = findLine(config.lines, override);
        if (line === undefined)
            throw new Error(`未知线路：${override}`);
        await patchSettings(ctx, {
            resolvedLine: line.id,
            resolvedAt: now,
            latencyMs: 0,
            pinnedLine: line.id,
        });
        return pinnedReport(line, 'user', now);
    }
    const fromConfig = firstNonEmpty(config.pinnedLine);
    if (fromConfig.length > 0) {
        const line = findLine(config.lines, fromConfig);
        if (line === undefined)
            throw new Error(`未知线路：${fromConfig}`);
        await patchSettings(ctx, {
            resolvedLine: line.id,
            resolvedAt: now,
            latencyMs: 0,
        });
        return pinnedReport(line, 'config', now);
    }
    const fromUser = firstNonEmpty(settings.pinnedLine);
    if (fromUser.length > 0) {
        const line = findLine(config.lines, fromUser);
        if (line === undefined)
            throw new Error(`未知线路：${fromUser}`);
        await patchSettings(ctx, {
            resolvedLine: line.id,
            resolvedAt: now,
            latencyMs: 0,
        });
        return pinnedReport(line, 'user', now);
    }
    const entries = await Promise.all(config.lines.map(line => probeLine(line, config.probeTimeoutMs, options.doFetch)));
    const winner = pickWinner(config.lines, entries);
    await patchSettings(ctx, {
        pinnedLine: winner.line.id,
        resolvedLine: winner.line.id,
        resolvedAt: winner.resolvedAt,
        latencyMs: winner.latencyMs,
    });
    return { winner, entries, source: 'auto' };
}
/**
 * Resolve the plugin-market env line via healthz racing.
 * Uses an independent TTL cache and never writes auth settings.
 */
export async function resolveEnvLine(_ctx, config, options = {}) {
    const now = Date.now();
    if (!options.force && envCached !== undefined && now < envCacheExpiresAt) {
        const hit = envCached;
        return {
            winner: hit,
            entries: config.lines.map(line => ({
                line,
                latencyMs: line.id === hit.line.id ? hit.latencyMs : null,
                reachable: line.id === hit.line.id,
            })),
        };
    }
    const entries = await Promise.all(config.lines.map(line => probeLine(line, config.probeTimeoutMs, options.doFetch)));
    const winner = pickWinner(config.lines, entries);
    envCached = winner;
    envCacheExpiresAt = now + config.probeCacheTtlMs;
    return { winner, entries };
}
/** Whether cordis config locks the region (UI should disable switching). */
export function isAuthLineLocked(config) {
    return firstNonEmpty(config.pinnedLine).length > 0;
}
/** Test helper: clear env-line probe cache. */
export function resetLineCache() {
    envCached = undefined;
    envCacheExpiresAt = 0;
}
/** Alias for {@link resetLineCache}. */
export const resetEnvLineCache = resetLineCache;
//# sourceMappingURL=resolver.js.map