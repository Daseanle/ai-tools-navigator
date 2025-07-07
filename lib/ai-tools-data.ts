/**
 * 真实AI工具数据库
 * 包含最新最热门的AI工具，定期更新
 */

import type { Tool, Category } from "@/types"

// 分类数据
export const categories: Category[] = [
  {
    id: 1,
    name: "AI写作",
    slug: "ai-writing",
    description: "AI辅助写作工具，提升内容创作效率",
    icon: "✍️",
    tools_count: 25,
    color: "#3B82F6",
    sort_order: 1,
    is_active: true
  },
  {
    id: 2,
    name: "AI绘画",
    slug: "ai-art",
    description: "AI图像生成和艺术创作工具",
    icon: "🎨",
    tools_count: 18,
    color: "#8B5CF6",
    sort_order: 2,
    is_active: true
  },
  {
    id: 3,
    name: "AI编程",
    slug: "ai-code",
    description: "AI编程助手和代码生成工具",
    icon: "💻",
    tools_count: 22,
    color: "#10B981",
    sort_order: 3,
    is_active: true
  },
  {
    id: 4,
    name: "AI视频",
    slug: "ai-video",
    description: "AI视频创作和编辑工具",
    icon: "🎬",
    tools_count: 15,
    color: "#F59E0B",
    sort_order: 4,
    is_active: true
  },
  {
    id: 5,
    name: "AI音频",
    slug: "ai-audio",
    description: "AI语音合成和音频处理工具",
    icon: "🔊",
    tools_count: 12,
    color: "#EF4444",
    sort_order: 5,
    is_active: true
  },
  {
    id: 6,
    name: "生产力工具",
    slug: "productivity",
    description: "AI助手和办公效率工具",
    icon: "⚡",
    tools_count: 30,
    color: "#06B6D4",
    sort_order: 6,
    is_active: true
  },
  {
    id: 7,
    name: "数据分析",
    slug: "data-analysis",
    description: "AI数据分析和商业智能工具",
    icon: "📊",
    tools_count: 16,
    color: "#84CC16",
    sort_order: 7,
    is_active: true
  },
  {
    id: 8,
    name: "客服聊天",
    slug: "chatbot",
    description: "AI客服和聊天机器人工具",
    icon: "💬",
    tools_count: 14,
    color: "#F97316",
    sort_order: 8,
    is_active: true
  }
]

