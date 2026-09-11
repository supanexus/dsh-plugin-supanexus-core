import { describe, expect, it } from 'vitest'
import { GPT_REASONING_EFFORTS, modelNeedsReasoningEfforts } from '../../src/shared/reasoning-efforts.ts'

describe('reasoning-efforts', () => {
  it('detects gpt-5/6 ids', () => {
    expect(modelNeedsReasoningEfforts('openai/gpt-5.6-luna')).toBe(true)
    expect(modelNeedsReasoningEfforts('gpt-6-astra')).toBe(true)
    expect(modelNeedsReasoningEfforts('deepseek/deepseek-flash')).toBe(false)
  })

  it('maps off to none', () => {
    expect(GPT_REASONING_EFFORTS.off).toBe('none')
    expect(GPT_REASONING_EFFORTS.high).toBe('high')
  })
})
