import { supabase } from "./supabase"
import type { Database } from "./database.types"
import { validateTool, sanitizeString, sanitizeUrl } from "./validation"
import type { Tool } from "@/types"

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
    description: "ChatGPT 是 OpenAI 开发的大型语言模型，能够进行自然对话、回答问题、协助写作等多种任务。它采用了先进的 GPT 架构，提供了强大的文本理解和生成能力。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://chat.openai.com",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.8,
    users_count: 100000000,
    upvotes_count: 1500,
    pricing_type: "freemium",
    created_at: "2022-11-30T00:00:00Z",
  },
  {
    id: 2,
    slug: "midjourney",
    name: "Midjourney",
    tagline: "AI 图像生成工具",
    description: "Midjourney 是一个强大的 AI 图像生成平台，通过简单的文本描述就能创造出高质量的艺术作品和图像。它以其独特的艺术风格和创意表现力而闻名。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://midjourney.com",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.7,
    users_count: 15000000,
    upvotes_count: 1200,
    pricing_type: "paid",
    created_at: "2022-03-15T00:00:00Z",
  },
  {
    id: 3,
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic 的 AI 助手",
    description: "Claude 是 Anthropic 开发的 AI 助手，以其安全、有用和诚实的特性而著称。它能够进行复杂的推理、分析和创作任务，是一个可靠的 AI 伙伴。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://claude.ai",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.9,
    users_count: 50000000,
    upvotes_count: 1800,
    pricing_type: "freemium",
    created_at: "2023-07-11T00:00:00Z",
  },
  {
    id: 4,
    slug: "dalle",
    name: "DALL-E 3",
    tagline: "OpenAI 的图像生成AI",
    description: "DALL-E 3 是 OpenAI 最新的图像生成模型，能够根据文本描述创建高质量、富有创意的图像。它在理解复杂提示和生成细节丰富的图像方面表现出色。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://openai.com/dall-e-3",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.6,
    users_count: 25000000,
    upvotes_count: 1300,
    pricing_type: "paid",
    created_at: "2023-10-03T00:00:00Z",
  },
  {
    id: 5,
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "AI 代码助手",
    description: "GitHub Copilot 是微软和 OpenAI 合作开发的 AI 编程助手，能够在您编写代码时提供智能建议和自动补全，大大提高开发效率。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://github.com/features/copilot",
    category: { id: 3, name: "编程助手", slug: "coding" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.5,
    users_count: 10000000,
    upvotes_count: 950,
    pricing_type: "paid",
    created_at: "2021-06-29T00:00:00Z",
  },
  {
    id: 6,
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "智能笔记助手",
    description: "Notion AI 是集成在 Notion 笔记应用中的智能助手，能够帮助您写作、总结、翻译和组织内容，让知识管理更加高效。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://notion.so/ai",
    category: { id: 4, name: "生产力", slug: "productivity" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.4,
    users_count: 8000000,
    upvotes_count: 720,
    pricing_type: "freemium",
    created_at: "2023-02-22T00:00:00Z",
  },
  {
    id: 7,
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    tagline: "开源图像生成模型",
    description: "Stable Diffusion 是一个开源的图像生成模型，允许用户在本地运行和自定义。它为创作者提供了强大而灵活的图像生成能力。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://stability.ai/stable-diffusion",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 2, name: "开源", slug: "open-source" }],
    rating: 4.3,
    users_count: 20000000,
    upvotes_count: 1100,
    pricing_type: "free",
    created_at: "2022-08-22T00:00:00Z",
  },
  {
    id: 8,
    slug: "runway",
    name: "Runway",
    tagline: "AI 视频编辑工具",
    description: "Runway 是一个强大的AI视频编辑平台，提供了多种创新的视频生成和编辑功能。它使用先进的机器学习技术，让视频创作变得更加简单和高效。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://runwayml.com",
    category: { id: 5, name: "视频生成", slug: "video-generation" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.2,
    users_count: 5000000,
    upvotes_count: 650,
    pricing_type: "freemium",
    created_at: "2022-01-15T00:00:00Z",
  },
  {
    id: 9,
    slug: "perplexity",
    name: "Perplexity AI",
    tagline: "AI 搜索引擎",
    description: "Perplexity AI 是一个革命性的 AI 搜索引擎，能够提供准确、实时的答案和信息。它结合了搜索和对话的优势，为用户提供更智能的信息获取体验。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://perplexity.ai",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.6,
    users_count: 12000000,
    upvotes_count: 890,
    pricing_type: "freemium",
    created_at: "2022-12-07T00:00:00Z",
  },
  {
    id: 10,
    slug: "character-ai",
    name: "Character.AI",
    tagline: "AI 角色对话平台",
    description: "Character.AI 是一个创新的 AI 角色对话平台，用户可以与各种虚拟角色进行对话，包括历史人物、虚构角色等。它为娱乐和教育提供了全新的交互体验。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://character.ai",
    category: { id: 1, name: "对话AI", slug: "chat-ai" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.3,
    users_count: 18000000,
    upvotes_count: 760,
    pricing_type: "freemium",
    created_at: "2022-09-16T00:00:00Z",
  },
  {
    id: 11,
    slug: "leonardo-ai",
    name: "Leonardo.Ai",
    tagline: "创意图像生成平台",
    description: "Leonardo.Ai 是一个专业的 AI 图像生成平台，专门为创意工作者设计。它提供了多种艺术风格和高质量的图像生成功能，适合游戏、设计和艺术创作。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://leonardo.ai",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.4,
    users_count: 6000000,
    upvotes_count: 580,
    pricing_type: "freemium",
    created_at: "2023-01-20T00:00:00Z",
  },
  {
    id: 12,
    slug: "jasper",
    name: "Jasper AI",
    tagline: "AI 内容创作助手",
    description: "Jasper AI 是一个专业的 AI 内容创作平台，专门为营销人员、作家和企业设计。它能够生成高质量的营销文案、博客文章和各种商业内容。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://jasper.ai",
    category: { id: 4, name: "生产力", slug: "productivity" },
    tags: [{ id: 4, name: "付费", slug: "paid" }],
    rating: 4.1,
    users_count: 3000000,
    upvotes_count: 450,
    pricing_type: "paid",
    created_at: "2021-02-01T00:00:00Z",
  },
  {
    id: 13,
    slug: "cursor",
    name: "Cursor",
    tagline: "AI 代码编辑器",
    description: "Cursor 是一个由 AI 驱动的代码编辑器，集成了先进的AI编程助手功能。它能够理解代码上下文，提供智能建议，大大提升编程效率和代码质量。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://cursor.sh",
    category: { id: 3, name: "编程助手", slug: "coding" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.7,
    users_count: 2500000,
    upvotes_count: 680,
    pricing_type: "freemium",
    created_at: "2023-03-10T00:00:00Z",
  },
  {
    id: 14,
    slug: "replicate",
    name: "Replicate",
    tagline: "开源AI模型平台",
    description: "Replicate 是一个云端AI模型运行平台，让开发者能够轻松运行和部署各种开源AI模型。它支持图像生成、文本处理、音频合成等多种AI应用。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://replicate.com",
    category: { id: 3, name: "编程助手", slug: "coding" },
    tags: [{ id: 2, name: "开源", slug: "open-source" }],
    rating: 4.5,
    users_count: 1800000,
    upvotes_count: 520,
    pricing_type: "freemium",
    created_at: "2019-11-12T00:00:00Z",
  },
  {
    id: 15,
    slug: "huggingface",
    name: "Hugging Face",
    tagline: "AI 模型社区平台",
    description: "Hugging Face 是世界最大的AI模型社区平台，提供了丰富的预训练模型、数据集和工具。它是AI研究者和开发者分享和协作的重要平台。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://huggingface.co",
    category: { id: 3, name: "编程助手", slug: "coding" },
    tags: [{ id: 2, name: "开源", slug: "open-source" }],
    rating: 4.8,
    users_count: 5000000,
    upvotes_count: 920,
    pricing_type: "freemium",
    created_at: "2016-04-28T00:00:00Z",
  },
  {
    id: 16,
    slug: "adobe-firefly",
    name: "Adobe Firefly",
    tagline: "创意生成AI套件",
    description: "Adobe Firefly 是 Adobe 推出的创意生成AI套件，集成在 Creative Cloud 中。它提供了文本转图像、样式转换、字体生成等多种创意AI功能。",
    logo_url: "/placeholder.svg?height=48&width=48",
    website_url: "https://firefly.adobe.com",
    category: { id: 2, name: "图像生成", slug: "image-generation" },
    tags: [{ id: 1, name: "免费", slug: "free" }],
    rating: 4.2,
    users_count: 8000000,
    upvotes_count: 640,
    pricing_type: "freemium",
    created_at: "2023-03-21T00:00:00Z",
  }
] as any[]

// 智能分类系统 - 根据工具内容自动匹配最佳分类
const mockCategories = [
  { id: 1, name: "对话AI", slug: "chat-ai", icon: "🤖", tools_count: 0, description: "智能对话与问答助手" },
  { id: 2, name: "图像生成", slug: "image-generation", icon: "🎨", tools_count: 0, description: "AI图像创作与编辑" },
  { id: 3, name: "编程助手", slug: "coding", icon: "💻", tools_count: 0, description: "代码生成与开发工具" },
  { id: 4, name: "生产力", slug: "productivity", icon: "📈", tools_count: 0, description: "效率提升与办公工具" },
  { id: 5, name: "视频生成", slug: "video-generation", icon: "🎬", tools_count: 0, description: "视频制作与编辑" },
  { id: 6, name: "写作助手", slug: "writing", icon: "✍️", tools_count: 0, description: "内容创作与文案生成" },
  { id: 7, name: "数据分析", slug: "data-analysis", icon: "📊", tools_count: 0, description: "数据洞察与分析" },
  { id: 8, name: "设计工具", slug: "design", icon: "🎯", tools_count: 0, description: "UI/UX设计与创意" },
  { id: 9, name: "音频处理", slug: "audio", icon: "🎵", tools_count: 0, description: "音频生成与处理" },
  { id: 10, name: "搜索引擎", slug: "search", icon: "🔍", tools_count: 0, description: "智能搜索与信息检索" },
  { id: 11, name: "开发平台", slug: "platform", icon: "🛠️", tools_count: 0, description: "AI模型部署与开发" },
  { id: 12, name: "创意工具", slug: "creative", icon: "✨", tools_count: 0, description: "创意生成与艺术创作" }
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
  if (!SUPABASE_READY) return { toolsCount: 2188, categoriesCount: mockCategories.length }

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
    return { toolsCount: 2188, categoriesCount: mockCategories.length }
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!SUPABASE_READY) {
    // 动态计算分类中的工具数量
    const categoriesWithCounts = mockCategories.map(category => {
      const toolCount = mockTools.filter(tool => {
        // 使用智能分类系统重新计算
        const intelligentCategory = intelligentCategoryMapping(tool)
        return intelligentCategory.slug === category.slug || tool.category?.slug === category.slug
      }).length
      
      return {
        ...category,
        tools_count: toolCount
      }
    })
    
    // 按工具数量排序，热门分类在前
    return categoriesWithCounts.sort((a, b) => b.tools_count - a.tools_count)
  }

  try {
    // 首先获取所有分类
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("name")

    if (categoriesError) throw categoriesError

    // 然后获取每个分类的工具数量
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from("tool_categories")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)

        if (countError) {
          console.error(`Error counting tools for category ${category.name}:`, countError)
          return { ...category, tools_count: 0 }
        }

        return { ...category, tools_count: count || 0 }
      })
    )

    return categoriesWithCounts.sort((a, b) => b.tools_count - a.tools_count)
  } catch (err) {
    console.error("Error fetching categories:", err)
    console.log("🔄 使用模拟数据作为备选")
    
    // 备选：使用智能分类计算
    const categoriesWithCounts = mockCategories.map(category => {
      const toolCount = mockTools.filter(tool => {
        const intelligentCategory = intelligentCategoryMapping(tool)
        return intelligentCategory.slug === category.slug || tool.category?.slug === category.slug
      }).length
      
      return {
        ...category,
        tools_count: toolCount
      }
    })
    
    return categoriesWithCounts.sort((a, b) => b.tools_count - a.tools_count)
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
    // 使用智能分类系统过滤工具
    const filteredTools = mockTools.filter((tool) => {
      // 检查现有分类
      if (tool.category?.slug === categorySlug) {
        return true
      }
      
      // 使用智能分类系统检查
      const intelligentCategory = intelligentCategoryMapping(tool)
      return intelligentCategory.slug === categorySlug
    }).slice(0, limit)
    
    // 应用自动补全数据
    return filteredTools.map(tool => {
      const completed = autoCompleteToolData(tool)
      return normalizeTool(completed)
    }).filter((tool): tool is Tool => tool !== null)
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
    
    // 备选：使用智能分类系统
    const filteredTools = mockTools.filter((tool) => {
      if (tool.category?.slug === categorySlug) {
        return true
      }
      const intelligentCategory = intelligentCategoryMapping(tool)
      return intelligentCategory.slug === categorySlug
    }).slice(0, limit)
    
    return filteredTools.map(tool => {
      const completed = autoCompleteToolData(tool)
      return normalizeTool(completed)
    }).filter((tool): tool is Tool => tool !== null)
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  if (!SUPABASE_READY) {
    const found = mockTools.find((t) => t.slug === slug)
    
    if (found) {
      const normalized = normalizeTool(found)
      return normalized
    }
    return null
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

    if (error) {
      throw error
    }
    
    return normalizeTool(data)
  } catch (err) {
    console.error("Error fetching tool by slug:", err)
    const found = mockTools.find((t) => t.slug === slug)
    const normalized = found ? normalizeTool(found) : null
    return normalized
  }
}

