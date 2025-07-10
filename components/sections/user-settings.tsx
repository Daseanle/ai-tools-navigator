"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User as UserIcon, Mail, Lock, Globe, Bell, Shield, Trash2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types"

interface UserSettingsProps {
  user: User
}

interface UserProfile {
  full_name: string
  avatar_url: string
  bio: string
  website: string
  location: string
  company: string
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  weekly_digest: boolean
  new_tools_alert: boolean
}

export default function UserSettings({ user }: UserSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: (user as any).user_metadata?.full_name || user.name || '',
    avatar_url: (user as any).user_metadata?.avatar_url || user.avatar_url || '',
    bio: '',
    website: '',
    location: '',
    company: ''
  })
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    new_tools_alert: false
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'privacy'>('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const saveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: profile
      })

      if (error) throw error
      
      // 显示成功消息
      alert('个人资料已更新')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    setLoading(true)
    try {
      // 这里可以保存到用户偏好设置表
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          notifications: notifications,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert('通知设置已更新')
    } catch (error) {
      console.error('Error updating notifications:', error)
      alert('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('确定要删除账户吗？此操作不可撤销。')) return
    
    try {
      // 这里需要调用删除账户的API
      alert('账户删除功能需要联系管理员')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('删除失败，请联系客服')
    }
  }

  const tabs = [
    { id: 'profile', label: '个人资料', icon: UserIcon },
    { id: 'account', label: '账户安全', icon: Shield },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'privacy', label: '隐私设置', icon: Lock },
  ] as const

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 侧边栏 */}
      <div className="lg:col-span-1">
        <div className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">设置导航</h3>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="lg:col-span-3">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-neutral-800/30 border border-neutral-700/50 rounded-2xl p-8"
        >
          {/* 个人资料 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">个人资料</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    全名
                  </label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入您的全名"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-neutral-700/30 border border-neutral-600 rounded-xl text-neutral-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    公司/组织
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入公司或组织名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    所在地区
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入所在地区"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    个人简介
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="介绍一下您自己..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>
          )}

          {/* 账户安全 */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">账户安全</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">更改密码</h3>
                  <p className="text-neutral-400 mb-4">定期更新密码以保护您的账户安全</p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    修改密码
                  </button>
                </div>

                <div className="p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">两步验证</h3>
                  <p className="text-neutral-400 mb-4">为您的账户添加额外的安全保护</p>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                    启用两步验证
                  </button>
                </div>

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">危险操作</h3>
                  <p className="text-neutral-400 mb-4">删除账户将永久移除所有数据，此操作不可撤销</p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    删除账户
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 通知设置 */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">通知设置</h2>
              
              <div className="space-y-4">
                {Object.entries({
                  email_notifications: '邮件通知',
                  push_notifications: '推送通知',
                  weekly_digest: '每周摘要',
                  new_tools_alert: '新工具提醒'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">{label}</h3>
                      <p className="text-neutral-400 text-sm">
                        {key === 'email_notifications' && '接收重要更新和通知邮件'}
                        {key === 'push_notifications' && '在浏览器中接收实时通知'}
                        {key === 'weekly_digest' && '每周接收工具推荐和总结'}
                        {key === 'new_tools_alert' && '有新工具发布时及时通知'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof NotificationSettings]}
                        onChange={(e) => setNotifications(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveNotifications}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? '保存中...' : '保存设置'}
                </button>
              </div>
            </div>
          )}

          {/* 隐私设置 */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">隐私设置</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">个人资料可见性</h3>
                  <p className="text-neutral-400 mb-4">控制其他用户能看到您的哪些信息</p>
                  <select className="w-full px-4 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-white">
                    <option>公开</option>
                    <option>仅好友</option>
                    <option>私密</option>
                  </select>
                </div>

                <div className="p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">数据导出</h3>
                  <p className="text-neutral-400 mb-4">下载您在平台上的所有数据</p>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                    导出数据
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-red-500/20 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="text-center">
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">确认删除账户</h3>
              <p className="text-neutral-400 mb-6">
                此操作将永久删除您的账户和所有数据，包括收藏、评价和个人设置。此操作不可撤销。
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={deleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  确认删除
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}