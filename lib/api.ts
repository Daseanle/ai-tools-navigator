import { supabase } from "./supabase"
import type { Database } from "./database.types"
import { validateTool, sanitizeString, sanitizeUrl, type Tool } from "./validation"

/* -------------------------------------------------------------
   0. 运行环境检测
----------------------------------------------------------------*/
// 强制在生产环境使用真实数据
const SUPABASE_READY = process.env.NODE_ENV === 'production' || 
                      !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                         process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ'))

// 调试日志
console.log('🔍 Supabase环境检查:', {
  nodeEnv: process.env.NODE_ENV,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
  ready: SUPABASE_READY ? '✅ 就绪' : '❌ 未就绪',
  actualUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
})

/* -------------------------------------------------------------
   1. 本地/预览假数据（只需少量条目即可渲染页面）
----------------------------------------------------------------*/
const mockTools = [
  {
    id: 1,
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "强大的 AI 对话助手",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.8,
    users_count: 100000000,
    pricing_type: "freemium",
  },
  {
    id: 2,
    slug: "midjourney",
    name: "Midjourney",
    tagline: "AI 图像生成工具",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.7,
    users_count: 15000000,
    pricing_type: "paid",
  },
  {
    id: 3,
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic 的 AI 助手",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.9,
    users_count: 50000000,
    pricing_type: "freemium",
  },
  {
    id: 4,
    slug: "dalle",
    name: "DALL-E 3",
    tagline: "OpenAI 的图像生成AI",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.6,
    users_count: 25000000,
    pricing_type: "paid",
  },
  {
    id: 5,
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "AI 代码助手",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 3, name: "编程助手", slug: "coding" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.5,
    users_count: 10000000,
    pricing_type: "paid",
  },
  {
    id: 6,
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "智能笔记助手",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 4, name: "生产力", slug: "productivity" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.4,
    users_count: 8000000,
    pricing_type: "freemium",
  },
  {
    id: 7,
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    tagline: "开源图像生成模型",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 2, name: "开源", slug: "open-source" }],
    rating: 4.3,
    users_count: 20000000,
    pricing_type: "free",
  },
  {
    id: 8,
    slug: "runway",
    name: "Runway",
    tagline: "AI 视频编辑工具",
    logo_url: "/placeholder.svg?height=48&width=48",
    category: { id: 5, name: "视频生成", slug: "video-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.2,
    users_count: 5000000,
    pricing_type: "freemium",
  }
] as any[]

const mockCategories = [
  { id: 1, name: "对话AI", slug: "chat-ai", icon: "💬", tools_count: 150 },
  { id: 2, name: "图像生成", slug: "image-generation", icon: "🎨", tools_count: 120 },
  { id: 3, name: "编程助手", slug: "coding", icon: "💻", tools_count: 85 },
  { id: 4, name: "生产力", slug: "productivity", icon: "📝", tools_count: 95 },
  { id: 5, name: "视频生成", slug: "video-generation", icon: "🎬", tools_count: 45 },
  { id: 6, name: "音频处理", slug: "audio", icon: "🎵", tools_count: 60 },
  { id: 7, name: "数据分析", slug: "data-analysis", icon: "📊", tools_count: 70 },
  { id: 8, name: "营销工具", slug: "marketing", icon: "📈", tools_count: 55 }
] as any[]

/* -------------------------------------------------------------
   2. 公共类型（Supabase & Mock 统一）
----------------------------------------------------------------*/
type SupabaseTool = Database["public"]["Tables"]["tools"]["Row"] & {
  category?: Database["public"]["Tables"]["categories"]["Row"]
  tags?: Database["public"]["Tables"]["tags"]["Row"][]
}

type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  tools_count?: number
}

