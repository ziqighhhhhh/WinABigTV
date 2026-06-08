import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[app render error]', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
          <div className="mx-auto max-w-lg rounded-lg border border-red-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">Application failed to render</p>
            <h1 className="mt-2 text-xl font-semibold">Please refresh or contact support</h1>
            <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-white">
              {this.state.error.message}
            </pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
