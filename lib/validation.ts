import { NextResponse } from 'next/server'
import { z } from 'zod'

// Note: Supabase client removed as it was unused in this validation utility file

// 验证 schema
const createToolSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().min(1),
  website: z.string().url(),
  categoryId: z.string().uuid(),
  pricing: z.enum(['Free', 'Freemium', 'Paid', 'Contact']),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  logo: z.string().url().optional(),
  screenshots: z.array(z.string().url()).optional(),
  apiAvailable: z.boolean().optional(),
  freeTier: z.boolean().optional(),
  trialAvailable: z.boolean().optional(),
})

const updateToolSchema = createToolSchema.partial()

const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
  provider: z.enum(['email', 'google', 'github', 'apple']).optional(),
})

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  provider: z.enum(['email', 'google', 'github', 'apple']).optional(),
})

const favoriteSchema = z.object({
  toolId: z.string().uuid(),
})

const ratingSchema = z.object({
  toolId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
})

const categorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  sortOrder: z.number().optional(),
})

const analyticsEventSchema = z.object({
  eventType: z.enum(['page_view', 'tool_click', 'search', 'favorite', 'rating']),
  toolId: z.string().uuid().optional(),
  searchQuery: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const paymentOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).default('CNY'),
  paymentMethod: z.enum(['wechat', 'alipay', 'bank_card', 'paypal']),
  productType: z.enum(['membership', 'tool_access', 'premium_feature']),
  productId: z.string().uuid(),
})

// 验证中间件
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (data: unknown): Promise<{ success: true; data: T } | { success: false; error: string }> => {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ')
        return { success: false, error: errorMessage }
      }
      return { success: false, error: '验证失败' }
    }
  }
}

// 字符串清理函数
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // 移除HTML标签
    .replace(/['"]/g, '') // 移除引号
    .trim()
}

// URL清理函数
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input)
    return url.toString()
  } catch {
    return ''
  }
}

// 工具验证函数
export function validateTool(tool: any): boolean {
  return !!(tool.name && tool.description && tool.website)
}

// 导出所有 schema
export {
  createToolSchema,
  updateToolSchema,
  userRegistrationSchema,
  userLoginSchema,
  favoriteSchema,
  ratingSchema,
  categorySchema,
  analyticsEventSchema,
  paymentOrderSchema,
}

// 通用验证函数
export async function validateAndHandle<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | NextResponse> {
  const validation = await validateRequest(schema)(data)
  
  if (!validation.success) {
    return NextResponse.json(
      { 
        success: false, 
        error: validation.error 
      },
      { status: 400 }
    )
  }
  
  return validation
}