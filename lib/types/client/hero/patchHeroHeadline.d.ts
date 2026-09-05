/**
 * Swap known official hero headline text nodes under `root`.
 * @param root - DOM subtree to scan.
 */
export declare function patchHeroHeadlines(root: ParentNode): void;
/** Restore official headlines previously rewritten by {@link patchHeroHeadlines}. */
export declare function restoreHeroHeadlines(root: ParentNode): void;
/**
 * Hide the official hero preview badge until a slot or locale override is available.
 * @param root - DOM subtree to scan.
 */
export declare function hideHeroPreviewBadge(root: ParentNode): void;
/** Show previously hidden hero preview badges. */
export declare function showHeroPreviewBadge(root: ParentNode): void;
/** Apply SupaNexus hero chrome patches under `root`. */
export declare function patchHeroChrome(root: ParentNode): void;
/** Undo SupaNexus hero chrome patches under `root`. */
export declare function clearHeroChrome(root: ParentNode): void;
/**
 * Keep hero chrome in sync while the conversation shell mounts or hot-reloads.
 * @returns disposer disconnecting the observer.
 */
export declare function watchHeroChromePatches(): () => void;
//# sourceMappingURL=patchHeroHeadline.d.ts.map