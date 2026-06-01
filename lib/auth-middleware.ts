import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 认证中间件
export async function withAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options: { required?: boolean } = { required: true }
) {
  return async (request: NextRequest) => {
    try {
      const authHeader = request.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (options.required) {
          return NextResponse.json(
            { success: false, error: '未授权访问' },
            { status: 401 }
          )
        }
        return handler(request, null)
      }

      const token = authHeader.split(' ')[1]
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        if (options.required) {
          return NextResponse.json(
            { success: false, error: '无效的访问令牌' },
            { status: 401 }
          )
        }
        return handler(request, null)
      }

      return handler(request, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { success: false, error: '认证服务错误' },
        { status: 500 }
      )
    }
  }
}

// 角色检查中间件
export async function withRole(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  allowedRoles: string[] = ['user']
) {
  return withAuth(async (request: NextRequest, user: any) => {
    if (!user) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      )
    }

    // 从数据库获取用户角色
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !userProfile) {
      return NextResponse.json(
        { success: false, error: '用户信息获取失败' },
        { status: 500 }
      )
    }

    const userRole = userProfile.role || 'user'
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    return handler(request, { ...user, role: userRole })
  })
}

// 会员等级检查中间件
export async function withMembership(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  requiredLevel: string = 'free'
) {
  return withAuth(async (request: NextRequest, user: any) => {
    if (!user) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      )
    }

    // 获取用户会员信息
    const { data: membership, error } = await supabase
      .from('user_memberships')
      .select('membership_type, expires_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: '会员信息获取失败' },
        { status: 500 }
      )
    }

    const membershipType = membership?.membership_type || 'free'
    const expiresAt = membership?.expires_at

    // 检查会员是否过期
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: '会员已过期' },
        { status: 403 }
      )
    }

    // 会员等级检查
    const levelHierarchy = ['free', 'experience', 'industry', 'team']
    const userLevel = levelHierarchy.indexOf(membershipType)
    const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel)

    if (userLevel < requiredLevelIndex) {
      return NextResponse.json(
        { 
          success: false, 
          error: `需要${requiredLevel}及以上会员等级`,
          required_level: requiredLevel,
          current_level: membershipType
        },
        { status: 403 }
      )
    }

    return handler(request, { 
      ...user, 
      membership: { 
        type: membershipType, 
        expires_at: expiresAt 
      } 
    })
  })
}

// 资源所有者检查中间件
export async function withOwnership(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  getResourceUserId: (request: NextRequest) => Promise<string | null>
) {
  return withAuth(async (request: NextRequest, user: any) => {
    if (!user) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      )
    }

    const resourceUserId = await getResourceUserId(request)
    
    if (!resourceUserId) {
      return NextResponse.json(
        { success: false, error: '资源不存在' },
        { status: 404 }
      )
    }

    if (resourceUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权限访问此资源' },
        { status: 403 }
      )
    }

    return handler(request, user)
  })
}

// 管理员检查中间件
export const withAdmin = (handler: (request: NextRequest, user: any) => Promise<NextResponse>) => {
  return withRole(handler, ['admin'])
}

// 创建者检查中间件
export const withCreator = (handler: (request: NextRequest, user: any) => Promise<NextResponse>) => {
  return withRole(handler, ['creator', 'admin'])
}

// 验证请求来源
export function validateRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  const allowedOrigins = [
    'http://localhost:3000',
    'https://ai-tools-navigator.vercel.app',
    process.env.NEXT_PUBLIC_BASE_URL
  ].filter(Boolean)

  return allowedOrigins.some(allowedOrigin => 
    origin === allowedOrigin || referer?.startsWith(allowedOrigin + '/')
  )
}

// API响应格式化
export function createApiResponse(
  data: any = null,
  success: boolean = true,
  error: string | null = null,
  statusCode: number = 200
) {
  return NextResponse.json(
    {
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  )
}

// 错误处理
export function handleApiError(error: any, defaultMessage: string = '服务器内部错误') {
  console.error('API Error:', error)
  
  if (error.code === 'PGRST116') {
    return createApiResponse(null, false, '资源不存在', 404)
  }
  
  if (error.code === '23505') {
    return createApiResponse(null, false, '数据已存在', 409)
  }
  
  if (error.code === '23503') {
    return createApiResponse(null, false, '关联数据不存在', 400)
  }
  
  return createApiResponse(null, false, defaultMessage, 500)
}

// NaviGuard-AI Security Audited - 2026-06-01
