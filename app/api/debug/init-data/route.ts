import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 示例工具数据
const sampleTools = [
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    description: '强大的AI对话助手，能够回答问题、协助写作、编程等多种任务',
    tagline: '最受欢迎的AI聊天助手',
    website: 'https://chat.openai.com',
    pricing: 'freemium',
    status: 'active',
    featured: true,
    rating: 4.8,
    visits: 1000000,
    free_tier: true,
    trial_available: false,
    api_available: true,
    tags: ['AI聊天', '写作助手', '编程'],
    features: ['自然语言理解', '多语言支持', '代码生成', '文本创作'],
    category_id: 1,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  },
  {
    name: 'Midjourney',
    slug: 'midjourney', 
    description: 'AI图像生成工具，通过文字描述创造惊人的艺术作品',
    tagline: '顶级AI图像生成器',
    website: 'https://midjourney.com',
    pricing: 'paid',
    status: 'active',
    featured: true,
    rating: 4.7,
    visits: 500000,
    free_tier: false,
    trial_available: true,
    api_available: false,
    tags: ['AI绘画', '图像生成', '艺术创作'],
    features: ['文字生成图像', '多种艺术风格', '高质量输出', '社区分享'],
    category_id: 2,
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/midjourney.png'
  },
  {
    name: 'GitHub Copilot',
    slug: 'github-copilot',
    description: 'AI编程助手，提供智能代码补全和建议',
    tagline: '程序员的AI助手',
    website: 'https://github.com/features/copilot',
    pricing: 'paid',
    status: 'active', 
    featured: true,
    rating: 4.6,
    visits: 300000,
    free_tier: false,
    trial_available: true,
    api_available: true,
    tags: ['AI编程', '代码助手', '开发工具'],
    features: ['代码自动补全', '函数生成', '多语言支持', 'VS Code集成'],
    category_id: 3,
    logo: 'https://github.githubassets.com/images/modules/site/copilot/copilot.png'
  },
  {
    name: 'Canva AI',
    slug: 'canva-ai',
    description: 'AI设计工具，快速创建专业的图形设计作品',
    tagline: '让设计变得简单',
    website: 'https://www.canva.com',
    pricing: 'freemium',
    status: 'active',
    featured: false,
    rating: 4.5,
    visits: 200000,
    free_tier: true,
    trial_available: false,
    api_available: true,
    tags: ['AI设计', '图形设计', '营销素材'],
    features: ['模板库', 'AI图像生成', '协作设计', '一键导出'],
    category_id: 4,
    logo: 'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg'
  },
  {
    name: 'Grammarly',
    slug: 'grammarly',
    description: 'AI写作助手，帮助改善语法、拼写和写作风格',
    tagline: '提升你的写作质量',
    website: 'https://grammarly.com',
    pricing: 'freemium',
    status: 'active',
    featured: false,
    rating: 4.4,
    visits: 150000,
    free_tier: true,
    trial_available: true,
    api_available: true,
    tags: ['写作助手', '语法检查', '文本编辑'],
    features: ['语法检查', '风格建议', '抄袭检测', '多平台支持'],
    category_id: 5,
    logo: 'https://static.grammarly.com/assets/files/9a25eb8d01a1b5e4e21e1cfa19b6a36b/logo.svg'
  }
]

// 示例分类数据
const sampleCategories = [
  {
    id: 1,
    name: 'AI聊天',
    slug: 'ai-chat',
    description: 'AI对话和聊天助手工具',
    icon: '💬',
    color: '#3B82F6',
    sort_order: 1,
    is_active: true,
    featured: true
  },
  {
    id: 2,
    name: 'AI绘画',
    slug: 'ai-image',
    description: 'AI图像生成和编辑工具',
    icon: '🎨',
    color: '#8B5CF6',
    sort_order: 2,
    is_active: true,
    featured: true
  },
  {
    id: 3,
    name: 'AI编程',
    slug: 'ai-code',
    description: 'AI编程和开发助手工具',
    icon: '💻',
    color: '#10B981',
    sort_order: 3,
    is_active: true,
    featured: true
  },
  {
    id: 4,
    name: '设计工具',
    slug: 'design-ui',
    description: 'AI设计和界面工具',
    icon: '✨',
    color: '#F59E0B',
    sort_order: 4,
    is_active: true,
    featured: true
  },
  {
    id: 5,
    name: 'AI写作',
    slug: 'ai-writing',
    description: 'AI写作和内容创作工具',
    icon: '✍️',
    color: '#EF4444',
    sort_order: 5,
    is_active: true,
    featured: true
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('开始初始化数据库...')

    // 先插入分类数据
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .upsert(sampleCategories, { onConflict: 'id' })
      .select()

    if (categoriesError) {
      console.error('分类插入失败:', categoriesError)
      return NextResponse.json({
        success: false,
        error: '分类数据插入失败: ' + categoriesError.message
      }, { status: 500 })
    }

    console.log('分类数据插入成功:', categoriesData)

    // 再插入工具数据
    const { data: toolsData, error: toolsError } = await supabase
      .from('tools')
      .upsert(sampleTools, { onConflict: 'slug' })
      .select()

    if (toolsError) {
      console.error('工具插入失败:', toolsError)
      return NextResponse.json({
        success: false,
        error: '工具数据插入失败: ' + toolsError.message
      }, { status: 500 })
    }

    console.log('工具数据插入成功:', toolsData)

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功',
      data: {
        categories: categoriesData?.length || 0,
        tools: toolsData?.length || 0
      }
    })

  } catch (error) {
    console.error('数据库初始化错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '数据库初始化失败'
    }, { status: 500 })
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
