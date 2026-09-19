import { Component } from 'react';
/**
 * Isolate one footer child so a render crash does not abdicate the whole
 * `sidebar.footer.action` list entry (wallet + skill market share one slot).
 */
export class FooterErrorBoundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error, info) {
        console.error(`[supanexus] ${this.props.label} footer crashed`, error, info.componentStack);
    }
    render() {
        if (this.state.failed)
            return null;
        return this.props.children;
    }
}
//# sourceMappingURL=FooterErrorBoundary.js.map