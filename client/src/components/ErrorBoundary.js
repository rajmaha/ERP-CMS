import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                <summary>Error Details (Development Only)</summary>
                <p>{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <p>{this.state.errorInfo.componentStack}</p>
                )}
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.resetError} className="btn btn-primary">
                Try Again
              </button>
              <a href="/" className="btn btn-secondary">
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
