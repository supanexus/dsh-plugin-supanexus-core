/** Subscribe to boolean preferences from the bound ConfigForm. */

import { useEffect, useState } from 'react'
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SupaNexusUiSettings } from '../../shared/settings-contract.ts'

/** Effective showWallet (defaults to true while loading / missing). */
export function readShowWallet(scope: ConfigForm<SupaNexusUiSettings>): boolean {
  return scope.getSnapshot().value?.showWallet ?? true
}

/** Effective showBrand (defaults to true while loading / missing). */
export function readShowBrand(scope: ConfigForm<SupaNexusUiSettings>): boolean {
  return scope.getSnapshot().value?.showBrand ?? true
}

/** Active line id for .ai / .io site pick (`pinnedLine` → `resolvedLine` → `global`). */
export function readActiveLineId(scope: ConfigForm<SupaNexusUiSettings>): string {
  const value = scope.getSnapshot().value
  const pinned = value?.pinnedLine?.trim()
  if (pinned !== undefined && pinned.length > 0) return pinned
  const resolved = value?.resolvedLine?.trim()
  if (resolved !== undefined && resolved.length > 0) return resolved
  return 'global'
}

/** React mirror of {@link readShowWallet}. */
export function useShowWalletPref(scope: ConfigForm<SupaNexusUiSettings>): boolean {
  const [showWallet, setShowWallet] = useState(() => readShowWallet(scope))
  useEffect(() => scope.subscribe(() => {
    setShowWallet(readShowWallet(scope))
  }), [scope])
  return showWallet
}

/** React mirror of {@link readShowBrand}. */
export function useShowBrandPref(scope: ConfigForm<SupaNexusUiSettings>): boolean {
  const [showBrand, setShowBrand] = useState(() => readShowBrand(scope))
  useEffect(() => scope.subscribe(() => {
    setShowBrand(readShowBrand(scope))
  }), [scope])
  return showBrand
}

/** React mirror of {@link readActiveLineId}. */
export function useActiveLineId(scope: ConfigForm<SupaNexusUiSettings>): string {
  const [lineId, setLineId] = useState(() => readActiveLineId(scope))
  useEffect(() => scope.subscribe(() => {
    setLineId(readActiveLineId(scope))
  }), [scope])
  return lineId
}

/** Whether the namespace is ready and accepts writes. */
export function useSettingsWritable(scope: ConfigForm<SupaNexusUiSettings>): {
  available: boolean
  writable: boolean
} {
  const [state, setState] = useState(() => {
    const snap = scope.getSnapshot()
    return {
      available: snap.status === 'ready',
      writable: snap.writable,
    }
  })
  useEffect(() => scope.subscribe(() => {
    const snap = scope.getSnapshot()
    setState({
      available: snap.status === 'ready',
      writable: snap.writable,
    })
  }), [scope])
  return state
}
