import React, { Component, ErrorInfo, ReactNode } from "react";
import { isExtendedError, getUserFriendlyMessage } from "../utils/errorUtils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change (e.g., lessonId changes)
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with ExtendedError support
      return (
        <div className="error-boundary" role="alert" aria-live="polite">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p className="user-message">
              {this.state.error
                ? getUserFriendlyMessage(this.state.error)
                : "An unexpected error occurred"}
            </p>

            {isExtendedError(this.state.error) && (
              <div className="error-details">
                {this.state.error.helpUrl && (
                  <p>
                    <a
                      href={this.state.error.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get help with this issue
                    </a>
                  </p>
                )}
                <details>
                  <summary>Technical details</summary>
                  <p className="technical-details">
                    {this.state.error.technicalDetails}
                  </p>
                </details>
              </div>
            )}

            <button
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
              className="retry-button"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
