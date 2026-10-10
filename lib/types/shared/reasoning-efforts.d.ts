/** Reasoning effort map written into llm-pi-ai for GPT-class reasoning models. */
export type ReasoningEffortsMap = Readonly<Record<string, string | null>>;
/**
 * GPT-class efforts on SupaNexus (gpt-5.x / gpt-6.x).
 * These gateways reject wire `none`; only low…max are accepted. Omit `off`
 * so the composer does not offer an unsupported Off level.
 */
export declare const GPT_REASONING_EFFORTS: ReasoningEffortsMap;
/**
 * Non-GPT models that advertise `reasoning` but may still allow omitting effort.
 * `off: null` means “do not send reasoning_effort” (pi-ai), not wire `none`.
 */
export declare const OPTIONAL_REASONING_EFFORTS: ReasoningEffortsMap;
/** True when the public model id should expose GPT-class reasoningEfforts. */
export declare function modelNeedsReasoningEfforts(modelID: string): boolean;
/** Pick the effort map for one catalog row. */
export declare function reasoningEffortsForModel(modelID: string, supportedParameters: readonly string[] | undefined): ReasoningEffortsMap | undefined;
//# sourceMappingURL=reasoning-efforts.d.ts.map