import { NextResponse } from 'next/server'

export class ErrorHandler {
  static logError(error: Error, context?: string) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context: context || 'Unknown',
      env: process.env.NODE_ENV
    }
    
    if (process.env.NODE_ENV === 'production') {
      console.error('ERROR:', JSON.stringify(errorLog))
    } else {
      console.error('Error occurred:', errorLog)
    }
  }

  static handleApiError(error: unknown, context: string = 'API') {
    this.logError(error instanceof Error ? error : new Error(String(error)), context)
    
    if (error instanceof Error) {
      if (error.message.includes('CSRF') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_ERROR' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('validation') || error.message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid request data', code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Database') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error', code: 'DB_ERROR' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }

  static createSafeResponse(data: any, status: number = 200) {
    try {
      return NextResponse.json(data, { status })
    } catch (error) {
      this.logError(error instanceof Error ? error : new Error(String(error)), 'JSON_SERIALIZATION')
      return NextResponse.json(
        { error: 'Response serialization error', code: 'SERIALIZATION_ERROR' },
        { status: 500 }
      )
    }
  }

  static wrapAsyncHandler(handler: Function) {
    return async (...args: any[]) => {
      try {
        return await handler(...args)
      } catch (error) {
        return this.handleApiError(error, 'ASYNC_HANDLER')
      }
    }
  }
}

export function withErrorHandling(handler: Function) {
  return ErrorHandler.wrapAsyncHandler(handler)
}

export default ErrorHandler