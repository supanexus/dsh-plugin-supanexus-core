import { describe, expect, it } from 'vitest'
import {
  OFFICIAL_SITE_AI,
  OFFICIAL_SITE_IO,
  buildOfficialSiteUrl,
  resolveOfficialSiteBase,
} from '../../src/shared/official-site.ts'

describe('resolveOfficialSiteBase', () => {
  it('maps cn line to .io', () => {
    expect(resolveOfficialSiteBase({ lineId: 'cn' })).toBe(OFFICIAL_SITE_IO)
  })

  it('maps global line to .ai', () => {
    expect(resolveOfficialSiteBase({ lineId: 'global' })).toBe(OFFICIAL_SITE_AI)
  })

  it('infers .io from API origin host', () => {
    expect(resolveOfficialSiteBase({ lineOrigin: 'https://api.supanexus.io' }))
      .toBe(OFFICIAL_SITE_IO)
  })

  it('defaults to .ai when unset', () => {
    expect(resolveOfficialSiteBase({})).toBe(OFFICIAL_SITE_AI)
  })
})

describe('buildOfficialSiteUrl', () => {
  it('appends zh/en locale path', () => {
    expect(buildOfficialSiteUrl({ lineId: 'global', locale: 'zh-CN' }))
      .toBe(`${OFFICIAL_SITE_AI}/zh`)
    expect(buildOfficialSiteUrl({ lineId: 'cn', locale: 'en-US' }))
      .toBe(`${OFFICIAL_SITE_IO}/en`)
  })
})
