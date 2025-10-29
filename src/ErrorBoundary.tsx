import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="App">
          <main className="content" style={{ textAlign: 'center', padding: '50px' }}>
            <h1>🚨 Oops! Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            <div className="message-box error-box" style={{ margin: '20px auto', maxWidth: '600px' }}>
              <strong>Error:</strong>
              <pre style={{ textAlign: 'left' }}>{this.state.error?.message}</pre>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="upload-button"
              style={{ marginTop: '20px' }}
            >
              Go Home
            </button>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
