import { describe, expect, it } from 'vitest'
import {
  GPT_REASONING_EFFORTS,
  OPTIONAL_REASONING_EFFORTS,
  modelNeedsReasoningEfforts,
  reasoningEffortsForModel,
} from '../../src/shared/reasoning-efforts.ts'

describe('reasoning-efforts', () => {
  it('detects gpt-5/6 ids', () => {
    expect(modelNeedsReasoningEfforts('openai/gpt-5.6-luna')).toBe(true)
    expect(modelNeedsReasoningEfforts('gpt-6-astra')).toBe(true)
    expect(modelNeedsReasoningEfforts('deepseek/deepseek-flash')).toBe(false)
  })

  it('does not offer Off / none for GPT models', () => {
    expect(GPT_REASONING_EFFORTS.off).toBeUndefined()
    expect(GPT_REASONING_EFFORTS.low).toBe('low')
    expect(GPT_REASONING_EFFORTS.high).toBe('high')
  })

  it('omits wire effort on Off for optional reasoning models', () => {
    expect(OPTIONAL_REASONING_EFFORTS.off).toBeNull()
  })

  it('picks the map from id / supported_parameters', () => {
    expect(reasoningEffortsForModel('openai/gpt-6-astra', ['reasoning'])).toBe(GPT_REASONING_EFFORTS)
    expect(reasoningEffortsForModel('xai/grok-4.5', ['reasoning'])).toBe(OPTIONAL_REASONING_EFFORTS)
    expect(reasoningEffortsForModel('moonshot/kimi', ['tools'])).toBeUndefined()
  })
})
