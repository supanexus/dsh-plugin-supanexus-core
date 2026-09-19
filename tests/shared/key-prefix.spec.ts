import { describe, expect, it } from 'vitest'
import { matchesStoredKeyPrefix } from '../../src/shared/key-prefix.ts'

describe('matchesStoredKeyPrefix', () => {
  it('treats empty prefix as aligned', () => {
    expect(matchesStoredKeyPrefix('sk-snx-abcdefghijklmnop', '')).toBe(true)
    expect(matchesStoredKeyPrefix('', '')).toBe(true)
  })

  it('matches secret[:16] + ellipsis form', () => {
    const secret = 'sk-snx-abcdefghijklmnopQRST'
    const prefix = `${secret.slice(0, 16)}…`
    expect(matchesStoredKeyPrefix(secret, prefix)).toBe(true)
  })

  it('matches ascii triple-dot ellipsis', () => {
    const secret = 'sk-snx-abcdefghijklmnopQRST'
    const prefix = `${secret.slice(0, 16)}...`
    expect(matchesStoredKeyPrefix(secret, prefix)).toBe(true)
  })

  it('matches full secret when prefix equals secret', () => {
    expect(matchesStoredKeyPrefix('short-key', 'short-key')).toBe(true)
  })

  it('rejects manually changed secrets', () => {
    const secret = 'sk-snx-abcdefghijklmnopQRST'
    const prefix = `${secret.slice(0, 16)}…`
    expect(matchesStoredKeyPrefix('sk-other-project-key-xxxxx', prefix)).toBe(false)
    expect(matchesStoredKeyPrefix('', prefix)).toBe(false)
  })
})
