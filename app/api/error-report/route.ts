import { NextRequest, NextResponse } from 'next/server'

interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  level: 'global' | 'page' | 'component'
  userAgent: string
  url: string
}

export async function POST(request: NextRequest) {
  try {
    const errorData: ErrorReport = await request.json()
    
    // Validate required fields
    if (!errorData.message || !errorData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log error details for monitoring
    console.error('Error Report:', {
      message: errorData.message,
      level: errorData.level,
      url: errorData.url,
      timestamp: errorData.timestamp,
      userAgent: errorData.userAgent?.substring(0, 100), // Truncate for security
      stack: errorData.stack?.substring(0, 1000) // Truncate for storage
    })

    // In production, you would send this to your error monitoring service
    // Examples: Sentry, LogRocket, Rollbar, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example for Sentry
      // Sentry.captureException(new Error(errorData.message), {
      //   tags: {
      //     level: errorData.level,
      //     component: 'error-boundary'
      //   },
      //   extra: {
      //     url: errorData.url,
      //     userAgent: errorData.userAgent,
      //     componentStack: errorData.componentStack
      //   }
      // })

      // Example for custom logging service
      // await fetch(process.env.ERROR_LOGGING_ENDPOINT, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${process.env.ERROR_LOGGING_TOKEN}`
      //   },
      //   body: JSON.stringify({
      //     ...errorData,
      //     service: 'ai-navigator',
      //     environment: process.env.NODE_ENV
      //   })
      // })
    }

    // Store critical errors in database (optional)
    if (errorData.level === 'global') {
      try {
        // Store in Supabase or your preferred database
        // const { error } = await supabase
        //   .from('error_logs')
        //   .insert({
        //     message: errorData.message,
        //     level: errorData.level,
        //     url: errorData.url,
        //     user_agent: errorData.userAgent,
        //     stack_trace: errorData.stack,
        //     created_at: errorData.timestamp
        //   })
      } catch (dbError) {
        console.error('Failed to store error in database:', dbError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Error report received' 
    })

  } catch (error) {
    console.error('Failed to process error report:', error)
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}

// NaviGuard-AI Security Audited - 2026-06-01
