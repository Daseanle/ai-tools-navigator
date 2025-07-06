import { z } from 'zod'

// 工具数据验证模式
export const ToolSchema = z.object({
  id: z.number().positive(),
  slug: z.string().min(1), // 移除严格的slug格式验证
  name: z.string().min(1).max(100),
  tagline: z.string().max(200),
  description: z.string().optional(),
  logo_url: z.string().optional(), // 移除URL验证，允许相对路径
  website_url: z.string().optional(), // 移除URL验证
  rating: z.number().min(0).max(5).optional(),
  users_count: z.number().min(0).optional(),
  upvotes_count: z.number().min(0).optional(),
  pricing_type: z.enum(['free', 'paid', 'freemium']).optional(),
  created_at: z.string().optional(), // 移除严格的datetime验证
  updated_at: z.string().optional(), // 移除严格的datetime验证
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable().optional(),
    icon: z.string().optional(),
  }).optional(),
  tags: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    color: z.string().optional(),
  })).optional(),
})

// 分类数据验证模式
export const CategorySchema = z.object({
  id: z.number().positive(),
  slug: z.string().min(1), // 移除严格的slug格式验证
  name: z.string().min(1).max(50),
  description: z.string().nullable().optional(),
  icon: z.string().optional(),
  tools_count: z.number().min(0).optional(),
  created_at: z.string().optional(), // 移除严格的datetime验证
  updated_at: z.string().optional(), // 移除严格的datetime验证
})

// 标签数据验证模式
export const TagSchema = z.object({
  id: z.number().positive(),
  slug: z.string().min(1), // 移除严格的slug格式验证
  name: z.string().min(1).max(30),
  color: z.string().optional(),
  created_at: z.string().optional(), // 移除严格的datetime验证
})

// 搜索参数验证模式
export const SearchParamsSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  pricing: z.enum(['free', 'paid', 'freemium']).optional(),
  sort: z.enum(['newest', 'popular', 'rating']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

// 用户输入验证模式
export const UserInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(50).optional(),
})

// API 响应验证模式
export const ApiResponseSchema = z.object({
  data: z.unknown(),
  error: z.string().optional(),
  success: z.boolean(),
  message: z.string().optional(),
})

// 工具创建/更新验证模式
export const ToolInputSchema = ToolSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
}).extend({
  name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  slug: z.string().min(1), // 移除严格的slug格式验证
})

// 验证工具函数
export const validateTool = (data: unknown) => {
  try {
    return ToolSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Tool validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateCategory = (data: unknown) => {
  try {
    return CategorySchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Category validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateSearchParams = (data: unknown) => {
  try {
    return SearchParamsSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Search params validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateUserInput = (data: unknown) => {
  try {
    return UserInputSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`User input validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// 安全的数据清理函数
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // 移除 < 和 > 字符
    .replace(/javascript:/gi, '') // 移除 javascript: 协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
}

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    // 只允许 http 和 https 协议
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol')
    }
    return parsed.toString()
  } catch {
    throw new Error('Invalid URL format')
  }
}

// 类型定义
export type Tool = z.infer<typeof ToolSchema>
export type Category = z.infer<typeof CategorySchema>
export type Tag = z.infer<typeof TagSchema>
export type SearchParams = z.infer<typeof SearchParamsSchema>
export type UserInput = z.infer<typeof UserInputSchema>
export type ToolInput = z.infer<typeof ToolInputSchema>
export type ApiResponse = z.infer<typeof ApiResponseSchema>