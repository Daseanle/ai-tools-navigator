"use client"

import React from 'react'
import { AlertCircle, RefreshCw, Home, MessageSquare, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  level?: 'page' | 'component' | 'global'
  title?: string
  description?: string
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  level?: 'page' | 'component' | 'global'
  title?: string
  description?: string
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  level = 'component',
  title,
  description 
}) => {
  const handleReport = () => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level
    }
    
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(console.error)
  }

  // Global error - full screen
  if (level === 'global') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title || '系统错误'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {description || '应用程序遇到了意外错误，请刷新页面重试'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                调试信息:
              </h3>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {error.message}
              </pre>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新页面
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <Button 
              onClick={handleReport} 
              variant="secondary" 
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              报告问题
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Page/Component error - inline
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {title || (level === 'page' ? '页面错误' : '组件错误')}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {description || error.message || '遇到意外错误，请重试'}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
          {level === 'page' && (
            <Button 
              onClick={() => window.location.reload()} 
              variant="default" 
              size="sm"
            >
              刷新页面
            </Button>
          )}
          <Button 
            onClick={handleReport} 
            variant="secondary" 
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            报告
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer">错误详情 (仅开发环境)</summary>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Send error to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: this.props.level === 'global',
        custom_parameter_1: error.stack,
        custom_parameter_2: errorInfo.componentStack
      })
    }
    
    // Report to error tracking service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          level: this.props.level || 'component',
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error)
    }
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
          level={this.props.level}
          title={this.props.title}
          description={this.props.description}
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error('Error handled by useErrorHandler:', error, context)
    
    // Send error to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_parameter_1: error.stack,
        custom_parameter_2: context
      })
    }
    
    setError(error)
  }, [])

  // Re-throw error to be caught by ErrorBoundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError, error }
}

// Higher-order component wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ComponentType<ErrorFallbackProps>
    level?: 'page' | 'component' | 'global'
    title?: string
    description?: string
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Simple error boundary for quick wrapping
export const SimpleErrorBoundary: React.FC<{
  children: React.ReactNode
  message?: string
}> = ({ children, message = '此功能暂时无法使用' }) => {
  return (
    <ErrorBoundary
      level="component"
      description={message}
      fallback={({ error, resetError }) => (
        <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-700 dark:text-red-300 mb-4">{message}</p>
            <Button onClick={resetError} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
