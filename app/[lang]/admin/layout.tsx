"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard,
  FileText,
  Bot,
  Search,
  Settings,
  BarChart3,
  Users,
  Globe,
  Shield,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    category: '主控制台',
    items: [
      { name: '系统概览', href: '/admin', icon: LayoutDashboard },
      { name: '系统状态', href: '/admin/status', icon: BarChart3 },
    ]
  },
  {
    category: '自动化系统',
    items: [
      { name: '内容生成', href: '/admin/content', icon: FileText },
      { name: '工具爬取', href: '/admin/crawling', icon: Bot },
      { name: 'SEO优化', href: '/admin/seo', icon: Search },
      { name: '性能优化', href: '/admin/performance', icon: BarChart3 },
    ]
  },
  {
    category: '系统管理',
    items: [
      { name: '用户管理', href: '/admin/users', icon: Users },
      { name: '网站设置', href: '/admin/settings', icon: Settings },
      { name: '安全中心', href: '/admin/security', icon: Shield },
    ]
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname.endsWith('/admin')
    }
    return pathname.includes(href)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 移动端顶部导航 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-800 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold gradient-text">AI管理后台</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 侧边栏 */}
      <motion.div
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : -320,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }}
        className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0a]/95 backdrop-blur-md border-r border-neutral-800 z-40 lg:translate-x-0 lg:static lg:z-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Navigator</h1>
              <p className="text-xs text-neutral-400">管理后台</p>
            </div>
          </div>

          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            active
                              ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500'
                              : 'hover:bg-neutral-800/50 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.name}</span>
                          {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* 系统状态指示 */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-400">系统运行正常</span>
            </div>
            <div className="text-xs text-neutral-400">
              上次更新: 2分钟前
            </div>
          </div>
        </div>
      </motion.div>

      {/* 遵罩层 */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 主内容区域 */}
      <div className="lg:ml-80 min-h-screen pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  )
}