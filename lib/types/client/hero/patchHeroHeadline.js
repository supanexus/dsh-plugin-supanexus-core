/** Official hero headlines replaced by SupaNexus copy until `conversation.hero.headline` slot ships. */
const HEADLINE_REPLACEMENTS = new Map([
    ['探索未至之境', '为你打造专属Agent生态应用'],
    ['Into the Unknown', 'Building your exclusive Agent ecosystem application'],
]);
const HEADLINE_REVERSALS = new Map([...HEADLINE_REPLACEMENTS].map(([from, to]) => [to, from]));
/** Hero preview badge copy shipped by ui-conversation. */
const PREVIEW_BADGE_LABELS = new Set(['预览版', 'Preview']);
/**
 * Swap known official hero headline text nodes under `root`.
 * @param root - DOM subtree to scan.
 */
export function patchHeroHeadlines(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
        const text = node.textContent;
        if (text !== null) {
            const next = HEADLINE_REPLACEMENTS.get(text);
            if (next !== undefined)
                node.textContent = next;
        }
        node = walker.nextNode();
    }
}
/** Restore official headlines previously rewritten by {@link patchHeroHeadlines}. */
export function restoreHeroHeadlines(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
        const text = node.textContent;
        if (text !== null) {
            const next = HEADLINE_REVERSALS.get(text);
            if (next !== undefined)
                node.textContent = next;
        }
        node = walker.nextNode();
    }
}
/**
 * Hide the official hero preview badge until a slot or locale override is available.
 * @param root - DOM subtree to scan.
 */
export function hideHeroPreviewBadge(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
        const text = node.textContent?.trim();
        if (text !== undefined && PREVIEW_BADGE_LABELS.has(text)) {
            const element = node.parentElement;
            if (element !== null && element.textContent?.trim() === text) {
                element.style.display = 'none';
                element.setAttribute('aria-hidden', 'true');
            }
        }
        node = walker.nextNode();
    }
}
/** Show previously hidden hero preview badges. */
export function showHeroPreviewBadge(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node !== null) {
        const text = node.textContent?.trim();
        if (text !== undefined && PREVIEW_BADGE_LABELS.has(text)) {
            const element = node.parentElement;
            if (element !== null && element.getAttribute('aria-hidden') === 'true') {
                element.style.display = '';
                element.removeAttribute('aria-hidden');
            }
        }
        node = walker.nextNode();
    }
}
/** Apply SupaNexus hero chrome patches under `root`. */
export function patchHeroChrome(root) {
    patchHeroHeadlines(root);
    hideHeroPreviewBadge(root);
}
/** Undo SupaNexus hero chrome patches under `root`. */
export function clearHeroChrome(root) {
    restoreHeroHeadlines(root);
    showHeroPreviewBadge(root);
}
/**
 * Keep hero chrome in sync while the conversation shell mounts or hot-reloads.
 * @returns disposer disconnecting the observer.
 */
export function watchHeroChromePatches() {
    const run = () => patchHeroChrome(document.body);
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
}
//# sourceMappingURL=patchHeroHeadline.js.map