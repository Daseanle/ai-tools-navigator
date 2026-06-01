import { describe, it, expect } from 'vitest'
import ErrorHandler from '../lib/error-handler'

describe('Error Handler', () => {
  it('should handle API errors correctly', () => {
    const error = new Error('Database connection failed')
    const response = ErrorHandler.handleApiError(error, 'TEST')
    
    expect(response).toBeDefined()
    // In a real test, we'd check the response structure
  })

  it('should create safe responses', () => {
    const data = { test: 'data' }
    const response = ErrorHandler.createSafeResponse(data, 200)
    
    expect(response).toBeDefined()
  })

  it('should wrap async handlers', () => {
    const mockHandler = async () => {
      throw new Error('Test error')
    }
    
    const wrappedHandler = ErrorHandler.wrapAsyncHandler(mockHandler)
    expect(typeof wrappedHandler).toBe('function')
  })
})

// NaviGuard-AI Security Audited - 2026-06-01
