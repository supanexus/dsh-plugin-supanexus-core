/** Host routes for wallet status + balance (Harness refresh + wallet). */
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { apiErr, apiOk, } from "../../shared/auth-contract.js";
import { CREDENTIAL_REF, REFRESH_CREDENTIAL_REF, } from "../../shared/provider.js";
import { WALLET_ERROR, WALLET_PATH, WALLET_STATUS_PATH, buildUsagePoliciesUrl, } from "../../shared/wallet-contract.js";
import { resolveAuthLine } from "../line/resolver.js";
import { resolveConsoleOrigin } from "../plugin-market/catalog-origin.js";
import { readSettings } from "../settings/device.js";
import { fetchWallet, messageForCode, refreshSession, } from "../auth/harness-client.js";
function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
let accessCache;
/** Test helper: clear in-memory access token cache. */
export function resetWalletAccessCache() {
    accessCache = undefined;
}
async function isApiKeyConfigured(ctx) {
    const info = await ctx.credentials.describe(credentialRef(CREDENTIAL_REF));
    return info.configured;
}
async function resolveRefreshToken(ctx) {
    const resolved = await ctx.credentials.resolve(credentialRef(REFRESH_CREDENTIAL_REF));
    const value = resolved?.value?.trim();
    return value !== undefined && value.length > 0 ? value : undefined;
}
async function ensureAccessToken(ctx, config, locale) {
    const { winner } = await resolveAuthLine(ctx, config);
    const line = winner.line;
    const now = Date.now();
    if (accessCache !== undefined
        && accessCache.expiresAt > now + 15_000
        && accessCache.lineId === line.id) {
        return { accessToken: accessCache.accessToken, lineId: accessCache.lineId, line };
    }
    const refreshToken = await resolveRefreshToken(ctx);
    if (refreshToken === undefined) {
        throw Object.assign(new Error('会话已失效，请重新快速配置。'), {
            code: WALLET_ERROR.sessionRevoked,
        });
    }
    try {
        const tokens = await refreshSession(line, refreshToken, locale);
        await ctx.credentials.set(credentialRef(REFRESH_CREDENTIAL_REF), tokens.refreshToken);
        accessCache = {
            accessToken: tokens.accessToken,
            expiresAt: now + Math.max(30, tokens.expiresIn - 30) * 1000,
            lineId: line.id,
        };
        return { accessToken: tokens.accessToken, lineId: line.id, line };
    }
    catch (error) {
        accessCache = undefined;
        const message = error instanceof Error ? error.message : messageForCode('harness.session_revoked');
        throw Object.assign(new Error(message), { code: WALLET_ERROR.sessionRevoked });
    }
}
async function pickLineForConsole(ctx, config) {
    const { winner } = await resolveAuthLine(ctx, config);
    return winner.line;
}
function usagePoliciesUrlFor(config, line) {
    return buildUsagePoliciesUrl(resolveConsoleOrigin(config, line));
}
/** Register wallet status and balance Host API routes. */
export function registerWalletRoutes(ctx, config) {
    ctx.effect(() => ctx.connection.fetch.register({
        path: WALLET_STATUS_PATH,
        methods: ['GET'],
        fetch: async () => {
            try {
                const connected = await isApiKeyConfigured(ctx);
                const settings = readSettings(ctx);
                const line = await pickLineForConsole(ctx, config);
                const body = apiOk({
                    connected,
                    usagePoliciesUrl: usagePoliciesUrlFor(config, line),
                    ...(settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}),
                });
                return jsonResponse(body);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : '无法读取连接状态。';
                return jsonResponse(apiErr(message), 500);
            }
        },
    }), 'supanexus: wallet.status');
    ctx.effect(() => ctx.connection.fetch.register({
        path: WALLET_PATH,
        methods: ['GET'],
        fetch: async (request) => {
            try {
                const connected = await isApiKeyConfigured(ctx);
                if (!connected) {
                    return jsonResponse(apiErr('尚未配置 SupaNexus，请先完成快速配置。', WALLET_ERROR.notConnected), 400);
                }
                const settings = readSettings(ctx);
                const deviceId = settings.deviceId.trim();
                if (deviceId.length === 0) {
                    return jsonResponse(apiErr('缺少设备标识，请重新快速配置。', WALLET_ERROR.noDevice), 400);
                }
                const locale = new URL(request.url).searchParams.get('locale') ?? undefined;
                const { accessToken, line } = await ensureAccessToken(ctx, config, locale);
                const wallet = await fetchWallet(line, accessToken, deviceId, locale);
                const body = apiOk({
                    connected: true,
                    organizationId: wallet.organizationId,
                    name: wallet.name,
                    availableBalance: wallet.availableBalance,
                    currency: wallet.currency,
                    usagePoliciesUrl: usagePoliciesUrlFor(config, line),
                    ...(settings.keyPrefix.length > 0 ? { keyPrefix: settings.keyPrefix } : {}),
                });
                return jsonResponse(body);
            }
            catch (error) {
                const code = typeof error === 'object' && error !== null && 'code' in error
                    && typeof error.code === 'string'
                    ? error.code
                    : undefined;
                const message = error instanceof Error ? error.message : '无法获取余额。';
                const status = code === WALLET_ERROR.sessionRevoked ? 401 : 400;
                return jsonResponse(apiErr(message, code), status);
            }
        },
    }), 'supanexus: wallet');
}
//# sourceMappingURL=routes.js.map