/**
 * GPT-class efforts on SupaNexus (gpt-5.x / gpt-6.x).
 * These gateways reject wire `none`; only low…max are accepted. Omit `off`
 * so the composer does not offer an unsupported Off level.
 */
export const GPT_REASONING_EFFORTS = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    xhigh: 'xhigh',
    max: 'max',
};
/**
 * Non-GPT models that advertise `reasoning` but may still allow omitting effort.
 * `off: null` means “do not send reasoning_effort” (pi-ai), not wire `none`.
 */
export const OPTIONAL_REASONING_EFFORTS = {
    off: null,
    low: 'low',
    medium: 'medium',
    high: 'high',
    xhigh: 'xhigh',
    max: 'max',
};
/** True when the public model id should expose GPT-class reasoningEfforts. */
export function modelNeedsReasoningEfforts(modelID) {
    return /(?:^|\/)gpt-[56]/i.test(modelID.trim());
}
/** Pick the effort map for one catalog row. */
export function reasoningEffortsForModel(modelID, supportedParameters) {
    if (modelNeedsReasoningEfforts(modelID))
        return GPT_REASONING_EFFORTS;
    if (supportedParameters?.includes('reasoning') === true)
        return OPTIONAL_REASONING_EFFORTS;
    return undefined;
}
//# sourceMappingURL=reasoning-efforts.js.map