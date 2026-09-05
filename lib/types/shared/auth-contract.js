/** Connection fetch routes (GET only). */
export const AUTH_START_PATH = '/api/supanexus.auth.start';
export const AUTH_STATUS_PATH = '/api/supanexus.auth.status';
export function apiOk(data) {
    return { ok: true, ...data };
}
export function apiErr(message, code) {
    return { ok: false, message, ...code === undefined ? {} : { code } };
}
//# sourceMappingURL=auth-contract.js.map