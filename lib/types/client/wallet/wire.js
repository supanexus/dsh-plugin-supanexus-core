/** Browser fetch wrappers for wallet Host API routes. */
import { WALLET_PATH, WALLET_STATUS_PATH, } from "../../shared/wallet-contract.js";
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
        const error = new Error(message);
        if (typeof body.code === 'string')
            error.code = body.code;
        throw error;
    }
    return body;
}
function asString(value, fallback = '') {
    return typeof value === 'string' ? value : fallback;
}
function asNumber(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
/** Normalize Host wallet payloads so missing subscription fields never crash UI. */
export function normalizeWalletStatus(raw) {
    return {
        connected: Boolean(raw.connected),
        credentialAligned: raw.credentialAligned !== false,
        usagePoliciesUrl: asString(raw.usagePoliciesUrl),
        ...(typeof raw.keyPrefix === 'string' && raw.keyPrefix.length > 0
            ? { keyPrefix: raw.keyPrefix }
            : {}),
    };
}
/** Normalize Host balance payloads for older Host builds without points fields. */
export function normalizeWalletBalance(raw) {
    return {
        connected: true,
        organizationId: asString(raw.organizationId),
        name: asString(raw.name),
        availableBalance: asString(raw.availableBalance),
        currency: asString(raw.currency, 'USD'),
        subscriptionActive: Boolean(raw.subscriptionActive),
        pointsRemaining: asString(raw.pointsRemaining, '0'),
        pointsGranted: asString(raw.pointsGranted, '0'),
        planCode: asString(raw.planCode),
        planName: asString(raw.planName),
        subscriptionStatus: asString(raw.subscriptionStatus),
        nextPointsResetAtUnix: asNumber(raw.nextPointsResetAtUnix),
        periodEndUnix: asNumber(raw.periodEndUnix),
        usagePoliciesUrl: asString(raw.usagePoliciesUrl),
        ...(typeof raw.keyPrefix === 'string' && raw.keyPrefix.length > 0
            ? { keyPrefix: raw.keyPrefix }
            : {}),
    };
}
/** Probe whether SupaNexus credentials exist (sidebar visibility). */
export async function fetchWalletStatus() {
    const url = new URL(WALLET_STATUS_PATH, window.location.origin);
    const response = await fetch(url);
    const body = await parseJson(response);
    return normalizeWalletStatus(body);
}
/** Fetch organization balance via Host (refresh + wallet). */
export async function fetchWalletBalance(locale) {
    const url = new URL(WALLET_PATH, window.location.origin);
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    const body = await parseJson(response);
    return normalizeWalletBalance(body);
}
//# sourceMappingURL=wire.js.map