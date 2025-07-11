import { expect, test, describe, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// ==================== Test Configuration ====================

export const testConfig = {
  timeout: 10000,
  setupFiles: ['./tests/setup.ts'],
  environment: 'jsdom',
  globals: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'tests/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**'
    ]
  }
}

// ==================== Mock Data Factory ====================

export class MockDataFactory {
  static createUser(overrides = {}) {
    return {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      membership: {
        type: 'free',
        is_active: true,
        features: ['basic_search'],
        limits: {
          favorites: 10,
          searches_per_day: 100,
          api_calls_per_month: 1000,
          trial_tools: 3
        }
      },
      settings: {
        language: 'zh',
        theme: 'light',
        notifications: {
          email: true,
          browser: false,
          new_tools: true,
          updates: false,
          marketing: false
        },
        privacy: {
          profile_public: false,
          usage_analytics: true,
          data_sharing: false
        }
      },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      ...overrides
    }
  }

  static createTool(overrides = {}) {
    return {
      id: 'tool-1',
      slug: 'test-tool',
      name: 'Test Tool',
      tagline: 'A test AI tool',
      description: 'This is a test tool for testing purposes',
      logo_url: 'https://example.com/logo.png',
      website_url: 'https://example.com',
      rating: 4.5,
      rating_count: 100,
      visits: 1000,
      pricing_type: 'freemium',
      featured: false,
      category_id: 'cat-1',
      category: {
        id: 'cat-1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        icon: 'star',
        color: '#3B82F6',
        tools_count: 5,
        featured: false
      },
      tags: [
        { id: 'tag-1', name: 'AI', slug: 'ai' },
        { id: 'tag-2', name: 'Test', slug: 'test' }
      ],
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      ...overrides
    }
  }

  static createCategory(overrides = {}) {
    return {
      id: 'cat-1',
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category',
      icon: 'star',
      color: '#3B82F6',
      tools_count: 5,
      featured: false,
      sort_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      ...overrides
    }
  }

  static createApiResponse(data: any, success = true) {
    return {
      success,
      data,
      message: success ? 'Success' : 'Error',
      timestamp: new Date().toISOString()
    }
  }

  static createPaginatedResponse(data: any[], page = 1, limit = 20) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      },
      timestamp: new Date().toISOString()
    }
  }
}

// ==================== Mock API Responses ====================

export class MockAPI {
  static setupFetchMock() {
    global.fetch = vi.fn()
    return global.fetch as any
  }

  static mockSuccessResponse(data: any) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(MockDataFactory.createApiResponse(data))
    } as Response)
  }

  static mockErrorResponse(message: string, status = 400) {
    return Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      })
    } as Response)
  }

  static mockNetworkError() {
    return Promise.reject(new Error('Network error'))
  }
}

// ==================== Component Test Helpers ====================

export class ComponentTestHelpers {
  static async waitForElement(testId: string) {
    return await waitFor(() => screen.getByTestId(testId))
  }

  static async waitForText(text: string) {
    return await waitFor(() => screen.getByText(text))
  }

  static async clickButton(text: string) {
    const button = screen.getByRole('button', { name: text })
    fireEvent.click(button)
    return button
  }

  static async fillInput(label: string, value: string) {
    const input = screen.getByLabelText(label)
    fireEvent.change(input, { target: { value } })
    return input
  }

  static async submitForm(testId?: string) {
    const form = testId 
      ? screen.getByTestId(testId)
      : screen.getByRole('form') || document.querySelector('form')!
    
    fireEvent.submit(form)
    return form
  }

  static expectToBeInDocument(element: HTMLElement) {
    expect(element).toBeInTheDocument()
  }

  static expectToHaveText(element: HTMLElement, text: string) {
    expect(element).toHaveTextContent(text)
  }

  static expectToBeDisabled(element: HTMLElement) {
    expect(element).toBeDisabled()
  }
}

// ==================== Store Test Helpers ====================

export class StoreTestHelpers {
  static createMockStore(initialState = {}) {
    return {
      getState: () => initialState,
      setState: vi.fn(),
      subscribe: vi.fn(),
      destroy: vi.fn(),
      ...initialState
    }
  }

  static expectStateUpdate(mockSetState: any, expectedState: any) {
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining(expectedState)
    )
  }
}

// ==================== API Test Helpers ====================

export class APITestHelpers {
  static async testSuccessfulRequest(
    apiCall: () => Promise<any>,
    expectedData: any
  ) {
    const result = await apiCall()
    expect(result).toEqual(expectedData)
  }

  static async testFailedRequest(
    apiCall: () => Promise<any>,
    expectedError: string
  ) {
    await expect(apiCall()).rejects.toThrow(expectedError)
  }

  static expectFetchCalled(
    mockFetch: any,
    url: string,
    options?: RequestInit
  ) {
    expect(mockFetch).toHaveBeenCalledWith(url, options)
  }

  static expectFetchCalledTimes(
    mockFetch: any,
    times: number
  ) {
    expect(mockFetch).toHaveBeenCalledTimes(times)
  }
}

// ==================== Performance Test Helpers ====================

export class PerformanceTestHelpers {
  static async measureRenderTime(component: () => JSX.Element) {
    const start = performance.now()
    render(component())
    const end = performance.now()
    return end - start
  }

  static expectRenderTimeUnder(renderTime: number, maxTime: number) {
    expect(renderTime).toBeLessThan(maxTime)
  }

  static async measureAPICallTime(apiCall: () => Promise<any>) {
    const start = performance.now()
    await apiCall()
    const end = performance.now()
    return end - start
  }
}

