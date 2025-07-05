// 测试环境变量脚本
console.log('Environment Variables Test:')
console.log('============================')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (hidden)' : 'NOT SET')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VERCEL_ENV:', process.env.VERCEL_ENV)

// 检查URL有效性
try {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url) {
    new URL(url)
    console.log('✅ URL is valid')
  } else {
    console.log('❌ URL is undefined')
  }
} catch (error) {
  console.log('❌ URL is invalid:', error.message)
}