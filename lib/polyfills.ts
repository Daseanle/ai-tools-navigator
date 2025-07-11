// Polyfills for server-side rendering compatibility

// Define global polyfills for server environment
try {
  if (typeof global !== 'undefined') {
    // Polyfill self for server environment
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global
    }
    
    // Polyfill window for server environment
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = global
    }
    
    // Polyfill document for server environment
    if (typeof (global as any).document === 'undefined') {
      (global as any).document = {}
    }
    
    // Polyfill navigator for server environment
    if (typeof (global as any).navigator === 'undefined') {
      (global as any).navigator = {}
    }
    
    // Polyfill location for server environment
    if (typeof (global as any).location === 'undefined') {
      (global as any).location = {
        href: '',
        origin: '',
        protocol: 'https:',
        host: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: ''
      }
    }
  }
} catch (error) {
  // Silently ignore polyfill errors during build time
  console.debug('Polyfill initialization skipped:', error)
}

export {}