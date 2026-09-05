// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { hideHeroPreviewBadge, patchHeroHeadlines } from '../../src/client/hero/patchHeroHeadline.ts'

describe('patchHeroHeadlines', () => {
  it('replaces the official zh/en hero headline copy', () => {
    const root = document.createElement('div')
    root.innerHTML = '<span>探索未至之境</span><span>Into the Unknown</span>'
    patchHeroHeadlines(root)
    expect(root.textContent).toContain('为你打造专属Agent生态应用')
    expect(root.textContent).toContain('Building your exclusive Agent ecosystem application')
  })
})

describe('hideHeroPreviewBadge', () => {
  it('hides the official preview badge labels', () => {
    const root = document.createElement('div')
    root.innerHTML = '<span class="badge">预览版</span><span>Preview</span>'
    hideHeroPreviewBadge(root)
    for (const badge of root.querySelectorAll('span')) {
      expect(badge.style.display).toBe('none')
    }
  })
})
