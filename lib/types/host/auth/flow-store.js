/** In-memory OAuth flow state (one flow per quick-setup attempt). */
const FLOW_TTL_MS = 600_000;
const flows = new Map();
const stateIndex = new Map();
function pruneExpired(now = Date.now()) {
    for (const [id, flow] of flows) {
        if (now - flow.createdAt > FLOW_TTL_MS) {
            flows.delete(id);
            stateIndex.delete(flow.state);
        }
    }
}
/** Register a new flow; line is immutable for the lifetime of the flow. */
export function createFlow(entry) {
    pruneExpired();
    const flow = {
        ...entry,
        phase: 'awaiting-approval',
        createdAt: Date.now(),
        consumed: false,
    };
    flows.set(flow.flowId, flow);
    stateIndex.set(flow.state, flow.flowId);
    return flow;
}
/** Lookup by flow id. */
export function getFlow(flowId) {
    pruneExpired();
    return flows.get(flowId);
}
/** Lookup by OAuth state (callback). */
export function getFlowByState(state) {
    pruneExpired();
    const flowId = stateIndex.get(state);
    if (flowId === undefined)
        return undefined;
    return flows.get(flowId);
}
/** Mark state consumed to prevent replay. */
export function consumeState(state) {
    const flow = getFlowByState(state);
    if (flow === undefined || flow.consumed)
        return undefined;
    flow.consumed = true;
    return flow;
}
export function setPhase(flowId, phase) {
    const flow = flows.get(flowId);
    if (flow !== undefined)
        flow.phase = phase;
}
export function completeFlow(flowId, result) {
    const flow = flows.get(flowId);
    if (flow === undefined)
        return;
    flow.phase = 'done';
    flow.result = result;
}
export function failFlow(flowId, message) {
    const flow = flows.get(flowId);
    if (flow === undefined)
        return;
    flow.phase = 'error';
    flow.errorMessage = message;
}
/** Test helper: reset all flows. */
export function resetFlows() {
    flows.clear();
    stateIndex.clear();
}
//# sourceMappingURL=flow-store.js.map