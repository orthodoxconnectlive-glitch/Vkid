import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare state and props types for class component with custom tsconfig
  declare props: Props;
  declare state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VKid Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent">
                VKid Needs a Quick Refresh
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                We updated VKid with new stories and games! Tap reload to load the latest version safely.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-[11px] font-mono text-slate-600 overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm shadow-lg transform active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Reload VKid App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
