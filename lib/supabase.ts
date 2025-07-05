// Supabase认证配置和工具函数
import { createClient } from "@supabase/supabase-js"
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 验证环境变量（仅在运行时检查）
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "❌ Supabase环境变量缺失。请在.env文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY"
  )
}

// 确保URL是有效的
const validUrl = supabaseUrl || 'https://placeholder.supabase.co'
const validKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient<Database>(validUrl, validKey)

// Helper for server-side service-role access
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY for server-side requests.")
    return createClient<Database>(validUrl, validKey) // 回退到匿名密钥
  }
  return createClient<Database>(validUrl, serviceKey)
}

// 认证相关工具函数
export const auth = {
  // 注册新用户
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // 登录
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 登出
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 获取会话
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 重置密码
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  },

  // 监听认证状态变化
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}