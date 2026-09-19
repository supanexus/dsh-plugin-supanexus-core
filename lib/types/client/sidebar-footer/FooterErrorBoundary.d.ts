import { Component, type ErrorInfo, type ReactNode } from 'react';
interface FooterErrorBoundaryProps {
    readonly label: string;
    readonly children: ReactNode;
}
interface FooterErrorBoundaryState {
    readonly failed: boolean;
}
/**
 * Isolate one footer child so a render crash does not abdicate the whole
 * `sidebar.footer.action` list entry (wallet + skill market share one slot).
 */
export declare class FooterErrorBoundary extends Component<FooterErrorBoundaryProps, FooterErrorBoundaryState> {
    state: FooterErrorBoundaryState;
    static getDerivedStateFromError(): FooterErrorBoundaryState;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=FooterErrorBoundary.d.ts.map