/* -------------------------------------------------------------
   4. 小工具：格式统一和自动补全
----------------------------------------------------------------*/

// 智能分类匹配系统
function intelligentCategoryMapping(tool: any): any {
  const name = (tool.name || '').toLowerCase()
  const tagline = (tool.tagline || '').toLowerCase()
  const description = (tool.description || '').toLowerCase()
  const slug = (tool.slug || '').toLowerCase()
  
  // 基于内容的智能分类映射
  const categoryMappings = [
    {
      keywords: ['chatgpt', 'claude', 'perplexity', 'character', '对话', 'chat', 'conversation', 'ai助手', '问答'],
      category: { id: 1, name: "对话AI", slug: "chat-ai" }
    },
    {
      keywords: ['midjourney', 'dalle', 'leonardo', 'firefly', 'stable-diffusion', '图像', 'image', '绘画', '艺术', 'art'],
      category: { id: 2, name: "图像生成", slug: "image-generation" }
    },
    {
      keywords: ['copilot', 'cursor', 'replicate', 'huggingface', '编程', 'code', 'coding', 'github', 'developer'],
      category: { id: 3, name: "编程助手", slug: "coding" }
    },
    {
      keywords: ['notion', 'jasper', '生产力', 'productivity', '办公', '笔记', 'note'],
      category: { id: 4, name: "生产力", slug: "productivity" }
    },
    {
      keywords: ['runway', '视频', 'video', '编辑'],
      category: { id: 5, name: "视频生成", slug: "video-generation" }
    },
    {
      keywords: ['writing', '写作', '文案', 'content', '内容'],
      category: { id: 6, name: "写作助手", slug: "writing" }
    },
    {
      keywords: ['search', '搜索', 'perplexity'],
      category: { id: 10, name: "搜索引擎", slug: "search" }
    },
    {
      keywords: ['platform', '平台', 'api', 'model'],
      category: { id: 11, name: "开发平台", slug: "platform" }
    }
  ]
  
  // 检查每个分类映射
  for (const mapping of categoryMappings) {
    const matchCount = mapping.keywords.filter(keyword => 
      name.includes(keyword) || 
      tagline.includes(keyword) || 
      description.includes(keyword) ||
      slug.includes(keyword)
    ).length
    
    if (matchCount > 0) {
      return mapping.category
    }
  }
  
  // 默认分类：创意工具
  return { id: 12, name: "创意工具", slug: "creative" }
}

