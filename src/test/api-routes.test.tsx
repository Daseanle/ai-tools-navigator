import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock a simple API route handler for testing
const mockApiHandler = async (request: NextRequest) => {
  const { method } = request
  const url = new URL(request.url)
  
  switch (method) {
    case 'GET':
      // Mock GET endpoint
      const query = url.searchParams.get('q')
      const limit = url.searchParams.get('limit') || '10'
      
      if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
      }
      
      // Mock search results
      const results = [
        { id: 1, name: `Tool matching ${query}`, slug: 'test-tool' },
        { id: 2, name: `Another tool for ${query}`, slug: 'another-tool' }
      ].slice(0, parseInt(limit))
      
      return NextResponse.json({ data: results, total: results.length })
      
    case 'POST':
      // Mock POST endpoint
      try {
        const body = await request.json()
        
        if (!body.name || !body.tagline) {
          return NextResponse.json(
            { error: 'Name and tagline are required' }, 
            { status: 400 }
          )
        }
        
        const newTool = {
          id: Date.now(),
          ...body,
          slug: body.name.toLowerCase().replace(/\s+/g, '-'),
          created_at: new Date().toISOString()
        }
        
        return NextResponse.json({ data: newTool }, { status: 201 })
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
      
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}

describe('API Route Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/tools/search', () => {
    it('should return search results for valid query', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools/search?q=chatgpt&limit=5')
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].name).toContain('chatgpt')
    })

    it('should return 400 for missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools/search')
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter required')
    })

    it('should respect limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools/search?q=test&limit=1')
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })
  })

  describe('POST /api/tools', () => {
    it('should create tool with valid data', async () => {
      const toolData = {
        name: 'New AI Tool',
        tagline: 'Amazing AI capabilities',
        description: 'A comprehensive AI tool for productivity',
        pricing_type: 'freemium'
      }
      
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData)
      })
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.data.name).toBe(toolData.name)
      expect(data.data.slug).toBe('new-ai-tool')
      expect(data.data.id).toBeDefined()
      expect(data.data.created_at).toBeDefined()
    })

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        name: 'Tool without tagline'
        // Missing tagline
      }
      
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON')
    })
  })

  describe('HTTP Methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'DELETE'
      })
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(405)
      expect(data.error).toBe('Method not allowed')
    })
  })

  describe('Request Validation', () => {
    it('should validate content-type for POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'plain text body'
      })
      
      const response = await mockApiHandler(request)
      
      // Should still attempt to parse JSON and fail gracefully
      expect(response.status).toBe(400)
    })

    it('should handle URL parsing correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/tools/search?q=test%20query&limit=10')
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.data[0].name).toContain('test query')
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed URLs gracefully', async () => {
      // This test ensures our URL parsing is robust
      const request = new NextRequest('http://localhost:3000/api/tools/search?q=')
      
      const response = await mockApiHandler(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Query parameter required')
    })

    it('should handle large request bodies', async () => {
      const largeData = {
        name: 'Test Tool',
        tagline: 'A test tool',
        description: 'x'.repeat(10000) // Large description
      }
      
      const request = new NextRequest('http://localhost:3000/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeData)
      })
      
      const response = await mockApiHandler(request)
      
      // Should handle large payloads
      expect(response.status).toBe(201)
    })
  })
})