'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// 懒加载重型组件
const MonitoringDashboard = dynamic(
  () => import('@/components/monitoring/monitoring-dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

const VirtualScroll = dynamic(
  () => import('@/components/performance/virtual-scroll').then(mod => ({ default: mod.VirtualScroll })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded" />,
    ssr: false
  }
)

const ChartComponents = dynamic(
  () => import('recharts').then(mod => ({
    default: {
      LineChart: mod.LineChart,
      Line: mod.Line,
      XAxis: mod.XAxis,
      YAxis: mod.YAxis,
      CartesianGrid: mod.CartesianGrid,
      Tooltip: mod.Tooltip,
      ResponsiveContainer: mod.ResponsiveContainer
    }
  })),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

const FramerMotionComponents = dynamic(
  () => import('framer-motion').then(mod => ({
    default: {
      motion: mod.motion,
      AnimatePresence: mod.AnimatePresence
    }
  })),
  {
    loading: () => <div />,
    ssr: false
  }
)

// 按功能分组的懒加载组件
export const LazyComponents = {
  // 监控相关
  MonitoringDashboard,
  
  // 性能相关
  VirtualScroll,
  
  // 图表相关
  Charts: ChartComponents,
  
  // 动画相关
  Motion: FramerMotionComponents,
  
  // 管理面板 - 只有管理员才加载
  AdminPanel: dynamic(
    () => import('@/components/admin/admin-panel'),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  ),
  
  // 工具编辑器 - 按需加载
  ToolEditor: dynamic(
    () => import('@/components/tools/tool-editor'),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  ),
  
  // 高级搜索 - 按需加载
  AdvancedSearch: dynamic(
    () => import('@/components/search/advanced-search'),
    {
      loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
      ssr: false
    }
  ),
  
  // 用户设置 - 按需加载
  UserSettings: dynamic(
    () => import('@/components/user/user-settings'),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  ),
  
  // 分析工具 - 按需加载
  Analytics: dynamic(
    () => import('@/components/analytics/analytics-dashboard'),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  ),
  
  // 社区功能 - 按需加载
  Community: dynamic(
    () => import('@/components/community/community-hub'),
    {
      loading: () => <LoadingSpinner />,
      ssr: false
    }
  )
}

// 创建加载状态组件
export const ComponentLoader = ({ type }: { type: keyof typeof LazyComponents }) => {
  const Component = LazyComponents[type]
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  )
}