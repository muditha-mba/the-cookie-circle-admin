"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type AnalyticsErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type AnalyticsErrorBoundaryState = {
  hasError: boolean;
};

export class AnalyticsErrorBoundary extends Component<
  AnalyticsErrorBoundaryProps,
  AnalyticsErrorBoundaryState
> {
  state: AnalyticsErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AnalyticsErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Analytics dashboard error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-danger/40 bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-text-primary">
            {this.props.title ?? "Unable to load analytics"}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Something went wrong while rendering this dashboard. Refresh the page or try
            again later.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
