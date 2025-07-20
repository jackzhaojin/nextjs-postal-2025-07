"use client"

import * as React from "react"
import { RefreshCwIcon, AlertTriangleIcon, HomeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  retry: () => void
  canRetry: boolean
  retryCount: number
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props
    const { hasError } = this.state

    // Reset error boundary if resetKeys change and we're in error state
    if (hasError && resetKeys !== prevProps.resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, idx) => 
          prevProps.resetKeys![idx] !== key
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  retry = () => {
    const maxRetries = this.props.maxRetries ?? 3
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state
    const { children, fallback: FallbackComponent, maxRetries = 3 } = this.props

    if (hasError) {
      const canRetry = retryCount < maxRetries

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            retry={this.retry}
            canRetry={canRetry}
            retryCount={retryCount}
          />
        )
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          retry={this.retry}
          canRetry={canRetry}
          retryCount={retryCount}
        />
      )
    }

    return children
  }
}

// Default fallback component
function DefaultErrorFallback({
  error,
  errorInfo,
  retry,
  canRetry,
  retryCount,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            We're sorry, but an unexpected error occurred. Please try again or contact support if the problem persists.
          </div>

          {isDevelopment && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details (Development Mode)
              </summary>
              <div className="mt-2 space-y-2">
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="text-xs font-medium text-gray-700">Error Message:</div>
                  <div className="text-xs text-red-600 font-mono break-words">
                    {error.message}
                  </div>
                </div>
                {error.stack && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-700">Stack Trace:</div>
                    <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-xs font-medium text-gray-700">Component Stack:</div>
                    <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {canRetry && (
              <Button 
                onClick={retry}
                className="inline-flex items-center"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount}/3)`}
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center"
            >
              <HomeIcon className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {retryCount >= 3 && (
            <div className="text-center text-sm text-gray-500">
              Max retry attempts reached. Please refresh the page or contact support.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { setError, resetError }
}

// HOC wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
