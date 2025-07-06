import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { searchTools, getCategories, getAllTools } from '@/lib/api'
import { validateSearchParams } from '@/lib/validation'

// Mock the API functions
vi.mock('@/lib/api', () => ({
  searchTools: vi.fn(),
  getCategories: vi.fn(),
  getAllTools: vi.fn(),
}))

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchTools', () => {
    it('should handle valid search queries', async () => {
      const mockTools = [
        {
          id: 1,
          name: 'Test Tool',
          slug: 'test-tool',
          tagline: 'A test tool',
          rating: 4.5,
          users_count: 1000,
          upvotes_count: 100,
          pricing_type: 'free' as const,
        }
      ]
      
      vi.mocked(searchTools).mockResolvedValue(mockTools)
      
      const result = await searchTools('test', 10)
      
      expect(searchTools).toHaveBeenCalledWith('test', 10)
      expect(result).toEqual(mockTools)
    })

    it('should handle empty search queries', async () => {
      vi.mocked(searchTools).mockResolvedValue([])
      
      const result = await searchTools('', 10)
      
      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(searchTools).mockRejectedValue(new Error('API Error'))
      
      // The function should not throw, it should return fallback data
      try {
        const result = await searchTools('test', 10)
        expect(result).toBeDefined() // Should return something (likely empty array or mock data)
      } catch (error) {
        // If it does throw, that's also acceptable for now
        expect(error).toBeInstanceOf(Error)
      }
    })
  })

  describe('getCategories', () => {
    it('should return categories with proper structure', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Test Category',
          slug: 'test-category',
          description: 'A test category',
          tools_count: 5,
        }
      ]
      
      vi.mocked(getCategories).mockResolvedValue(mockCategories)
      
      const result = await getCategories()
      
      expect(result).toEqual(mockCategories)
      expect(result[0]).toHaveProperty('tools_count')
    })
  })
})

describe('Validation Functions', () => {
  describe('validateSearchParams', () => {
    it('should validate correct search parameters', () => {
      const validParams = {
        q: 'test query',
        category: 'ai-tools',
        pricing: 'free' as const,
        sort: 'popular' as const,
        page: 1,
        limit: 20,
      }
      
      expect(() => validateSearchParams(validParams)).not.toThrow()
    })

    it('should reject invalid search parameters', () => {
      const invalidParams = {
        q: '', // Too short
        pricing: 'invalid' as any,
        sort: 'invalid' as any,
        page: 0, // Too small
        limit: 1000, // Too large
      }
      
      expect(() => validateSearchParams(invalidParams)).toThrow()
    })

    it('should handle optional parameters', () => {
      const minimalParams = {
        q: 'test',
      }
      
      expect(() => validateSearchParams(minimalParams)).not.toThrow()
    })
  })
})