// 标签数据
export const tags = [
  { id: 1, name: "免费", slug: "free", color: "#10B981" },
  { id: 2, name: "开源", slug: "open-source", color: "#3B82F6" },
  { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
  { id: 4, name: "移动端", slug: "mobile", color: "#F59E0B" },
  { id: 5, name: "浏览器扩展", slug: "extension", color: "#EF4444" },
  { id: 6, name: "企业级", slug: "enterprise", color: "#06B6D4" },
  { id: 7, name: "实时", slug: "realtime", color: "#84CC16" },
  { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
]

// 完整的AI工具数据库
export const aiTools: Tool[] = [
  // AI写作工具
  {
    id: 1,
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "OpenAI的对话式AI助手",
    description: "ChatGPT是由OpenAI开发的大型语言模型，能够进行自然对话、回答问题、辅助写作、代码生成等多种任务。支持中文对话，是目前最受欢迎的AI助手之一。",
    logo_url: "/tools/chatgpt.png",
    website_url: "https://chat.openai.com",
    rating: 4.8,
    users_count: 100000000,
    upvotes_count: 15420,
    pricing_type: "freemium",
    created_at: "2022-11-30T00:00:00Z",
    category: { id: 1, name: "AI写作", slug: "ai-writing", icon: "✍️" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
      { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
    ]
  },
  {
    id: 2,
    slug: "claude",
    name: "Claude",
    tagline: "Anthropic的AI对话助手",
    description: "Claude是由Anthropic开发的AI助手，以安全性和有用性著称。擅长复杂推理、创意写作、数学计算和代码分析，提供更长的上下文窗口。",
    logo_url: "/tools/claude.png",
    website_url: "https://claude.ai",
    rating: 4.7,
    users_count: 5000000,
    upvotes_count: 8920,
    pricing_type: "freemium",
    created_at: "2023-03-14T00:00:00Z",
    category: { id: 1, name: "AI写作", slug: "ai-writing", icon: "✍️" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" }
    ]
  },
  {
    id: 3,
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "集成在Notion中的AI写作助手",
    description: "Notion AI直接集成在Notion工作空间中，帮助用户快速生成、编辑和总结内容。支持多种写作风格，从会议纪要到创意文案，显著提升工作效率。",
    logo_url: "/tools/notion.png",
    website_url: "https://notion.so/product/ai",
    rating: 4.5,
    users_count: 3000000,
    upvotes_count: 6540,
    pricing_type: "paid",
    created_at: "2023-02-22T00:00:00Z",
    category: { id: 6, name: "生产力工具", slug: "productivity", icon: "⚡" },
    tags: [
      { id: 6, name: "企业级", slug: "enterprise", color: "#06B6D4" },
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },
  {
    id: 4,
    slug: "jasper",
    name: "Jasper",
    tagline: "专业的AI内容营销工具",
    description: "Jasper是专为企业和营销团队设计的AI写作平台，提供50+种内容模板，支持品牌语调自定义，帮助创建博客、广告文案、社交媒体内容等。",
    logo_url: "/tools/jasper.png",
    website_url: "https://jasper.ai",
    rating: 4.4,
    users_count: 1500000,
    upvotes_count: 4320,
    pricing_type: "paid",
    created_at: "2021-01-20T00:00:00Z",
    category: { id: 1, name: "AI写作", slug: "ai-writing", icon: "✍️" },
    tags: [
      { id: 6, name: "企业级", slug: "enterprise", color: "#06B6D4" },
      { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
    ]
  },

  // AI绘画工具
  {
    id: 5,
    slug: "midjourney",
    name: "Midjourney",
    tagline: "顶级AI艺术图像生成工具",
    description: "Midjourney是目前最受欢迎的AI图像生成工具之一，以其出色的艺术风格和高质量输出而闻名。通过Discord使用，支持各种艺术风格和创意指令。",
    logo_url: "/tools/midjourney.png",
    website_url: "https://midjourney.com",
    rating: 4.9,
    users_count: 15000000,
    upvotes_count: 12890,
    pricing_type: "paid",
    created_at: "2022-03-01T00:00:00Z",
    category: { id: 2, name: "AI绘画", slug: "ai-art", icon: "🎨" },
    tags: [
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },
  {
    id: 6,
    slug: "dall-e-3",
    name: "DALL-E 3",
    tagline: "OpenAI的最新AI图像生成模型",
    description: "DALL-E 3是OpenAI开发的最新图像生成模型，能够根据文本描述创建高质量、细节丰富的图像。现已集成到ChatGPT Plus中，提供更准确的图像生成能力。",
    logo_url: "/tools/dalle.png",
    website_url: "https://openai.com/dall-e-3",
    rating: 4.6,
    users_count: 8000000,
    upvotes_count: 9650,
    pricing_type: "paid",
    created_at: "2023-10-01T00:00:00Z",
    category: { id: 2, name: "AI绘画", slug: "ai-art", icon: "🎨" },
    tags: [
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
      { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
    ]
  },
  {
    id: 7,
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    tagline: "开源的AI图像生成模型",
    description: "Stable Diffusion是一个开源的文本到图像生成模型，由Stability AI开发。用户可以在本地运行或通过各种在线平台使用，支持高度自定义和扩展。",
    logo_url: "/tools/stable-diffusion.png",
    website_url: "https://stability.ai/stable-diffusion",
    rating: 4.3,
    users_count: 12000000,
    upvotes_count: 8750,
    pricing_type: "free",
    created_at: "2022-08-22T00:00:00Z",
    category: { id: 2, name: "AI绘画", slug: "ai-art", icon: "🎨" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 2, name: "开源", slug: "open-source", color: "#3B82F6" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" }
    ]
  },

  // AI编程工具
  {
    id: 8,
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "你的AI编程伙伴",
    description: "GitHub Copilot是由GitHub和OpenAI合作开发的AI编程助手，能够在您编写代码时提供智能建议和自动补全，支持数十种编程语言。",
    logo_url: "/tools/copilot.png",
    website_url: "https://github.com/features/copilot",
    rating: 4.5,
    users_count: 2000000,
    upvotes_count: 7890,
    pricing_type: "paid",
    created_at: "2021-06-29T00:00:00Z",
    category: { id: 3, name: "AI编程", slug: "ai-code", icon: "💻" },
    tags: [
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
      { id: 5, name: "浏览器扩展", slug: "extension", color: "#EF4444" }
    ]
  },
  {
    id: 9,
    slug: "cursor",
    name: "Cursor",
    tagline: "AI原生代码编辑器",
    description: "Cursor是一个AI原生的代码编辑器，内置GPT-4支持，提供智能代码生成、调试和重构功能。基于VS Code构建，为AI编程体验专门优化。",
    logo_url: "/tools/cursor.png",
    website_url: "https://cursor.sh",
    rating: 4.6,
    users_count: 500000,
    upvotes_count: 3240,
    pricing_type: "freemium",
    created_at: "2023-01-15T00:00:00Z",
    category: { id: 3, name: "AI编程", slug: "ai-code", icon: "💻" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },

  // AI视频工具
  {
    id: 10,
    slug: "runway",
    name: "Runway",
    tagline: "创意人的AI视频工具",
    description: "Runway是一个强大的AI视频创作平台，提供文本生成视频、图像生成视频、视频编辑等功能。被众多创意专业人士和内容创作者使用。",
    logo_url: "/tools/runway.png",
    website_url: "https://runwayml.com",
    rating: 4.4,
    users_count: 3000000,
    upvotes_count: 5670,
    pricing_type: "freemium",
    created_at: "2018-06-01T00:00:00Z",
    category: { id: 4, name: "AI视频", slug: "ai-video", icon: "🎬" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" }
    ]
  },
  {
    id: 11,
    slug: "pika",
    name: "Pika",
    tagline: "AI视频生成新星",
    description: "Pika是一个AI视频生成工具，能够从文本或图像创建高质量的短视频。界面简洁易用，生成速度快，是视频创作者的新选择。",
    logo_url: "/tools/pika.png",
    website_url: "https://pika.art",
    rating: 4.2,
    users_count: 1000000,
    upvotes_count: 2890,
    pricing_type: "freemium",
    created_at: "2023-04-01T00:00:00Z",
    category: { id: 4, name: "AI视频", slug: "ai-video", icon: "🎬" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },

  // AI音频工具
  {
    id: 12,
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "最逼真的AI语音合成",
    description: "ElevenLabs提供业界领先的AI语音合成技术，能够克隆真人声音并生成极其逼真的语音。支持多种语言和情感表达，广泛用于内容创作。",
    logo_url: "/tools/elevenlabs.png",
    website_url: "https://elevenlabs.io",
    rating: 4.7,
    users_count: 2000000,
    upvotes_count: 6780,
    pricing_type: "freemium",
    created_at: "2022-01-01T00:00:00Z",
    category: { id: 5, name: "AI音频", slug: "ai-audio", icon: "🔊" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
      { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
    ]
  },

  // 生产力工具
  {
    id: 13,
    slug: "perplexity",
    name: "Perplexity",
    tagline: "AI驱动的搜索引擎",
    description: "Perplexity是一个AI搜索引擎，结合了搜索和AI对话的功能，提供准确的答案和可靠的来源引用。是研究和信息查找的强大工具。",
    logo_url: "/tools/perplexity.png",
    website_url: "https://perplexity.ai",
    rating: 4.5,
    users_count: 10000000,
    upvotes_count: 4560,
    pricing_type: "freemium",
    created_at: "2022-08-01T00:00:00Z",
    category: { id: 6, name: "生产力工具", slug: "productivity", icon: "⚡" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 4, name: "移动端", slug: "mobile", color: "#F59E0B" },
      { id: 8, name: "多语言", slug: "multilingual", color: "#F97316" }
    ]
  },
  {
    id: 14,
    slug: "grammarly",
    name: "Grammarly",
    tagline: "AI写作助手和语法检查",
    description: "Grammarly是一个AI驱动的写作助手，提供语法检查、拼写纠正、风格建议和抄袭检测。帮助用户写出更清晰、更有效的内容。",
    logo_url: "/tools/grammarly.png",
    website_url: "https://grammarly.com",
    rating: 4.6,
    users_count: 30000000,
    upvotes_count: 8900,
    pricing_type: "freemium",
    created_at: "2009-01-01T00:00:00Z",
    category: { id: 1, name: "AI写作", slug: "ai-writing", icon: "✍️" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 5, name: "浏览器扩展", slug: "extension", color: "#EF4444" },
      { id: 4, name: "移动端", slug: "mobile", color: "#F59E0B" }
    ]
  },

  // 数据分析工具
  {
    id: 15,
    slug: "tableau-gpt",
    name: "Tableau GPT",
    tagline: "AI增强的数据分析平台",
    description: "Tableau GPT将生成式AI集成到Tableau平台中，帮助用户通过自然语言查询数据、生成见解和创建可视化图表，让数据分析更加直观。",
    logo_url: "/tools/tableau.png",
    website_url: "https://tableau.com/products/tableau-gpt",
    rating: 4.3,
    users_count: 1200000,
    upvotes_count: 3450,
    pricing_type: "paid",
    created_at: "2023-05-01T00:00:00Z",
    category: { id: 7, name: "数据分析", slug: "data-analysis", icon: "📊" },
    tags: [
      { id: 6, name: "企业级", slug: "enterprise", color: "#06B6D4" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" }
    ]
  },

  // 客服聊天工具
  {
    id: 16,
    slug: "intercom-ai",
    name: "Intercom AI",
    tagline: "智能客服解决方案",
    description: "Intercom AI是一个智能客服平台，使用AI自动回答客户问题、路由对话和提供个性化支持。帮助企业提供24/7客户服务。",
    logo_url: "/tools/intercom.png",
    website_url: "https://intercom.com/ai",
    rating: 4.4,
    users_count: 800000,
    upvotes_count: 2340,
    pricing_type: "paid",
    created_at: "2011-08-01T00:00:00Z",
    category: { id: 8, name: "客服聊天", slug: "chatbot", icon: "💬" },
    tags: [
      { id: 6, name: "企业级", slug: "enterprise", color: "#06B6D4" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" },
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },

  // 更多热门工具...
  {
    id: 17,
    slug: "canva-ai",
    name: "Canva AI",
    tagline: "AI设计工具",
    description: "Canva集成了多种AI功能，包括AI图像生成、背景移除、文本生成等，让设计变得更简单。适合非设计师快速创建专业视觉内容。",
    logo_url: "/tools/canva.png",
    website_url: "https://canva.com/ai",
    rating: 4.5,
    users_count: 130000000,
    upvotes_count: 11200,
    pricing_type: "freemium",
    created_at: "2013-01-01T00:00:00Z",
    category: { id: 2, name: "AI绘画", slug: "ai-art", icon: "🎨" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 4, name: "移动端", slug: "mobile", color: "#F59E0B" }
    ]
  },
  {
    id: 18,
    slug: "replit-ai",
    name: "Replit AI",
    tagline: "协作编程的AI助手",
    description: "Replit AI是集成在Replit在线编程环境中的AI助手，提供代码生成、解释和调试功能。支持多种编程语言，适合学习和协作开发。",
    logo_url: "/tools/replit.png",
    website_url: "https://replit.com/ai",
    rating: 4.2,
    users_count: 3000000,
    upvotes_count: 4580,
    pricing_type: "freemium",
    created_at: "2016-01-01T00:00:00Z",
    category: { id: 3, name: "AI编程", slug: "ai-code", icon: "💻" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 7, name: "实时", slug: "realtime", color: "#84CC16" }
    ]
  },
  {
    id: 19,
    slug: "character-ai",
    name: "Character.AI",
    tagline: "创建和对话AI角色",
    description: "Character.AI允许用户创建和与AI角色对话，这些角色可以模拟历史人物、虚构角色或自定义个性。提供娱乐性的AI聊天体验。",
    logo_url: "/tools/character-ai.png",
    website_url: "https://character.ai",
    rating: 4.1,
    users_count: 20000000,
    upvotes_count: 6780,
    pricing_type: "freemium",
    created_at: "2022-09-16T00:00:00Z",
    category: { id: 8, name: "客服聊天", slug: "chatbot", icon: "💬" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 4, name: "移动端", slug: "mobile", color: "#F59E0B" }
    ]
  },
  {
    id: 20,
    slug: "leonardo-ai",
    name: "Leonardo.AI",
    tagline: "游戏资产AI生成工具",
    description: "Leonardo.AI专注于游戏和创意资产的AI生成，提供高质量的角色、环境和物品图像。特别适合游戏开发者和概念艺术家使用。",
    logo_url: "/tools/leonardo.png",
    website_url: "https://leonardo.ai",
    rating: 4.3,
    users_count: 4000000,
    upvotes_count: 5230,
    pricing_type: "freemium",
    created_at: "2022-11-01T00:00:00Z",
    category: { id: 2, name: "AI绘画", slug: "ai-art", icon: "🎨" },
    tags: [
      { id: 1, name: "免费", slug: "free", color: "#10B981" },
      { id: 3, name: "API", slug: "api", color: "#8B5CF6" }
    ]
  }
]

// 获取热门工具（按用户数排序）
export function getPopularTools(limit: number = 8): Tool[] {
  return aiTools
    .sort((a, b) => (b.users_count || 0) - (a.users_count || 0))
    .slice(0, limit)
}

// 获取最新工具（按创建时间排序）
export function getLatestTools(limit: number = 8): Tool[] {
  return aiTools
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, limit)
}

// 获取免费工具
export function getFreeTools(): Tool[] {
  return aiTools.filter(tool => tool.pricing_type === 'free' || tool.pricing_type === 'freemium')
}

// 按分类获取工具
export function getToolsByCategory(categorySlug: string): Tool[] {
  return aiTools.filter(tool => tool.category?.slug === categorySlug)
}

// 搜索工具
export function searchTools(query: string): Tool[] {
  const lowercaseQuery = query.toLowerCase()
  return aiTools.filter(tool => 
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.tagline.toLowerCase().includes(lowercaseQuery) ||
    tool.description?.toLowerCase().includes(lowercaseQuery) ||
    tool.category?.name.toLowerCase().includes(lowercaseQuery) ||
    tool.tags?.some(tag => tag.name.toLowerCase().includes(lowercaseQuery))
  )
}

// 获取推荐工具（高评分 + 高用户数）
export function getRecommendedTools(limit: number = 6): Tool[] {
  return aiTools
    .filter(tool => (tool.rating || 0) >= 4.3 && (tool.users_count || 0) >= 1000000)
    .sort((a, b) => {
      const scoreA = (a.rating || 0) * Math.log10((a.users_count || 1))
      const scoreB = (b.rating || 0) * Math.log10((b.users_count || 1))
      return scoreB - scoreA
    })
    .slice(0, limit)
}