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
/** Probe whether SupaNexus credentials exist (sidebar visibility). */
export async function fetchWalletStatus() {
    const url = new URL(WALLET_STATUS_PATH, window.location.origin);
    const response = await fetch(url);
    return parseJson(response);
}
/** Fetch organization balance via Host (refresh + wallet). */
export async function fetchWalletBalance(locale) {
    const url = new URL(WALLET_PATH, window.location.origin);
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    return parseJson(response);
}
//# sourceMappingURL=wire.js.map