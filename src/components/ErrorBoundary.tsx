import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#F7F5F2' }}>
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-4" style={{ color: '#3A3A3A' }}>
              Something went wrong
            </h1>
            <p className="text-sm mb-6" style={{ color: '#5A5A5A' }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-full font-medium transition-colors touch-target"
              style={{
                backgroundColor: '#A2AD9C',
                color: '#F7F5F2',
              }}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2" style={{ color: '#3A3A3A' }}>
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs p-4 rounded bg-gray-100 overflow-auto" style={{ color: '#3A3A3A' }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

