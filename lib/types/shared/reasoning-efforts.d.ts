/** Reasoning effort map written into llm-pi-ai for GPT-class reasoning models. */
export type ReasoningEffortsMap = Readonly<Record<string, string | null>>;
/** Catalog-aligned efforts so Off sends wire `none` (completions + tools compatible). */
export declare const GPT_REASONING_EFFORTS: ReasoningEffortsMap;
/** True when the public model id should expose reasoningEfforts on the SupaNexus route. */
export declare function modelNeedsReasoningEfforts(modelID: string): boolean;
//# sourceMappingURL=reasoning-efforts.d.ts.map