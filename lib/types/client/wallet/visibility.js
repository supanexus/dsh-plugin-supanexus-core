/** Derive whether the sidebar wallet should render. */
import { PROVIDER_ROUTE_ID } from "../../shared/provider.js";
/**
 * Show wallet when the user preference allows it, SupaNexus is connected,
 * and the active session model provider is the SupaNexus route (`supanexus`).
 */
export function shouldShowWallet(connected, provider, showWallet = false) {
    return showWallet && connected && provider === PROVIDER_ROUTE_ID;
}
//# sourceMappingURL=visibility.js.map