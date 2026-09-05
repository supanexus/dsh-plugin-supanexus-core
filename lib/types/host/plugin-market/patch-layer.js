/**
 * Profile user patch layer toggles — write `disabled: true|false` into
 * `cordis.patch.yml` (ported in simplified form from dsh-market / dsh-plugin-hub).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveProfileDir } from "./profile-deps.js";
const ROW_ID_RE = /^[A-Za-z0-9_.-]+$/u;
let writeQueue = Promise.resolve();
function queuedWrite(fn) {
    const run = writeQueue.then(fn, fn);
    writeQueue = run.then(() => undefined, () => undefined);
    return run;
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
function rowBlock(rowId, disabled) {
    return `- id: ${rowId}\n  disabled: ${disabled ? 'true' : 'false'}\n`;
}
/** Line-wise scan of disable/force rows in the user patch layer. */
export function readUserPatchState(patchPath) {
    const disables = [];
    const forced = [];
    let text = '';
    try {
        text = readFileSync(patchPath, 'utf8');
    }
    catch {
        return { disables, forced };
    }
    const lines = text.split(/\r?\n/u);
    for (let index = 0; index < lines.length; index += 1) {
        const disableRow = /^- id: ([A-Za-z0-9_.-]+)\s*$/u.exec(lines[index] ?? '');
        if (disableRow === null)
            continue;
        const next = lines[index + 1] ?? '';
        if (/^ {2}disabled: true\s*$/u.test(next)) {
            const rowId = disableRow[1];
            if (rowId !== undefined)
                disables.push(rowId);
        }
        else if (/^ {2}disabled: false\s*$/u.test(next)) {
            const rowId = disableRow[1];
            if (rowId !== undefined)
                forced.push(rowId);
        }
    }
    return { disables, forced };
}
/** Insert row ids declared by a package bundle patch. */
export function bundleInsertIds(profileDir, packageName) {
    const packageDir = join(profileDir, 'node_modules', ...packageName.split('/'));
    const ids = new Set();
    const patchPaths = [];
    try {
        const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
        const declared = manifest.dsh?.bundle?.patch?.trim();
        if (declared !== undefined && declared.length > 0) {
            patchPaths.push(join(packageDir, declared));
        }
    }
    catch { /* unreadable manifest */ }
    patchPaths.push(join(packageDir, 'cordis.patch.yml'));
    for (const patchPath of patchPaths) {
        if (!existsSync(patchPath))
            continue;
        try {
            const text = readFileSync(patchPath, 'utf8');
            let inInsert = false;
            for (const line of text.split(/\r?\n/u)) {
                if (/^- insert:\s*$/u.test(line)) {
                    inInsert = true;
                    continue;
                }
                if (/^- /u.test(line))
                    inInsert = false;
                if (!inInsert)
                    continue;
                const match = /^ {4}- id: ([A-Za-z0-9_.-]+)/u.exec(line);
                if (match?.[1] !== undefined)
                    ids.add(match[1]);
            }
        }
        catch { /* skip broken patch */ }
    }
    return [...ids];
}
function withPlaceholderRestored(text) {
    if (text.replace(/^[ \t]*#.*$/gmu, '').trim() !== '')
        return text;
    const uncommented = text.replace(/^[ \t]*#[ \t]*\[[ \t]*\][ \t]*(?:\r?\n|$)/mu, '[]\n');
    if (uncommented !== text)
        return uncommented;
    return text === '' || text.endsWith('\n') ? `${text}[]\n` : `${text}\n[]\n`;
}
function appendPatchEntry(patchPath, block) {
    let text = '';
    try {
        text = readFileSync(patchPath, 'utf8');
    }
    catch { /* created below */ }
    const core = text.trim();
    if (core === '') {
        writeFileSync(patchPath, block);
        return { ok: true, reason: null };
    }
    const withoutComments = text.replace(/^[ \t]*#.*$/gmu, '').trim();
    if (withoutComments === '') {
        const next = text.endsWith('\n') ? text : `${text}\n`;
        writeFileSync(patchPath, `${next}${block}`);
        return { ok: true, reason: null };
    }
    if (withoutComments === '[]' || withoutComments === '[ ]') {
        const commented = text.replace(/^[ \t]*\[[ \t]*\][ \t]*(?:#.*)?(?:\r?\n|$)/mu, '# []\n');
        const next = commented.endsWith('\n') ? commented : `${commented}\n`;
        writeFileSync(patchPath, `${next}${block}`);
        return { ok: true, reason: null };
    }
    const next = text.endsWith('\n') ? text : `${text}\n`;
    writeFileSync(patchPath, `${next}${block}`);
    return { ok: true, reason: null };
}
export function disableRow(patchPath, rowId) {
    return queuedWrite(async () => {
        if (!ROW_ID_RE.test(rowId)) {
            return { ok: false, reason: `行 id 含特殊字符 / invalid row id ${rowId}` };
        }
        const state = readUserPatchState(patchPath);
        if (state.disables.includes(rowId))
            return { ok: true, reason: null };
        return appendPatchEntry(patchPath, rowBlock(rowId, true));
    });
}
export function enableRow(patchPath, rowId) {
    return queuedWrite(async () => {
        if (!ROW_ID_RE.test(rowId)) {
            return { ok: false, reason: `行 id 含特殊字符 / invalid row id ${rowId}` };
        }
        const blockRe = new RegExp(`^- id: ['\"]?${escapeRegExp(rowId)}['\"]?\\r?\\n  disabled: true\\r?\\n`, 'mu');
        const text = (() => {
            try {
                return readFileSync(patchPath, 'utf8');
            }
            catch {
                return '';
            }
        })();
        if (blockRe.test(text)) {
            writeFileSync(patchPath, withPlaceholderRestored(text.replace(blockRe, '')));
            return { ok: true, reason: null };
        }
        const state = readUserPatchState(patchPath);
        if (state.forced.includes(rowId))
            return { ok: true, reason: null };
        return appendPatchEntry(patchPath, rowBlock(rowId, false));
    });
}
export function packageEnabled(profileName, packageName) {
    const profileDir = resolveProfileDir(profileName);
    const patchPath = join(profileDir, 'cordis.patch.yml');
    const rowIds = bundleInsertIds(profileDir, packageName);
    if (rowIds.length === 0)
        return { enabled: true, rowIds };
    const state = readUserPatchState(patchPath);
    const disabled = rowIds.some(id => state.disables.includes(id));
    const forced = rowIds.some(id => state.forced.includes(id));
    return { enabled: forced || !disabled, rowIds };
}
export async function setPackageEnabled(profileName, packageName, enabled) {
    const profileDir = resolveProfileDir(profileName);
    const patchPath = join(profileDir, 'cordis.patch.yml');
    const rowIds = bundleInsertIds(profileDir, packageName);
    if (rowIds.length === 0) {
        return { ok: false, reason: '该插件没有可开关的 bundle 行 / no bundle rows to toggle', rowIds };
    }
    let last = { ok: true, reason: null };
    for (const rowId of rowIds) {
        const result = enabled
            ? await enableRow(patchPath, rowId)
            : await disableRow(patchPath, rowId);
        if (!result.ok)
            last = result;
    }
    return { ...last, rowIds };
}
//# sourceMappingURL=patch-layer.js.map