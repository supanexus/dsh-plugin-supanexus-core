/** Reasoning effort map written into llm-pi-ai for GPT-class reasoning models. */
export type ReasoningEffortsMap = Readonly<Record<string, string | null>>

/** Catalog-aligned efforts so Off sends wire `none` (completions + tools compatible). */
export const GPT_REASONING_EFFORTS: ReasoningEffortsMap = {
  off: 'none',
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'xhigh',
  max: 'max',
}

/** True when the public model id should expose reasoningEfforts on the SupaNexus route. */
export function modelNeedsReasoningEfforts(modelID: string): boolean {
  return /(?:^|\/)gpt-[56]/i.test(modelID.trim())
}
