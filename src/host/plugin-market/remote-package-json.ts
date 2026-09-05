/** Fetch plugin package.json from Git hosting at an operational ref. */

import type { PluginListingRepository } from '../../shared/plugin-market-contract.ts'

export interface RemotePackageManifest {
  readonly name: string
  readonly version: string
  readonly provider: PluginListingRepository['provider']
}

function githubSlug(repoUrl: string): string | undefined {
  try {
    const u = new URL(repoUrl)
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return undefined
    return u.pathname.replace(/^\/+/, '').replace(/\.git$/, '')
  } catch {
    return undefined
  }
}

function giteeSlug(repoUrl: string): string | undefined {
  try {
    const u = new URL(repoUrl)
    if (u.hostname !== 'gitee.com' && u.hostname !== 'www.gitee.com') return undefined
    return u.pathname.replace(/^\/+/, '').replace(/\.git$/, '')
  } catch {
    return undefined
  }
}

/** Build a raw package.json URL for one repository channel and ref. */
export function buildRemotePackageJsonUrl(
  repo: PluginListingRepository,
  ref: string,
): string | undefined {
  const repoUrl = repo.url?.trim() ?? ''
  if (repoUrl.length === 0) return undefined
  const targetRef = ref.trim().length > 0 ? ref.trim() : 'HEAD'
  if (repo.provider === 'github') {
    const slug = githubSlug(repoUrl)
    if (slug === undefined) return undefined
    return `https://raw.githubusercontent.com/${slug}/${targetRef}/package.json`
  }
  if (repo.provider === 'gitee') {
    const slug = giteeSlug(repoUrl)
    if (slug === undefined) return undefined
    return `https://gitee.com/${slug}/raw/${targetRef}/package.json`
  }
  return undefined
}

/** Fetch and parse remote package.json; tries candidates in order. */
export async function fetchRemotePackageManifest(
  candidates: readonly PluginListingRepository[],
  targetRef: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RemotePackageManifest | undefined> {
  for (const repo of candidates) {
    const url = buildRemotePackageJsonUrl(repo, targetRef)
    if (url === undefined) continue
    try {
      const response = await fetchImpl(url, { method: 'GET' })
      if (!response.ok) continue
      const body = await response.json() as { name?: string; version?: string }
      const version = body.version?.trim()
      const name = body.name?.trim()
      if (version === undefined || version.length === 0) continue
      if (name === undefined || name.length === 0) continue
      return { name, version, provider: repo.provider }
    } catch {
      /* try next channel */
    }
  }
  return undefined
}
