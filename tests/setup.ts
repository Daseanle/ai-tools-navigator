import { beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Extend vitest's expect with jest-dom matchers
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Global test setup
beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: () => {},
  })

  // Mock localStorage
  const localStorageMock = {
    getItem: vitest.fn(),
    setItem: vitest.fn(),
    removeItem: vitest.fn(),
    clear: vitest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vitest.fn(),
    setItem: vitest.fn(),
    removeItem: vitest.fn(),
    clear: vitest.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })

  // Mock fetch
  global.fetch = vitest.fn()

  // Mock next/navigation
  vitest.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vitest.fn(),
      replace: vitest.fn(),
      back: vitest.fn(),
      forward: vitest.fn(),
      refresh: vitest.fn(),
      prefetch: vitest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
    useParams: () => ({}),
  }))

  // Mock next/image
  vitest.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
      return <img src={src} alt={alt} {...props} />
    },
  }))

  // Mock environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})