// 智能标签生成系统
function intelligentTagGeneration(tool: any): any[] {
  const name = (tool.name || '').toLowerCase()
  const tagline = (tool.tagline || '').toLowerCase()
  const description = (tool.description || '').toLowerCase()
  const content = `${name} ${tagline} ${description}`
  
  const availableTags = [
    { id: 1, name: "免费", slug: "free" },
    { id: 2, name: "开源", slug: "open-source" },
    { id: 3, name: "企业版", slug: "enterprise" },
    { id: 4, name: "付费", slug: "paid" },
    { id: 5, name: "API", slug: "api" },
    { id: 6, name: "云端", slug: "cloud" },
    { id: 7, name: "本地", slug: "local" },
    { id: 8, name: "实时", slug: "realtime" },
    { id: 9, name: "高质量", slug: "high-quality" },
    { id: 10, name: "易用", slug: "easy-to-use" }
  ]
  
  const tags = []
  
  // 根据定价类型添加标签
  if (tool.pricing_type === 'free') tags.push(availableTags[0])
  else if (tool.pricing_type === 'paid') tags.push(availableTags[3])
  else if (tool.pricing_type === 'freemium') tags.push(availableTags[0])
  
  // 根据内容特征添加标签
  if (content.includes('开源') || content.includes('open source') || content.includes('github')) {
    tags.push(availableTags[1])
  }
  if (content.includes('api') || content.includes('开发者')) {
    tags.push(availableTags[4])
  }
  if (content.includes('云端') || content.includes('cloud') || content.includes('在线')) {
    tags.push(availableTags[5])
  }
  if (content.includes('实时') || content.includes('real-time') || content.includes('即时')) {
    tags.push(availableTags[7])
  }
  if (content.includes('高质量') || content.includes('专业') || content.includes('professional')) {
    tags.push(availableTags[8])
  }
  
  // 确保至少有一个标签
  if (tags.length === 0) {
    tags.push(availableTags[9]) // 易用
  }
  
  // 去重
  return tags.filter((tag, index, self) => 
    index === self.findIndex(t => t.id === tag.id)
  ).slice(0, 3) // 最多3个标签
}
function generateWebsiteUrl(tool: any): string {
  if (tool.website_url) return tool.website_url
  
  // 根据工具名称生成常见的 URL 模式
  const name = tool.name.toLowerCase()
  const slug = tool.slug
  
  // 特殊映射表
  const urlMappings: Record<string, string> = {
    'chatgpt': 'https://chat.openai.com',
    'midjourney': 'https://midjourney.com',
    'claude': 'https://claude.ai',
    'dall-e': 'https://openai.com/dall-e-3',
    'dalle': 'https://openai.com/dall-e-3',
    'github-copilot': 'https://github.com/features/copilot',
    'notion-ai': 'https://notion.so/ai',
    'stable-diffusion': 'https://stability.ai/stable-diffusion',
    'runway': 'https://runwayml.com',
    'perplexity': 'https://perplexity.ai',
    'character-ai': 'https://character.ai',
    'leonardo-ai': 'https://leonardo.ai',
    'jasper': 'https://jasper.ai',
    'cursor': 'https://cursor.sh',
    'replicate': 'https://replicate.com',
    'huggingface': 'https://huggingface.co',
    'adobe-firefly': 'https://firefly.adobe.com',
    'hugging-face': 'https://huggingface.co',
    'grammarly': 'https://grammarly.com',
    'canva': 'https://canva.com/ai',
    'figma': 'https://figma.com',
    'framer': 'https://framer.com',
    'vercel': 'https://vercel.com',
    'linear': 'https://linear.app',
    'loom': 'https://loom.com',
    'copy-ai': 'https://copy.ai'
  }
  
  // 检查映射表
  if (urlMappings[slug]) return urlMappings[slug]
  if (urlMappings[name.replace(/\s+/g, '-')]) return urlMappings[name.replace(/\s+/g, '-')]
  
  // 生成常见模式
  const cleanName = name.replace(/[^a-z0-9]/g, '')
  const patterns = [
    `https://${cleanName}.com`,
    `https://${cleanName}.ai`,
    `https://${slug}.com`,
    `https://${slug}.ai`,
    `https://www.${cleanName}.com`,
    `https://app.${cleanName}.com`
  ]
  
  return patterns[0]
}

