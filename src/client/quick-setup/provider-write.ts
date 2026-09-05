/** Write SupaNexus provider profile into engine-standard llm-pi-ai settings. */

import type { ProviderModelEntry } from '../../shared/auth-contract.ts'
import {
  CREDENTIAL_REF,
  PROVIDER_API,
  PROVIDER_DISPLAY_NAME,
  PROVIDER_NS,
  PROVIDER_ROUTE_ID,
} from '../../shared/provider.ts'

interface SettingsNamespaceSummary {
  readonly ns: string
  readonly revision: number
}

interface SettingsDescribeValue {
  readonly namespaces: ReadonlyArray<SettingsNamespaceSummary>
}

type RemoteResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: { readonly message: string; readonly code?: string } }

/** Minimal settings remote face used by quick-setup writes. */
export interface SettingsWriteRemote {
  describe(): Promise<RemoteResult<SettingsDescribeValue>>
  mutate(
    ns: string,
    ops: ReadonlyArray<{ op: string; path: readonly string[]; value?: unknown }>,
    expectedRevision: number | undefined,
  ): Promise<RemoteResult<unknown>>
}

export interface ProviderWriteInput {
  readonly baseURL: string
  readonly models: readonly ProviderModelEntry[]
}

async function revisionOf(settings: SettingsWriteRemote): Promise<number | undefined> {
  const response = await settings.describe()
  if (!response.ok) throw new Error(response.error.message)
  const view = response.value.namespaces.find(ns => ns.ns === PROVIDER_NS)
  return view?.revision
}

/** Create or replace the supanexus provider row (credentials already on Host). */
export async function writeSupaNexusProvider(
  settings: SettingsWriteRemote,
  input: ProviderWriteInput,
): Promise<void> {
  const revision = await revisionOf(settings)
  const value = {
    displayName: PROVIDER_DISPLAY_NAME,
    apiKeyEnv: CREDENTIAL_REF,
    api: PROVIDER_API,
    baseURL: input.baseURL,
    models: input.models.map(model => ({
      id: model.id,
      ...model.name === undefined ? {} : { name: model.name },
      ...model.contextWindow === undefined ? {} : { contextWindow: model.contextWindow },
      // pi-ai settings field is `input`; omit when unknown so catalog defaults apply.
      ...model.input === undefined || model.input.length === 0 ? {} : { input: [...model.input] },
    })),
  }
  const response = await settings.mutate(
    PROVIDER_NS,
    [{ op: 'set', path: ['providers', PROVIDER_ROUTE_ID], value }],
    revision,
  )
  if (!response.ok) {
    if (response.error.code === 'settings-conflict') {
      const retryRevision = await revisionOf(settings)
      const retry = await settings.mutate(
        PROVIDER_NS,
        [{ op: 'set', path: ['providers', PROVIDER_ROUTE_ID], value }],
        retryRevision,
      )
      if (!retry.ok) throw new Error(retry.error.message)
      return
    }
    throw new Error(response.error.message)
  }
}
