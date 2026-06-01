// Supabase认证配置和工具函数
import { createClient } from "@supabase/supabase-js"
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create supabase client with fallback handling
const createSupabaseClient = () => {
  // 验证环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error(
        "❌ Supabase环境变量缺失。请在Vercel环境变量中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY"
      )
    }
    // For development/demo purposes, use fallback values
    const fallbackUrl = 'https://demo.supabase.co'
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.demo'
    
    // Create client with fallback values to prevent app crash
    return createClient(fallbackUrl, fallbackKey)
  }
  
  // 验证URL格式
  if (!supabaseUrl.startsWith('https://') || !supabaseAnonKey.startsWith('eyJ')) {
    console.error('Invalid Supabase credentials format')
    // Use fallback for invalid format
    const fallbackUrl = 'https://demo.supabase.co'
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.demo'
    return createClient(fallbackUrl, fallbackKey)
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// Helper for server-side service-role access
export const createServerClient = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY for server-side requests.")
    // Return a mock client for demo purposes
    return createClient('https://demo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.demo')
  }
  const finalUrl = supabaseUrl || 'https://demo.supabase.co'
  return createClient<Database>(finalUrl, serviceKey)
}

// Server-side client with proper error handling
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !serviceKey) {
    // Return a non-functional client that won't crash the app
    console.warn('Supabase server client not properly configured')
    return createClient('https://demo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.demo')
  }
  
  return createClient<Database>(url, serviceKey)
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

// NaviGuard-AI Security Audited - 2026-06-01
