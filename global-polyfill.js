// Global polyfill for Node.js environments
// This file must be loaded before any modules that might access 'self'

if (typeof global !== 'undefined') {
  // Define self as global in Node.js environment
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  
  // Also define as a property that can be accessed by modules
  Object.defineProperty(global, 'self', {
    value: global,
    writable: false,
    configurable: false,
    enumerable: false
  });
  
  // For webpack bundling
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
}

module.exports = {};