/** Line / region status API shared by Host routes and Client settings. */
export const LINE_STATUS_PATH = '/api/supanexus.line.status';
/** Map configured lines to UI rows (id + label only). */
export function toLineStatusRows(lines) {
    return lines.map(line => ({ id: line.id, label: line.label }));
}
//# sourceMappingURL=line-contract.js.map