// 智能生成描述
function generateDescription(tool: any): string {
  if (tool.description) return tool.description
  
  const defaultDescriptions: Record<string, string> = {
    'chatgpt': 'ChatGPT 是 OpenAI 开发的大型语言模型，能够进行自然对话、回答问题、协助写作等多种任务。它采用了先进的 GPT 架构，提供了强大的文本理解和生成能力。',
    'midjourney': 'Midjourney 是一个强大的 AI 图像生成平台，通过简单的文本描述就能创造出高质量的艺术作品和图像。它以其独特的艺术风格和创意表现力而闻名。',
    'claude': 'Claude 是 Anthropic 开发的 AI 助手，以其安全、有用和诚实的特性而著称。它能够进行复杂的推理、分析和创作任务，是一个可靠的 AI 伙伴。',
    'dalle': 'DALL-E 3 是 OpenAI 最新的图像生成模型，能够根据文本描述创建高质量、富有创意的图像。它在理解复杂提示和生成细节丰富的图像方面表现出色。',
    'github-copilot': 'GitHub Copilot 是微软和 OpenAI 合作开发的 AI 编程助手，能够在您编写代码时提供智能建议和自动补全，大大提高开发效率。',
    'notion-ai': 'Notion AI 是集成在 Notion 笔记应用中的智能助手，能够帮助您写作、总结、翻译和组织内容，让知识管理更加高效。',
    'stable-diffusion': 'Stable Diffusion 是一个开源的图像生成模型，允许用户在本地运行和自定义。它为创作者提供了强大而灵活的图像生成能力。',
    'runway': 'Runway 是一个强大的AI视频编辑平台，提供了多种创新的视频生成和编辑功能。它使用先进的机器学习技术，让视频创作变得更加简单和高效。',
    'perplexity': 'Perplexity AI 是一个革命性的 AI 搜索引擎，能够提供准确、实时的答案和信息。它结合了搜索和对话的优势，为用户提供更智能的信息获取体验。',
    'character-ai': 'Character.AI 是一个创新的 AI 角色对话平台，用户可以与各种虚拟角色进行对话，包括历史人物、虚构角色等。它为娱乐和教育提供了全新的交互体验。',
    'leonardo-ai': 'Leonardo.Ai 是一个专业的 AI 图像生成平台，专门为创意工作者设计。它提供了多种艺术风格和高质量的图像生成功能，适合游戏、设计和艺术创作。',
    'jasper': 'Jasper AI 是一个专业的 AI 内容创作平台，专门为营销人员、作家和企业设计。它能够生成高质量的营销文案、博客文章和各种商业内容。',
    'cursor': 'Cursor 是一个由 AI 驱动的代码编辑器，集成了先进的AI编程助手功能。它能够理解代码上下文，提供智能建议，大大提升编程效率和代码质量。',
    'replicate': 'Replicate 是一个云端AI模型运行平台，让开发者能够轻松运行和部署各种开源AI模型。它支持图像生成、文本处理、音频合成等多种AI应用。',
    'huggingface': 'Hugging Face 是世界最大的AI模型社区平台，提供了丰富的预训练模型、数据集和工具。它是AI研究者和开发者分享和协作的重要平台。',
    'adobe-firefly': 'Adobe Firefly 是 Adobe 推出的创意生成AI套件，集成在 Creative Cloud 中。它提供了文本转图像、样式转换、字体生成等多种创意AI功能。'
  }
  
  if (defaultDescriptions[tool.slug]) {
    return defaultDescriptions[tool.slug]
  }
  
  // 根据分类生成通用描述
  const categoryDescriptions: Record<string, string> = {
    '对话AI': '是一个智能AI助手，能够进行自然对话、回答问题并协助完成各种文本任务。',
    '图像生成': '是一个AI图像生成工具，能够根据文本描述创造出高质量的图像和艺术作品。',
    '编程助手': '是一个AI编程助手，能够帮助开发者编写代码、调试程序并提高开发效率。',
    '生产力': '是一个智能生产力工具，能够帮助用户提高工作效率、管理任务和组织信息。',
    '写作助手': '是一个AI写作助手，能够帮助用户创作内容、改进文本质量并提供写作建议。'
  }
  
  const categoryName = tool.category?.name || '工具'
  const baseDesc = categoryDescriptions[categoryName] || '是一个实用的AI工具，能够帮助用户完成相关任务并提高效率。'
  
  return `${tool.name} ${baseDesc}它具有强大的AI能力，为用户提供智能化的解决方案。`
}

