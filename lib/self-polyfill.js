// Simple self polyfill for server environment
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
}