/** Reasoning effort map written into llm-pi-ai for GPT-class reasoning models. */
export type ReasoningEffortsMap = Readonly<Record<string, string | null>>

/**
 * GPT-class efforts on SupaNexus (gpt-5.x / gpt-6.x).
 * These gateways reject wire `none`; only low…max are accepted. Omit `off`
 * so the composer does not offer an unsupported Off level.
 */
export const GPT_REASONING_EFFORTS: ReasoningEffortsMap = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'xhigh',
  max: 'max',
}

/**
 * Non-GPT models that advertise `reasoning` but may still allow omitting effort.
 * `off: null` means “do not send reasoning_effort” (pi-ai), not wire `none`.
 */
export const OPTIONAL_REASONING_EFFORTS: ReasoningEffortsMap = {
  off: null,
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'xhigh',
  max: 'max',
}

/** True when the public model id should expose GPT-class reasoningEfforts. */
export function modelNeedsReasoningEfforts(modelID: string): boolean {
  return /(?:^|\/)gpt-[56]/i.test(modelID.trim())
}

/** Pick the effort map for one catalog row. */
export function reasoningEffortsForModel(
  modelID: string,
  supportedParameters: readonly string[] | undefined,
): ReasoningEffortsMap | undefined {
  if (modelNeedsReasoningEfforts(modelID)) return GPT_REASONING_EFFORTS
  if (supportedParameters?.includes('reasoning') === true) return OPTIONAL_REASONING_EFFORTS
  return undefined
}
