/** Catalog-aligned efforts so Off sends wire `none` (completions + tools compatible). */
export const GPT_REASONING_EFFORTS = {
    off: 'none',
    low: 'low',
    medium: 'medium',
    high: 'high',
    xhigh: 'xhigh',
    max: 'max',
};
/** True when the public model id should expose reasoningEfforts on the SupaNexus route. */
export function modelNeedsReasoningEfforts(modelID) {
    return /(?:^|\/)gpt-[56]/i.test(modelID.trim());
}
//# sourceMappingURL=reasoning-efforts.js.map