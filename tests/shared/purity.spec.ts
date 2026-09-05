import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sharedDir = new URL('../../src/shared', import.meta.url).pathname

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

describe('shared purity', () => {
  it('does not import node, DOM, or React in shared modules', () => {
    const forbidden = /from ['"](?:node:|react|react-dom)|\bwindow\b|\bdocument\b/
    for (const file of walk(sharedDir)) {
      if (!file.endsWith('.ts')) continue
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(forbidden)
    }
  })
})
