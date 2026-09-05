/** Fetch plugin plaza public API on gateway-client (line.origin). */
import { normalizeOrigin } from "../../shared/line.js";
async function readGatewayJson(response) {
    const text = await response.text();
    let body;
    try {
        body = JSON.parse(text);
    }
    catch {
        const snippet = text.trim().slice(0, 160);
        throw new Error(snippet.length > 0 ? snippet : `HTTP ${String(response.status)}`);
    }
    if (!response.ok || body.code !== 'ok' || body.data === undefined) {
        const message = typeof body.message === 'string' && body.message.length > 0
            ? body.message
            : `HTTP ${String(response.status)}`;
        throw new Error(message);
    }
    return body.data;
}
/** List published plugin listings. */
export async function fetchPublicListings(origin, params) {
    const base = normalizeOrigin(origin);
    const url = `${base}/api/v1/public/plugin-listings?${params.toString()}`;
    const response = await fetch(url, { method: 'GET' });
    return readGatewayJson(response);
}
/** Fetch one listing by install code. */
export async function fetchListingByCode(origin, installCode, locale) {
    const base = normalizeOrigin(origin);
    const params = new URLSearchParams();
    if (locale !== undefined && locale.length > 0)
        params.set('locale', locale);
    const qs = params.size > 0 ? `?${params.toString()}` : '';
    const url = `${base}/api/v1/public/plugin-listings/by-code/${encodeURIComponent(installCode)}${qs}`;
    const response = await fetch(url, { method: 'GET' });
    return readGatewayJson(response);
}
/** List published plugin categories. */
export async function fetchPublicCategories(origin, params) {
    const base = normalizeOrigin(origin);
    const url = `${base}/api/v1/public/plugin-categories?${params.toString()}`;
    const response = await fetch(url, { method: 'GET' });
    return readGatewayJson(response);
}
//# sourceMappingURL=gateway-client.js.map