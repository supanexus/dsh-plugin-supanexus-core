import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  base64UrlEncode,
  challengeFromVerifier,
  generateState,
  generateVerifier,
  isValidVerifier,
} from '../../src/host/auth/pkce.ts'

describe('pkce', () => {
  it('generates verifiers within RFC 7636 charset and length', () => {
    const verifier = generateVerifier()
    expect(isValidVerifier(verifier)).toBe(true)
    expect(verifier).toHaveLength(64)
  })

  it('produces stable S256 challenges', () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    const challenge = challengeFromVerifier(verifier)
    const expected = base64UrlEncode(createHash('sha256').update(verifier).digest())
    expect(challenge).toBe(expected)
    expect(challenge).not.toContain('=')
  })

  it('generates opaque state values', () => {
    const a = generateState()
    const b = generateState()
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(20)
  })
})
