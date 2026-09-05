import { describe, expect, it, beforeEach } from 'vitest'
import {
  consumeState,
  createFlow,
  getFlow,
  resetFlows,
} from '../../src/host/auth/flow-store.ts'
import type { SupaLine } from '../../src/shared/line.ts'

const line: SupaLine = {
  id: 'cn',
  label: 'CN',
  origin: 'http://127.0.0.1:31002',
}

function isLoopbackRemote(remoteAddress: string): boolean {
  return remoteAddress === '127.0.0.1' || remoteAddress === '::1' || remoteAddress === '::ffff:127.0.0.1'
}

describe('auth callback guards', () => {
  it('accepts loopback remote addresses only', () => {
    expect(isLoopbackRemote('127.0.0.1')).toBe(true)
    expect(isLoopbackRemote('::1')).toBe(true)
    expect(isLoopbackRemote('10.0.0.1')).toBe(false)
  })
})

describe('auth flow store', () => {
  beforeEach(() => {
    resetFlows()
  })

  it('rejects replayed OAuth state', () => {
    createFlow({
      flowId: 'flow-1',
      line,
      verifier: 'verifier',
      state: 'state-abc',
      redirectUri: 'http://127.0.0.1:1/cb',
      authorizeUrl: 'https://example/authorize',
    })
    expect(consumeState('state-abc')?.flowId).toBe('flow-1')
    expect(consumeState('state-abc')).toBeUndefined()
  })

  it('keeps the line pinned for the lifetime of a flow', () => {
    createFlow({
      flowId: 'flow-2',
      line,
      verifier: 'verifier',
      state: 'state-xyz',
      redirectUri: 'http://127.0.0.1:1/cb',
      authorizeUrl: 'https://example/authorize',
    })
    const flow = getFlow('flow-2')
    expect(flow?.line.id).toBe('cn')
    expect(flow?.line.origin).toBe('http://127.0.0.1:31002')
  })
})
