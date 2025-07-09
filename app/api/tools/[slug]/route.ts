import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: {
    slug: string
  }
}

// 获取单个工具详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params

    const { data: tool, error } = await supabase
      .from('tools')
      .select(`
        *,
        categories!inner(name, slug, icon),
        tool_ratings(rating, comment, user_id, created_at)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Get tool error:', error)
      // 返回模拟数据作为回退
      const mockTool = getMockTool(slug)
      if (mockTool) {
        return NextResponse.json({
          success: true,
          tool: mockTool
        })
      }
      return NextResponse.json({ 
        success: false, 
        error: '工具不存在' 
      }, { status: 404 })
    }

    // 增加访问计数
    await supabase
      .from('tools')
      .update({ visits: (tool.visits || 0) + 1 })
      .eq('slug', slug)

    return NextResponse.json({
      success: true,
      tool: tool
    })

  } catch (error) {
    console.error('Get tool error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 更新工具信息
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    const updates = await request.json()

    const { data: tool, error } = await supabase
      .from('tools')
      .update({
        name: updates.name,
        description: updates.description,
        website: updates.website,
        category_id: updates.categoryId,
        pricing: updates.pricing,
        features: updates.features,
        tags: updates.tags,
        featured: updates.featured,
        logo: updates.logo,
        screenshots: updates.screenshots,
        video_url: updates.videoUrl,
        api_available: updates.apiAvailable,
        free_tier: updates.freeTier,
        trial_available: updates.trialAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('Update tool error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '更新工具失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tool: tool,
      message: '工具更新成功'
    })

  } catch (error) {
    console.error('Update tool error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 删除工具
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Delete tool error:', error)
      return NextResponse.json({ 
        success: false, 
        error: '删除工具失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '工具删除成功'
    })

  } catch (error) {
    console.error('Delete tool error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// 模拟数据回退
function getMockTool(slug: string) {
  const mockTools: Record<string, any> = {
    'chatgpt': {
      id: '1',
      name: 'ChatGPT',
      slug: 'chatgpt',
      description: '强大的AI对话助手，能够回答问题、协助创作、编程等多种任务。ChatGPT基于GPT-4架构，具有出色的语言理解和生成能力，可以在多个领域提供专业的帮助。',
      website: 'https://chat.openai.com',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' },
      pricing: 'Freemium',
      features: [
        '自然语言对话',
        '代码生成和调试',
        '文本创作和编辑',
        '问题解答和分析',
        '多语言支持',
        '上下文记忆',
        '插件系统',
        '网页浏览功能'
      ],
      tags: ['AI', '对话', '创作', '编程', 'GPT-4'],
      rating: 4.8,
      visits: 1250000,
      featured: true,
      status: 'active',
      logo: '/logos/chatgpt.png',
      screenshots: [
        '/screenshots/chatgpt-1.png',
        '/screenshots/chatgpt-2.png',
        '/screenshots/chatgpt-3.png'
      ],
      video_url: 'https://example.com/chatgpt-demo.mp4',
      api_available: true,
      free_tier: true,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      tool_ratings: [
        {
          rating: 5,
          comment: '非常好用的AI工具，回答准确，功能强大',
          user_id: 'user-1',
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          rating: 4,
          comment: '界面友好，功能丰富，但有时会有网络延迟',
          user_id: 'user-2',
          created_at: '2024-01-12T00:00:00Z'
        }
      ]
    },
    'claude': {
      id: '2',
      name: 'Claude',
      slug: 'claude',
      description: 'Anthropic开发的AI助手，擅长分析、写作和对话。Claude以其出色的推理能力和安全性著称，特别适合处理复杂的分析任务和长文本处理。',
      website: 'https://claude.ai',
      category: { name: 'AI对话', slug: 'ai-chat', icon: 'MessageCircle' },
      pricing: 'Freemium',
      features: [
        '智能对话',
        '文档分析',
        '代码辅助',
        '创意写作',
        '长文本处理',
        '安全可靠',
        '多轮对话',
        '文件上传'
      ],
      tags: ['AI', '对话', '分析', '写作', 'Claude'],
      rating: 4.7,
      visits: 890000,
      featured: true,
      status: 'active',
      logo: '/logos/claude.png',
      screenshots: [
        '/screenshots/claude-1.png',
        '/screenshots/claude-2.png'
      ],
      api_available: true,
      free_tier: true,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      tool_ratings: [
        {
          rating: 5,
          comment: '分析能力很强，回答很有深度',
          user_id: 'user-3',
          created_at: '2024-01-11T00:00:00Z'
        }
      ]
    },
    'midjourney': {
      id: '3',
      name: 'Midjourney',
      slug: 'midjourney',
      description: '基于AI的图像生成工具，创造惊人的艺术作品。Midjourney以其独特的艺术风格和高质量的图像输出闻名，是创意工作者的首选工具。',
      website: 'https://midjourney.com',
      category: { name: '图像生成', slug: 'image-generation', icon: 'Image' },
      pricing: 'Paid',
      features: [
        'AI绘画',
        '多种艺术风格',
        '高质量输出',
        '社区分享',
        '风格迁移',
        '批量生成',
        '参数调优',
        'Discord集成'
      ],
      tags: ['AI', '图像', '艺术', '创作', '绘画'],
      rating: 4.6,
      visits: 750000,
      featured: true,
      status: 'active',
      logo: '/logos/midjourney.png',
      screenshots: [
        '/screenshots/midjourney-1.png',
        '/screenshots/midjourney-2.png',
        '/screenshots/midjourney-3.png'
      ],
      api_available: false,
      free_tier: false,
      trial_available: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      tool_ratings: [
        {
          rating: 5,
          comment: '生成的图像质量很高，艺术感很强',
          user_id: 'user-4',
          created_at: '2024-01-13T00:00:00Z'
        }
      ]
    }
  }

  return mockTools[slug] || null
}