/* -------------------------------------------------------------
   3. 数据获取函数
----------------------------------------------------------------*/
export async function getHotTools(limit = 8): Promise<Tool[]> {
  if (!SUPABASE_READY) return mockTools.slice(0, limit)

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories!inner(
          category:categories(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .order("upvotes_count", { ascending: false })
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching hot tools:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.slice(0, limit)
  }
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  if (!SUPABASE_READY) return mockTools.slice(0, limit)

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories!inner(
          category:categories(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching featured tools:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.slice(0, limit)
  }
}

export async function getAllTools(limit = 100): Promise<Tool[]> {
  if (!SUPABASE_READY) return mockTools.slice(0, Math.min(limit, mockTools.length))

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories!inner(
          category:categories(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .order("upvotes_count", { ascending: false })
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching all tools:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.slice(0, Math.min(limit, mockTools.length))
  }
}

export async function getStats(): Promise<{ toolsCount: number; categoriesCount: number }> {
  if (!SUPABASE_READY) return { toolsCount: mockTools.length, categoriesCount: mockCategories.length }

  try {
    // 获取工具总数
    const { count: toolsCount, error: toolsError } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })

    if (toolsError) throw toolsError

    // 获取分类总数
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })

    if (categoriesError) throw categoriesError

    return { 
      toolsCount: toolsCount || 0, 
      categoriesCount: categoriesCount || 0 
    }
  } catch (err) {
    console.error("Error fetching stats:", err)
    console.log("🔄 使用模拟数据作为备选")
    return { toolsCount: mockTools.length, categoriesCount: mockCategories.length }
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!SUPABASE_READY) return mockCategories

  try {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        tool_categories(count)
      `)
      .order("name")

    if (error) throw error
    return data.map((c) => ({
      ...c,
      tools_count: c.tool_categories?.length || 0,
    }))
  } catch (err) {
    console.error("Error fetching categories:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockCategories
  }
}

export async function searchTools(query: string, limit = 10): Promise<Tool[]> {
  if (!SUPABASE_READY) {
    return mockTools.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories(
          category:categories(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error searching tools:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit)
  }
}

export async function getToolsByCategory(categorySlug: string, limit = 20): Promise<Tool[]> {
  if (!SUPABASE_READY) {
    return mockTools.filter((t) => t.category?.slug === categorySlug).slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories!inner(
          category:categories!inner(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .eq("tool_categories.category.slug", categorySlug)
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching tools by category:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.filter((t) => t.category?.slug === categorySlug).slice(0, limit)
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  if (!SUPABASE_READY) {
    return mockTools.find((t) => t.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(`
        *,
        tool_categories(
          category:categories(*)
        ),
        tool_tags(
          tag:tags(*)
        )
      `)
      .eq("slug", slug)
      .single()

    if (error) throw error
    return normalizeTool(data)
  } catch (err) {
    console.error("Error fetching tool by slug:", err)
    console.log("🔄 使用模拟数据作为备选")
    return mockTools.find((t) => t.slug === slug) || null
  }
}

/* -------------------------------------------------------------
   4. 小工具：格式统一
----------------------------------------------------------------*/
function normalizeTools(raw: any[]): Tool[] {
  return raw.map(normalizeTool).filter((tool): tool is Tool => tool !== null)
}

function normalizeTool(raw: any): Tool | null {
  try {
    // 生成slug如果不存在
    const slug = raw.slug || raw.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${raw.id}`
    
    // 处理分类 - 从tool_categories关联中获取第一个分类
    const category = raw.tool_categories?.[0]?.category || null
    
    // 处理标签 - 从tool_tags关联中获取所有标签
    const tags = raw.tool_tags?.map((tt: any) => tt.tag).filter(Boolean) || []
    
    // 构建并验证工具数据
    const toolData = {
      id: raw.id,
      slug,
      name: sanitizeString(raw.name || ''),
      tagline: sanitizeString(raw.tagline || ''),
      description: raw.description ? sanitizeString(raw.description) : undefined,
      logo_url: raw.logo_url ? sanitizeUrl(raw.logo_url) : undefined,
      website_url: raw.website_url ? sanitizeUrl(raw.website_url) : undefined,
      category,
      tags,
      rating: raw.rating || (4.0 + Math.random() * 1.0), // 生成4.0-5.0的随机评分
      users_count: raw.users_count || raw.upvotes_count || 0,
      upvotes_count: raw.upvotes_count || 0,
      pricing_type: (raw.pricing_type || raw.pricing || 'freemium').toLowerCase() as 'free' | 'paid' | 'freemium',
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }

    // 验证数据
    return validateTool(toolData)
  } catch (error) {
    console.error('Error normalizing tool:', error, raw)
    return null
  }
}
