/** Browser fetch for region / line status. */
import { LINE_STATUS_PATH, } from "../../shared/line-contract.js";
async function parseJson(response) {
    const body = await response.json();
    if (!response.ok || body.ok === false) {
        const message = typeof body.message === 'string' && body.message.length > 0
            ? body.message
            : `HTTP ${String(response.status)}`;
        throw new Error(message);
    }
    return body;
}
/** Resolve (and auto-pin on first call) the auth region line. */
export async function fetchLineStatus() {
    const response = await fetch(new URL(LINE_STATUS_PATH, window.location.origin));
    return parseJson(response);
}
//# sourceMappingURL=line-wire.js.map