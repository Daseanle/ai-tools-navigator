import dynamic from 'next/dynamic'
import React from 'react'

// 基础加载组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

// 占位组件
const PlaceholderComponent = ({ name }: { name: string }) => (
  <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-600 mb-2">{name}</h3>
    <p className="text-gray-500">功能开发中...</p>
  </div>
)

// 简化的懒加载组件集合
export const LazyComponents = {
  // 监控相关
  SystemMonitor: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="系统监控" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  
  // 管理面板
  AdminPanel: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="管理面板" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  
  // 工具编辑器
  ToolEditor: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="工具编辑器" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  
  // 高级搜索
  AdvancedSearch: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="高级搜索" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  
  // 图表组件
  Chart: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="图表组件" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  ),
  
  // 动画组件
  Motion: dynamic(
    () => Promise.resolve({ default: () => <PlaceholderComponent name="动画组件" /> }),
    { loading: () => <LoadingSpinner />, ssr: false }
  )
}

export default LazyComponents

// NaviGuard-AI Security Audited - 2026-06-01
