"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User as UserIcon, Mail, Lock, Globe, Bell, Shield, Trash2, Save, Eye, EyeOff, QrCode, Smartphone } from "lucide-react"
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

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface TwoFactorData {
  enabled: boolean
  secret?: string
  qrCode?: string
  manual_entry_key?: string
}

interface DeleteAccountData {
  password: string
  confirmText: string
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
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
  // 密码修改相关状态
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // 两步验证相关状态
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData>({
    enabled: false
  })
  const [twoFactorToken, setTwoFactorToken] = useState('')
  
  // 删除账户相关状态
  const [deleteData, setDeleteData] = useState<DeleteAccountData>({
    password: '',
    confirmText: ''
  })

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

  // 修改密码
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('新密码和确认密码不匹配')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('新密码长度至少需要8位')
      return
    }

    setLoading(true)
    try {
      // 获取CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfResponse.json()

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      alert('密码修改成功')
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      alert(error.message || '密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取两步验证状态
  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/two-factor')
      const result = await response.json()

      if (response.ok) {
        setTwoFactorData(result)
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error)
    }
  }

  // 启用/禁用两步验证
  const toggleTwoFactor = async (action: 'enable' | 'disable') => {
    if (!twoFactorToken) {
      alert('请输入验证码')
      return
    }

    setLoading(true)
    try {
      // 获取CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfResponse.json()

      const response = await fetch('/api/auth/two-factor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          token: twoFactorToken,
          action: action
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      alert(result.message)
      setShowTwoFactorModal(false)
      setTwoFactorToken('')
      await fetchTwoFactorStatus()
    } catch (error: any) {
      alert(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除账户
  const handleDeleteAccount = async () => {
    if (deleteData.confirmText !== 'DELETE') {
      alert('请输入 DELETE 确认删除')
      return
    }

    if (!deleteData.password) {
      alert('请输入密码')
      return
    }

    setLoading(true)
    try {
      // 获取CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfResponse.json()

      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(deleteData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      alert(result.message)
      // 登出用户
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error: any) {
      alert(error.message || '删除失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件加载时获取两步验证状态
  useEffect(() => {
    fetchTwoFactorStatus()
  }, [])

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
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    修改密码
                  </button>
                </div>

                <div className="p-4 bg-neutral-700/30 border border-neutral-600 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-2">两步验证</h3>
                  <p className="text-neutral-400 mb-4">为您的账户添加额外的安全保护</p>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowTwoFactorModal(true)}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                        twoFactorData.enabled 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {twoFactorData.enabled ? '禁用两步验证' : '启用两步验证'}
                    </button>
                    {twoFactorData.enabled && (
                      <span className="text-green-400 text-sm">✓ 已启用</span>
                    )}
                  </div>
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

      {/* 修改密码模态框 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-6">修改密码</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  当前密码
                </label>
                <div className="relative">
                  <input
                    type={showPasswordFields ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入当前密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPasswordFields ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  新密码
                </label>
                <input
                  type={showPasswordFields ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码（至少8位）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  确认新密码
                </label>
                <input
                  type={showPasswordFields ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={changePassword}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? '修改中...' : '确认修改'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 两步验证模态框 */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {twoFactorData.enabled ? '禁用两步验证' : '启用两步验证'}
            </h3>
            
            {!twoFactorData.enabled && twoFactorData.qrCode && (
              <div className="mb-6">
                <p className="text-neutral-400 mb-4">
                  使用身份验证器应用（如Google Authenticator、Authy等）扫描下方二维码：
                </p>
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <img src={twoFactorData.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                {twoFactorData.manual_entry_key && (
                  <div className="mt-4">
                    <p className="text-neutral-400 text-sm mb-2">手动输入密钥：</p>
                    <p className="bg-neutral-700 p-2 rounded text-white text-sm font-mono break-all">
                      {twoFactorData.manual_entry_key}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                验证码
              </label>
              <input
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-wider"
                placeholder="000000"
                maxLength={6}
              />
              <p className="text-neutral-400 text-sm mt-2">
                请输入身份验证器应用中显示的6位验证码
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowTwoFactorModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => toggleTwoFactor(twoFactorData.enabled ? 'disable' : 'enable')}
                disabled={loading || twoFactorToken.length !== 6}
                className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors disabled:opacity-50 ${
                  twoFactorData.enabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading 
                  ? '处理中...' 
                  : twoFactorData.enabled 
                    ? '禁用' 
                    : '启用'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    输入您的密码
                  </label>
                  <input
                    type="password"
                    value={deleteData.password}
                    onChange={(e) => setDeleteData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="请输入密码"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    输入 "DELETE" 确认删除
                  </label>
                  <input
                    type="text"
                    value={deleteData.confirmText}
                    onChange={(e) => setDeleteData(prev => ({ ...prev, confirmText: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="DELETE"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || deleteData.confirmText !== 'DELETE' || !deleteData.password}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? '删除中...' : '确认删除'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