// ==================== Security Test Helpers ====================

export class SecurityTestHelpers {
  static createMaliciousInput() {
    return {
      xss: '<script>alert("xss")</script>',
      sql: "'; DROP TABLE users; --",
      pathTraversal: '../../../etc/passwd',
      oversized: 'a'.repeat(10000),
      specialChars: '!@#$%^&*()[]{}|\\:";\'<>?,./',
      unicode: '𝓤𝓷𝓲𝓬𝓸𝓭𝓮 𝓣𝓮𝔁𝓽'
    }
  }

  static expectInputSanitized(input: string, output: string) {
    expect(output).not.toContain('<script>')
    expect(output).not.toContain('DROP TABLE')
    expect(output).not.toContain('../')
  }

  static async testRateLimit(
    apiCall: () => Promise<any>,
    limit: number
  ) {
    const promises = Array.from({ length: limit + 1 }, () => apiCall())
    const results = await Promise.allSettled(promises)
    
    // Last request should fail due to rate limit
    const lastResult = results[results.length - 1]
    expect(lastResult.status).toBe('rejected')
  }
}

// ==================== Accessibility Test Helpers ====================

export class AccessibilityTestHelpers {
  static expectToHaveAccessibleName(element: HTMLElement, name: string) {
    expect(element).toHaveAccessibleName(name)
  }

  static expectToHaveRole(element: HTMLElement, role: string) {
    expect(element).toHaveAttribute('role', role)
  }

  static expectToBeAriaExpanded(element: HTMLElement, expanded: boolean) {
    expect(element).toHaveAttribute('aria-expanded', expanded.toString())
  }

  static expectKeyboardNavigation(element: HTMLElement) {
    expect(element).toHaveAttribute('tabindex')
    
    // Test keyboard events
    fireEvent.keyDown(element, { key: 'Enter' })
    fireEvent.keyDown(element, { key: ' ' })
    fireEvent.keyDown(element, { key: 'Escape' })
  }
}

// ==================== Test Cleanup Helpers ====================

export class TestCleanupHelpers {
  static clearAllMocks() {
    vi.clearAllMocks()
  }

  static resetAllMocks() {
    vi.resetAllMocks()
  }

  static restoreAllMocks() {
    vi.restoreAllMocks()
  }

  static cleanupDOM() {
    document.body.innerHTML = ''
  }

  static clearLocalStorage() {
    localStorage.clear()
  }

  static clearSessionStorage() {
    sessionStorage.clear()
  }
}

// ==================== Test Suite Templates ====================

export const TestSuiteTemplates = {
  // Component test template
  component: (componentName: string, Component: any) => {
    describe(`${componentName} Component`, () => {
      beforeEach(() => {
        TestCleanupHelpers.clearAllMocks()
      })

      afterEach(() => {
        TestCleanupHelpers.cleanupDOM()
      })

      test('renders without crashing', () => {
        expect(() => render(React.createElement(Component))).not.toThrow()
      })

      test('has correct accessibility attributes', () => {
        render(React.createElement(Component))
        // Add specific accessibility tests
      })

      test('handles user interactions correctly', async () => {
        render(React.createElement(Component))
        // Add interaction tests
      })
    })
  },

  // API test template
  api: (apiName: string, apiFunction: any) => {
    describe(`${apiName} API`, () => {
      let mockFetch: any

      beforeEach(() => {
        mockFetch = MockAPI.setupFetchMock()
      })

      afterEach(() => {
        TestCleanupHelpers.restoreAllMocks()
      })

      test('handles successful response', async () => {
        const mockData = { success: true }
        mockFetch.mockResolvedValueOnce(
          MockAPI.mockSuccessResponse(mockData)
        )

        const result = await apiFunction()
        expect(result).toEqual(mockData)
      })

      test('handles error response', async () => {
        mockFetch.mockResolvedValueOnce(
          MockAPI.mockErrorResponse('Test error')
        )

        await expect(apiFunction()).rejects.toThrow('Test error')
      })

      test('handles network error', async () => {
        mockFetch.mockRejectedValueOnce(MockAPI.mockNetworkError())

        await expect(apiFunction()).rejects.toThrow('Network error')
      })
    })
  },

  // Store test template
  store: (storeName: string, store: any) => {
    describe(`${storeName} Store`, () => {
      beforeEach(() => {
        // Reset store state
        store.getState = vi.fn()
        store.setState = vi.fn()
      })

      test('has correct initial state', () => {
        expect(store.getInitialState()).toBeDefined()
      })

      test('updates state correctly', () => {
        const newState = { test: true }
        store.setState(newState)
        
        expect(store.setState).toHaveBeenCalledWith(
          expect.objectContaining(newState)
        )
      })
    })
  }
}

// ==================== Custom Matchers ====================

expect.extend({
  toBeValidUrl(received: string) {
    try {
      new URL(received)
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true
      }
    } catch {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false
      }
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    
    return {
      message: () => 
        pass 
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
      pass
    }
  },

  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max
    
    return {
      message: () =>
        pass
          ? `expected ${received} not to be within range ${min}-${max}`
          : `expected ${received} to be within range ${min}-${max}`,
      pass
    }
  }
})

// Extend Jest matcher types
declare global {
  namespace vi {
    interface Matchers<R> {
      toBeValidUrl(): R
      toBeValidEmail(): R
      toBeWithinRange(min: number, max: number): R
    }
  }
}

export {
  test,
  describe,
  expect,
  beforeEach,
  afterEach,
  render,
  screen,
  fireEvent,
  waitFor
}