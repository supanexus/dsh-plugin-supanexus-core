//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@supanexus/dsh-plugin-supanexus-core`.
* @module @supanexus/dsh-plugin-supanexus-core/invariant
*/
const PACKAGE_NAME = "@supanexus/dsh-plugin-supanexus-core";
/** Cordis companion plugin name. */
const name = "supanexus-core-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the package retains no mutable state, and its three
* slot occupants install and leave through one transactional effect.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
