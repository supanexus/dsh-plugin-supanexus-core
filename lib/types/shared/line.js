/** Line model and URL derivation — single source of truth for host and client. */
/** Strip trailing slashes from an origin URL. */
export function normalizeOrigin(origin) {
    return origin.replace(/\/+$/, '');
}
/** Harness API base for one line (`{harnessOrigin ?? origin}/harness/v1`). */
export function harnessBase(line) {
    const base = normalizeOrigin(line.harnessOrigin ?? line.origin);
    return `${base}/harness/v1`;
}
/** OpenAPI data-plane base for provider `baseURL` (`{origin}/v1`). */
export function dataPlaneBase(line) {
    return `${normalizeOrigin(line.origin)}/v1`;
}
/** Health probe target (`{origin}/healthz`). */
export function probeUrl(line) {
    return `${normalizeOrigin(line.origin)}/healthz`;
}
/** Find a line by id in the configured table. */
export function findLine(lines, id) {
    return lines.find(line => line.id === id);
}
//# sourceMappingURL=line.js.map