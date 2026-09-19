import { Component, type ErrorInfo, type ReactNode } from 'react'

interface FooterErrorBoundaryProps {
  readonly label: string
  readonly children: ReactNode
}

interface FooterErrorBoundaryState {
  readonly failed: boolean
}

/**
 * Isolate one footer child so a render crash does not abdicate the whole
 * `sidebar.footer.action` list entry (wallet + skill market share one slot).
 */
export class FooterErrorBoundary extends Component<
  FooterErrorBoundaryProps,
  FooterErrorBoundaryState
> {
  override state: FooterErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): FooterErrorBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[supanexus] ${this.props.label} footer crashed`, error, info.componentStack)
  }

  override render(): ReactNode {
    if (this.state.failed) return null
    return this.props.children
  }
}
