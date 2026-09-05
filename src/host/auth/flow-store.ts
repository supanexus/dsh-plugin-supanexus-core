/** In-memory OAuth flow state (one flow per quick-setup attempt). */

import type { AuthPhase, ProviderModelEntry } from '../../shared/auth-contract.ts'
import type { SupaLine } from '../../shared/line.ts'

const FLOW_TTL_MS = 600_000

export interface FlowResult {
  readonly baseURL: string
  readonly models: readonly ProviderModelEntry[]
  readonly credentialRef: string
  readonly line: SupaLine
}

export interface AuthFlow {
  readonly flowId: string
  readonly line: SupaLine
  readonly verifier: string
  readonly state: string
  readonly redirectUri: string
  readonly authorizeUrl: string
  readonly locale?: string
  phase: AuthPhase
  readonly createdAt: number
  consumed: boolean
  result?: FlowResult
  errorMessage?: string
}

const flows = new Map<string, AuthFlow>()
const stateIndex = new Map<string, string>()

function pruneExpired(now = Date.now()): void {
  for (const [id, flow] of flows) {
    if (now - flow.createdAt > FLOW_TTL_MS) {
      flows.delete(id)
      stateIndex.delete(flow.state)
    }
  }
}

/** Register a new flow; line is immutable for the lifetime of the flow. */
export function createFlow(entry: Omit<AuthFlow, 'phase' | 'createdAt' | 'consumed'>): AuthFlow {
  pruneExpired()
  const flow: AuthFlow = {
    ...entry,
    phase: 'awaiting-approval',
    createdAt: Date.now(),
    consumed: false,
  }
  flows.set(flow.flowId, flow)
  stateIndex.set(flow.state, flow.flowId)
  return flow
}

/** Lookup by flow id. */
export function getFlow(flowId: string): AuthFlow | undefined {
  pruneExpired()
  return flows.get(flowId)
}

/** Lookup by OAuth state (callback). */
export function getFlowByState(state: string): AuthFlow | undefined {
  pruneExpired()
  const flowId = stateIndex.get(state)
  if (flowId === undefined) return undefined
  return flows.get(flowId)
}

/** Mark state consumed to prevent replay. */
export function consumeState(state: string): AuthFlow | undefined {
  const flow = getFlowByState(state)
  if (flow === undefined || flow.consumed) return undefined
  flow.consumed = true
  return flow
}

export function setPhase(flowId: string, phase: AuthPhase): void {
  const flow = flows.get(flowId)
  if (flow !== undefined) flow.phase = phase
}

export function completeFlow(flowId: string, result: FlowResult): void {
  const flow = flows.get(flowId)
  if (flow === undefined) return
  flow.phase = 'done'
  flow.result = result
}

export function failFlow(flowId: string, message: string): void {
  const flow = flows.get(flowId)
  if (flow === undefined) return
  flow.phase = 'error'
  flow.errorMessage = message
}

/** Test helper: reset all flows. */
export function resetFlows(): void {
  flows.clear()
  stateIndex.clear()
}
