/**
 * Package-owned invariant companion for `@supanexus/dsh-plugin-supanexus-core`.
 * @module @supanexus/dsh-plugin-supanexus-core/invariant
 */
const PACKAGE_NAME = '@supanexus/dsh-plugin-supanexus-core';
/** Cordis companion plugin name. */
export const name = 'supanexus-core-invariant';
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants'];
/**
 * No runtime invariant: the package retains no mutable state, and its three
 * slot occupants install and leave through one transactional effect.
 */
const install = () => { };
/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
/* jscpd:ignore-end */
//# sourceMappingURL=invariant.js.map