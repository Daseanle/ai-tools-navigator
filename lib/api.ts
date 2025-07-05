import { supabase } from "./supabase"
import type { Database } from "./database.types"

/* -------------------------------------------------------------
   0. 运行环境检测
----------------------------------------------------------------*/
const SUPABASE_READY = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                         process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
                         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ'))

// 调试日志（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase环境检查:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
    ready: SUPABASE_READY ? '✅ 就绪' : '❌ 未就绪'
  })
}

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
] as any[]

const mockCategories = [
  { id: 1, name: "对话AI", slug: "chat-ai", icon: "💬", tools_count: 25 },
  { id: 2, name: "图像生成", slug: "image-generation", icon: "🎨", tools_count: 18 },
] as any[]

/* -------------------------------------------------------------
   2. 公共类型（Supabase & Mock 统一）
----------------------------------------------------------------*/
type Tool = Database["public"]["Tables"]["tools"]["Row"] & {
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
      .select(
        `
        *,
        category:categories(*),
        tool_tags(tag:tags(*))
      `,
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("rating", { ascending: false })
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching hot tools:", err)
    return []
  }
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  if (!SUPABASE_READY) return mockTools.slice(0, limit)

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        `
        *,
        category:categories(*),
        tool_tags(tag:tags(*))
      `,
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching featured tools:", err)
    return []
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!SUPABASE_READY) return mockCategories

  try {
    const { data, error } = await supabase
      .from("categories")
      .select(`*, tools_count:tools(count)`)
      .eq("is_active", true)
      .order("sort_order")

    if (error) throw error
    return data.map((c) => ({
      ...c,
      tools_count: c.tools_count?.[0]?.count || 0,
    }))
  } catch (err) {
    console.error("Error fetching categories:", err)
    return []
  }
}

export async function searchTools(query: string, limit = 10): Promise<Tool[]> {
  if (!SUPABASE_READY) {
    return mockTools.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        `
        *,
        category:categories(*),
        tool_tags(tag:tags(*))
      `,
      )
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error

    // 记录搜索日志（忽略错误）
    supabase
      .from("search_logs")
      .insert({ query, results_count: data.length })
      .catch(() => {})

    return normalizeTools(data)
  } catch (err) {
    console.error("Error searching tools:", err)
    return []
  }
}

export async function getToolsByCategory(categorySlug: string, limit = 20): Promise<Tool[]> {
  if (!SUPABASE_READY) {
    return mockTools.filter((t) => t.category?.slug === categorySlug).slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        `
        *,
        category:categories!inner(*),
        tool_tags(tag:tags(*))
      `,
      )
      .eq("is_active", true)
      .eq("category.slug", categorySlug)
      .limit(limit)

    if (error) throw error
    return normalizeTools(data)
  } catch (err) {
    console.error("Error fetching tools by category:", err)
    return []
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  if (!SUPABASE_READY) {
    return mockTools.find((t) => t.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from("tools")
      .select(
        `
        *,
        category:categories(*),
        tool_tags(tag:tags(*))
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (error) throw error

    // 增加浏览量（忽略错误）
    supabase
      .from("tools")
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq("id", data.id)
      .catch(() => {})

    return normalizeTool(data)
  } catch (err) {
    console.error("Error fetching tool by slug:", err)
    return null
  }
}

/* -------------------------------------------------------------
   4. 小工具：格式统一
----------------------------------------------------------------*/
function normalizeTools(raw: any[]): Tool[] {
  return raw.map(normalizeTool)
}

function normalizeTool(raw: any): Tool {
  return {
    ...raw,
    tags: raw.tool_tags?.map((tt: any) => tt.tag).filter(Boolean) || raw.tags || [],
  }
}
