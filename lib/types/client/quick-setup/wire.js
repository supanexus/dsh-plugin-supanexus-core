/** Browser fetch wrappers for SupaNexus host API routes. */
import { AUTH_START_PATH, AUTH_STATUS_PATH, } from "../../shared/auth-contract.js";
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
/** Start OAuth flow; host silently probes lines before returning authorize URL. */
export async function startAuth(locale) {
    const url = new URL(AUTH_START_PATH, window.location.origin);
    if (locale !== undefined && locale.length > 0)
        url.searchParams.set('locale', locale);
    const response = await fetch(url);
    return parseJson(response);
}
/** Poll auth flow status. */
export async function fetchAuthStatus(flowId) {
    const url = new URL(AUTH_STATUS_PATH, window.location.origin);
    url.searchParams.set('flowId', flowId);
    const response = await fetch(url);
    return parseJson(response);
}
//# sourceMappingURL=wire.js.map