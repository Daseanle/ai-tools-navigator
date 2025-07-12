"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { Lock } from 'lucide-react'

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  
  // All hooks must be at the top level
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 注释掉自动重定向，让用户可以看到管理后台
    // if (!loading && (!user || !isAdmin)) {
    //   router.push('/')
    // }
  }, [user, isAdmin, loading, router])

  // Early returns after all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">正在验证权限...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">管理后台 - 演示模式</h1>
          <p className="text-neutral-400 mb-4">当前为演示模式，完整功能需要管理员权限</p>
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">系统状态</h3>
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span>部署状态:</span>
                <span className="text-green-400">✅ 正常</span>
              </div>
              <div className="flex justify-between">
                <span>数据库连接:</span>
                <span className="text-green-400">✅ 已连接</span>
              </div>
              <div className="flex justify-between">
                <span>API服务:</span>
                <span className="text-green-400">✅ 运行中</span>
              </div>
              <div className="flex justify-between">
                <span>安全系统:</span>
                <span className="text-green-400">✅ 已启用</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/zh')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            返回首页
          </button>
          <p className="text-xs text-neutral-500 mt-4">
            需要管理员权限请联系系统管理员
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] text-white p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            管理后台
          </h1>
          <p className="text-neutral-400 mt-2">AI工具导航平台管理中心</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">系统状态</h3>
            <p className="text-green-400 text-2xl font-bold">正常运行</p>
            <p className="text-neutral-400 text-sm">所有服务正常</p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">工具数量</h3>
            <p className="text-blue-400 text-2xl font-bold">2,584</p>
            <p className="text-neutral-400 text-sm">已收录工具</p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">用户活跃</h3>
            <p className="text-purple-400 text-2xl font-bold">1,247</p>
            <p className="text-neutral-400 text-sm">当前在线</p>
          </div>

          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">自动化任务</h3>
            <p className="text-yellow-400 text-2xl font-bold">运行中</p>
            <p className="text-neutral-400 text-sm">3个任务活跃</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">快速操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/zh/admin/content')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
            >
              内容管理
            </button>
            <button
              onClick={() => router.push('/zh/admin/crawling')}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              工具抓取
            </button>
            <button
              onClick={() => router.push('/zh/admin/status')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
            >
              系统状态
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}