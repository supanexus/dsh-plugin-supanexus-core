import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bundleInsertIds,
  disableRow,
  enableRow,
  packageEnabled,
  readUserPatchState,
  setPackageEnabled,
} from '../../src/host/plugin-market/patch-layer.ts'

const profileName = 'patch-layer-test-profile'
let profileDir = ''

vi.mock('../../src/host/plugin-market/profile-deps.ts', () => ({
  resolveProfileDir: (name: string) => {
    if (name !== profileName) throw new Error(`unexpected profile ${name}`)
    return profileDir
  },
}))

function resetProfile() {
  profileDir = join(tmpdir(), `dsh-patch-layer-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(join(profileDir, 'node_modules', '@demo', 'plugin'), { recursive: true })
}

afterEach(() => {
  if (profileDir && existsSync(profileDir)) {
    rmSync(profileDir, { recursive: true, force: true })
  }
})

describe('patch-layer', () => {
  it('reads disable and force rows from user patch', () => {
    resetProfile()
    const patchPath = join(profileDir, 'cordis.patch.yml')
    writeFileSync(patchPath, `- id: row-a\n  disabled: true\n- id: row-b\n  disabled: false\n`)

    expect(readUserPatchState(patchPath)).toEqual({
      disables: ['row-a'],
      forced: ['row-b'],
    })
  })

  it('parses bundle insert ids from cordis.patch.yml', () => {
    resetProfile()
    const packageDir = join(profileDir, 'node_modules', '@demo', 'plugin')
    writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ name: '@demo/plugin' }))
    writeFileSync(join(packageDir, 'cordis.patch.yml'), [
      '- insert:',
      '    - id: demo.row',
      '      uses: ./index.ts',
    ].join('\n'))

    expect(bundleInsertIds(profileDir, '@demo/plugin')).toEqual(['demo.row'])
  })

  it('disables and re-enables package rows via user patch', async () => {
    resetProfile()
    const packageDir = join(profileDir, 'node_modules', '@demo', 'plugin')
    writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ name: '@demo/plugin' }))
    writeFileSync(join(packageDir, 'cordis.patch.yml'), [
      '- insert:',
      '    - id: demo.row',
      '      uses: ./index.ts',
    ].join('\n'))
    const patchPath = join(profileDir, 'cordis.patch.yml')

    expect(packageEnabled(profileName, '@demo/plugin')).toEqual({
      enabled: true,
      rowIds: ['demo.row'],
    })

    const disable = await setPackageEnabled(profileName, '@demo/plugin', false)
    expect(disable.ok).toBe(true)
    expect(packageEnabled(profileName, '@demo/plugin').enabled).toBe(false)

    const enable = await setPackageEnabled(profileName, '@demo/plugin', true)
    expect(enable.ok).toBe(true)
    expect(packageEnabled(profileName, '@demo/plugin').enabled).toBe(true)
    expect(readFileSync(patchPath, 'utf8')).not.toContain('disabled: true')
  })

  it('enableRow removes disable block and disableRow appends disable block', async () => {
    resetProfile()
    const patchPath = join(profileDir, 'cordis.patch.yml')
    writeFileSync(patchPath, '[]\n')

    const disabled = await disableRow(patchPath, 'row-x')
    expect(disabled.ok).toBe(true)
    expect(readFileSync(patchPath, 'utf8')).toContain('- id: row-x\n  disabled: true')

    const enabled = await enableRow(patchPath, 'row-x')
    expect(enabled.ok).toBe(true)
    expect(readFileSync(patchPath, 'utf8')).not.toContain('disabled: true')
  })
})
