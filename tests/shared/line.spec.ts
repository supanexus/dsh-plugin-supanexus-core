import { describe, expect, it } from 'vitest'
import {
  dataPlaneBase,
  harnessBase,
  probeUrl,
  type SupaLine,
} from '../../src/shared/line.ts'

const localOpenApi = 'http://127.0.0.1:31002'
const localHarness = 'http://127.0.0.1:31005'

const globalLine: SupaLine = {
  id: 'global',
  label: 'Global',
  origin: localOpenApi,
  harnessOrigin: localHarness,
}

const cnLine: SupaLine = {
  id: 'cn',
  label: 'CN',
  origin: localOpenApi,
}

describe('shared/line', () => {
  it('derives harness, data plane, and probe URLs from one line model', () => {
    expect(probeUrl(globalLine)).toBe(`${localOpenApi}/healthz`)
    expect(dataPlaneBase(globalLine)).toBe(`${localOpenApi}/v1`)
    expect(harnessBase(globalLine)).toBe(`${localHarness}/harness/v1`)
  })

  it('falls back harness base to origin when harnessOrigin is omitted', () => {
    expect(harnessBase(cnLine)).toBe(`${localOpenApi}/harness/v1`)
    expect(dataPlaneBase(cnLine)).toBe(`${localOpenApi}/v1`)
    expect(probeUrl(cnLine)).toBe(`${localOpenApi}/healthz`)
  })

  it('keeps data plane and probe on origin when only harnessOrigin differs', () => {
    expect(dataPlaneBase(globalLine)).toBe(`${localOpenApi}/v1`)
    expect(probeUrl(globalLine)).toBe(`${localOpenApi}/healthz`)
  })
})
