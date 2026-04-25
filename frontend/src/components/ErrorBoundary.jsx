/**
 * ErrorBoundary Component
 * 
 * A React Error Boundary that catches runtime errors in child components
 * and displays a graceful fallback UI instead of crashing the entire app.
 * 
 * @module ErrorBoundary
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
import { Component } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * Lifecycle method invoked after an error is thrown by a descendant component.
   * Updates state so the next render shows the fallback UI.
   * @param {Error} error - The error that was thrown.
   * @returns {Object} Updated state.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  /**
   * Lifecycle method for logging error info.
   * @param {Error} error - The error that was thrown.
   * @param {Object} errorInfo - Component stack trace information.
   */
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert" aria-live="assertive">
          <div className="glass-card" style={{ 
            maxWidth: '500px', 
            margin: '4rem auto', 
            textAlign: 'center',
            padding: '3rem 2rem' 
          }}>
            <AlertCircle size={48} style={{ color: '#ff6b6b', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              The Election Assistant encountered an unexpected error. 
              Your data has been saved to the cloud automatically.
            </p>
            <button 
              onClick={this.handleReset}
              className="btn-civic u-focus-ring"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCcw size={18} />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
