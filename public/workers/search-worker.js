// Web Worker for heavy computations
self.onmessage = function(e) {
  const { type, data } = e.data

  switch (type) {
    case 'SEARCH_TOOLS':
      searchTools(data)
      break
    case 'FILTER_TOOLS':
      filterTools(data)
      break
    case 'SORT_TOOLS':
      sortTools(data)
      break
    case 'CALCULATE_RECOMMENDATIONS':
      calculateRecommendations(data)
      break
    default:
      self.postMessage({ error: 'Unknown task type' })
  }
}

// 搜索工具
function searchTools({ tools, query, options }) {
  try {
    const startTime = performance.now()
    
    const results = tools.filter(tool => {
      const searchText = `${tool.name} ${tool.description} ${tool.tags?.join(' ') || ''}`.toLowerCase()
      const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 1)
      
      return queryWords.some(word => searchText.includes(word))
    })
    
    // 计算相关性分数
    const scoredResults = results.map(tool => {
      let score = 0
      const searchText = `${tool.name} ${tool.description}`.toLowerCase()
      const queryWords = query.toLowerCase().split(' ')
      
      queryWords.forEach(word => {
        if (tool.name.toLowerCase().includes(word)) score += 10
        if (tool.description?.toLowerCase().includes(word)) score += 5
        if (tool.tags?.some(tag => tag.toLowerCase().includes(word))) score += 3
      })
      
      return { ...tool, relevanceScore: score }
    })
    
    // 按相关性排序
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    const endTime = performance.now()
    
    self.postMessage({
      type: 'SEARCH_COMPLETE',
      results: scoredResults,
      count: scoredResults.length,
      processingTime: endTime - startTime
    })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}

// 过滤工具
function filterTools({ tools, filters }) {
  try {
    const startTime = performance.now()
    
    let filtered = tools
    
    // 按分类过滤
    if (filters.categories?.length > 0) {
      filtered = filtered.filter(tool => 
        filters.categories.includes(tool.category?.id)
      )
    }
    
    // 按标签过滤
    if (filters.tags?.length > 0) {
      filtered = filtered.filter(tool =>
        tool.tags?.some(tag => filters.tags.includes(tag.id))
      )
    }
    
    // 按评分过滤
    if (filters.minRating) {
      filtered = filtered.filter(tool => 
        (tool.rating || 0) >= filters.minRating
      )
    }
    
    // 按价格类型过滤
    if (filters.pricingTypes?.length > 0) {
      filtered = filtered.filter(tool =>
        filters.pricingTypes.includes(tool.pricing_type)
      )
    }
    
    const endTime = performance.now()
    
    self.postMessage({
      type: 'FILTER_COMPLETE',
      results: filtered,
      count: filtered.length,
      processingTime: endTime - startTime
    })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}

// 排序工具
function sortTools({ tools, sortBy, sortOrder = 'desc' }) {
  try {
    const startTime = performance.now()
    
    const sorted = [...tools].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'users_count':
          aValue = a.users_count || 0
          bValue = b.users_count || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    const endTime = performance.now()
    
    self.postMessage({
      type: 'SORT_COMPLETE',
      results: sorted,
      processingTime: endTime - startTime
    })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}

// 计算推荐
function calculateRecommendations({ tools, userPreferences, viewHistory }) {
  try {
    const startTime = performance.now()
    
    // 基于用户偏好和浏览历史计算推荐分数
    const recommendations = tools.map(tool => {
      let score = 0
      
      // 基于分类偏好
      if (userPreferences.categories?.includes(tool.category?.id)) {
        score += 20
      }
      
      // 基于标签偏好
      if (tool.tags?.some(tag => userPreferences.tags?.includes(tag.id))) {
        score += 15
      }
      
      // 基于浏览历史
      const similarTools = viewHistory.filter(viewed => 
        viewed.category?.id === tool.category?.id
      )
      score += similarTools.length * 5
      
      // 基于工具评分
      score += (tool.rating || 0) * 2
      
      // 基于用户数量
      score += Math.log10((tool.users_count || 0) + 1)
      
      return {
        ...tool,
        recommendationScore: score
      }
    })
    
    // 排序并取前20个
    const topRecommendations = recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20)
    
    const endTime = performance.now()
    
    self.postMessage({
      type: 'RECOMMENDATIONS_COMPLETE',
      results: topRecommendations,
      processingTime: endTime - startTime
    })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