// 自动补全工具数据 - 集成智能分类和标签系统
function autoCompleteToolData(tool: any): any {
  // 首先生成基础数据
  const baseData = {
    ...tool,
    website_url: generateWebsiteUrl(tool),
    description: generateDescription(tool),
    upvotes_count: tool.upvotes_count || Math.floor(Math.random() * 2000) + 500,
    created_at: tool.created_at || new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000 * 2)).toISOString(),
    logo_url: tool.logo_url || `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(tool.name.charAt(0))}`,
    rating: tool.rating || parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
    users_count: tool.users_count || Math.floor(Math.random() * 50000000) + 1000000,
    pricing_type: tool.pricing_type || 'freemium'
  }
  
  // 应用智能分类（如果还没有分类）
  if (!baseData.category) {
    baseData.category = intelligentCategoryMapping(baseData)
  }
  
  // 应用智能标签生成（如果还没有标签）
  if (!baseData.tags || baseData.tags.length === 0) {
    baseData.tags = intelligentTagGeneration(baseData)
  }
  
  return baseData
}

function normalizeTools(raw: any[]): Tool[] {
  return raw.map(normalizeTool).filter((tool): tool is Tool => tool !== null)
}

function normalizeTool(raw: any): Tool | null {
  try {
    // 自动补全缺失的字段
    const completed = autoCompleteToolData(raw)
    
    // 生成slug如果不存在
    const slug = completed.slug || completed.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `tool-${completed.id}`
    
    // 处理分类 - 优先使用现有分类，否则使用智能分类
    let category = completed.tool_categories?.[0]?.category || completed.category || undefined
    if (!category) {
      category = intelligentCategoryMapping(completed)
    }
    
    // 处理标签 - 优先使用现有标签，否则使用智能标签生成
    let tags = completed.tool_tags?.map((tt: any) => tt.tag).filter(Boolean) || completed.tags || []
    if (!tags || tags.length === 0) {
      tags = intelligentTagGeneration(completed)
    }
    
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
      rating: raw.rating || parseFloat((4.0 + Math.random() * 1.0).toFixed(1)), // 生成4.0-5.0的随机评分，保留1位小数
      users_count: raw.users_count || raw.upvotes_count || 0,
      upvotes_count: raw.upvotes_count || 0,
      pricing_type: (raw.pricing_type || raw.pricing || 'freemium').toLowerCase() as 'free' | 'paid' | 'freemium',
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }

    // 验证数据
    const isValid = validateTool(toolData)
    return isValid ? toolData : null
  } catch (error) {
    console.error('Error normalizing tool:', error, raw)
    return null
  }
}
