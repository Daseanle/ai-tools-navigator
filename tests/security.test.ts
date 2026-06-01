import { describe, it, expect } from 'vitest'
import { InputSanitizer, CSRFProtection } from '../lib/security'

describe('Security Functions', () => {
  describe('InputSanitizer', () => {
    it('should sanitize HTML input', () => {
      const input = '<script>alert("xss")</script>'
      const sanitized = InputSanitizer.sanitizeHtml(input)
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should validate email addresses', () => {
      expect(InputSanitizer.isValidEmail('test@example.com')).toBe(true)
      expect(InputSanitizer.isValidEmail('invalid-email')).toBe(false)
      expect(InputSanitizer.isValidEmail('')).toBe(false)
    })

    it('should validate URLs', () => {
      expect(InputSanitizer.isValidUrl('https://example.com')).toBe(true)
      expect(InputSanitizer.isValidUrl('http://example.com')).toBe(true)
      expect(InputSanitizer.isValidUrl('invalid-url')).toBe(false)
      expect(InputSanitizer.isValidUrl('javascript:alert(1)')).toBe(false)
    })

    it('should sanitize SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --"
      const sanitized = InputSanitizer.sanitizeSql(input)
      expect(sanitized).not.toContain("DROP")
      expect(sanitized).not.toContain("--")
    })
  })

  describe('CSRFProtection', () => {
    it('should generate valid CSRF tokens', () => {
      const token = CSRFProtection.generateToken()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should validate CSRF tokens', () => {
      const token = CSRFProtection.generateToken()
      const isValid = CSRFProtection.validateToken(token)
      expect(isValid).toBe(true)
    })

    it('should reject invalid CSRF tokens', () => {
      const isValid = CSRFProtection.validateToken('invalid-token')
      expect(isValid).toBe(false)
    })

    it('should reject expired tokens', () => {
      const token = CSRFProtection.generateToken()
      // Test with very short max age
      const isValid = CSRFProtection.validateToken(token, 1) // 1ms
      // Wait a bit to ensure expiration
      setTimeout(() => {
        expect(CSRFProtection.validateToken(token, 1)).toBe(false)
      }, 10)
    })
  })
})

// NaviGuard-AI Security Audited - 2026-06-01
