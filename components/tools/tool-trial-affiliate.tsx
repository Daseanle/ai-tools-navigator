"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Zap, 
  DollarSign, 
  Clock, 
  Shield, 
  Star,
  Play,
  Gift,
  TrendingUp,
  Users,
  ExternalLink,
  Copy,
  CheckCircle,
  Timer,
  CreditCard,
  BarChart3
} from "lucide-react"
import { affiliatePrograms, trialOffers, affiliateTiers, AffiliateSystem, TrialSystem } from "@/lib/affiliate"

export default function ToolTrialAffiliate() {
  const [activeTab, setActiveTab] = useState<'trials' | 'affiliate'>('trials')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [affiliateStats, setAffiliateStats] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // 用户分销状态
  const [isAffiliate, setIsAffiliate] = useState(false)
  const [affiliateId, setAffiliateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 检查用户是否已经是分销伙伴
    const checkAffiliateStatus = async () => {
      try {
        const response = await fetch('/api/affiliate?userId=user-123') // 实际应该从用户context获取
        const result = await response.json()
        
        if (result.success && result.partner) {
          setIsAffiliate(true)
          setAffiliateId(result.partner.id)
          setAffiliateStats({
            totalEarnings: result.partner.total_earnings,
            pendingAmount: result.partner.monthlyEarnings,
            paidAmount: result.partner.total_earnings - result.partner.monthlyEarnings,
            transactions: result.partner.recentEarnings || []
          })
        }
      } catch (error) {
        console.error('Check affiliate status error:', error)
      }
    }
    
    checkAffiliateStatus()
  }, [])

  const handleStartTrial = async (offerId: string) => {
    try {
      // 调用真实的试用API
      const response = await fetch('/api/trials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123', // 实际应该从用户context获取
          offerId,
          affiliateId: new URLSearchParams(window.location.search).get('ref') || undefined
        })
      })

      const result = await response.json()
      
      if (result.success && result.redirectUrl) {
        // 显示成功消息
        alert(result.message || '试用已开始，即将跳转到工具页面')
        // 跳转到工具页面
        window.open(result.redirectUrl, '_blank')
      } else {
        alert(result.error || '试用开始失败')
      }
    } catch (error) {
      console.error('Start trial error:', error)
      alert('试用开始失败，请稍后重试')
    }
  }

  const handleJoinAffiliate = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/affiliate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123', // 实际应该从用户context获取
          payoutMethod: 'alipay',
          payoutDetails: {
            account: 'user@example.com',
            realName: '用户姓名'
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setIsAffiliate(true)
        setAffiliateId(result.partnerId)
        alert(result.message || '成功加入分销计划')
      } else {
        alert(result.error || '加入分销计划失败')
      }
    } catch (error) {
      console.error('Join affiliate error:', error)
      alert('加入分销计划失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAffiliateLink = (toolId: string) => {
    if (!affiliateId) return
    
    const link = AffiliateSystem.generateAffiliateLink(affiliateId, toolId)
    navigator.clipboard.writeText(link)
    setCopiedLink(toolId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            AI工具试用中心
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            免费试用顶级AI工具，体验前沿技术。加入分销计划，轻松赚取佣金收入。
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab('trials')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'trials' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 inline mr-2" />
              免费试用
            </button>
            <button
              onClick={() => setActiveTab('affiliate')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'affiliate' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              分销赚钱
            </button>
          </div>
        </div>
      </div>

      {/* 试用页面 */}
      {activeTab === 'trials' && (
        <div>
          {/* 优势介绍 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Zap, title: "免费体验", desc: "无需付费即可试用", color: "text-yellow-400" },
              { icon: Timer, title: "即时开通", desc: "一键激活试用账号", color: "text-green-400" },
              { icon: Shield, title: "安全可靠", desc: "官方授权试用渠道", color: "text-blue-400" },
              { icon: Gift, title: "专属优惠", desc: "独家折扣和延长试用", color: "text-purple-400" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-6 text-center"
              >
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3`} />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 试用列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {trialOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {/* 工具头部 */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {affiliatePrograms.find(p => p.toolId === offer.toolId)?.toolName}
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      {affiliatePrograms.find(p => p.toolId === offer.toolId)?.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    {offer.type === 'free_trial' && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        免费试用
                      </span>
                    )}
                    {offer.type === 'discount' && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {Math.round((1 - offer.value) * 100)}% 折扣
                      </span>
                    )}
                    {offer.type === 'extended_trial' && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        延长试用
                      </span>
                    )}
                  </div>
                </div>

                {/* 价格信息 */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    {offer.type === 'discount' ? (
                      <>
                        <span className="text-2xl font-bold text-white">
                          ¥{offer.discountedPrice}
                        </span>
                        <span className="text-lg text-neutral-500 line-through">
                          ¥{offer.originalPrice}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-green-400">
                          免费
                        </span>
                        <span className="text-neutral-400 text-sm">
                          {offer.duration}天试用
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-neutral-400 text-sm mt-1">
                    原价 ¥{offer.originalPrice}/月
                  </p>
                </div>

                {/* 功能列表 */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">试用包含：</h4>
                  <ul className="space-y-2">
                    {offer.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-neutral-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 限制条件 */}
                {offer.limitations && (
                  <div className="mb-6">
                    <h4 className="text-orange-400 font-semibold mb-2 text-sm">试用限制：</h4>
                    <ul className="space-y-1">
                      {offer.limitations.map((limitation, idx) => (
                        <li key={idx} className="text-neutral-400 text-xs">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 试用条件 */}
                <div className="flex items-center space-x-4 mb-6 text-xs text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <CreditCard className="w-3 h-3" />
                    <span>{offer.requiresCreditCard ? '需要绑卡' : '无需绑卡'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{offer.autoRenewal ? '自动续费' : '不自动续费'}</span>
                  </div>
                </div>

                {/* 开始试用按钮 */}
                <button
                  onClick={() => handleStartTrial(offer.id)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  立即开始试用
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 分销页面 */}
      {activeTab === 'affiliate' && (
        <div>
          {!isAffiliate ? (
            /* 加入分销计划 */
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">成为我们的合作伙伴</h2>
                <p className="text-blue-100 mb-8">
                  推广AI工具，获得丰厚佣金。每成功推荐一位用户，即可获得最高25%的佣金分成。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-xl p-6">
                    <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">高额佣金</h3>
                    <p className="text-blue-100 text-sm">12%-25%佣金比例</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <BarChart3 className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">实时统计</h3>
                    <p className="text-blue-100 text-sm">完整的数据看板</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <Users className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">专业支持</h3>
                    <p className="text-blue-100 text-sm">营销素材和培训</p>
                  </div>
                </div>

                <button 
                  onClick={handleJoinAffiliate}
                  disabled={isLoading}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '处理中...' : '立即加入分销计划'}
                </button>
              </div>

              {/* 分销层级说明 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(affiliateTiers).map(([key, tier]) => (
                  <div key={key} className="bg-neutral-900 rounded-2xl p-6 text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      key === 'bronze' ? 'bg-orange-500/20 text-orange-400' :
                      key === 'silver' ? 'bg-gray-500/20 text-gray-400' :
                      key === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{tier.name}</h3>
                    <p className="text-neutral-400 text-sm mb-3">
                      月收入 ¥{tier.minEarnings.toLocaleString()}+
                    </p>
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <p key={idx} className="text-neutral-400 text-xs">{benefit}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 分销仪表板 */
            <div>
              {/* 统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">本月收入</h3>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">¥{affiliateStats?.totalEarnings || 0}</div>
                  <p className="text-green-400 text-sm">+25% 环比上月</p>
                </div>
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">待结算</h3>
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">¥{affiliateStats?.pendingAmount || 0}</div>
                  <p className="text-neutral-400 text-sm">下月15日结算</p>
                </div>
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">点击转化率</h3>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">12.5%</div>
                  <p className="text-blue-400 text-sm">高于平均水平</p>
                </div>
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">合伙人等级</h3>
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">白银</div>
                  <p className="text-purple-400 text-sm">+5% 额外奖励</p>
                </div>
              </div>

              {/* 分销链接生成 */}
              <div className="bg-neutral-900 rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-white mb-6">推广链接生成器</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {affiliatePrograms.filter(p => p.isActive).map((program) => (
                    <div key={program.id} className="border border-neutral-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold">{program.toolName}</h4>
                          <p className="text-neutral-400 text-sm">{program.provider}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            {Math.round(program.commissionRate * 100)}%
                          </div>
                          <div className="text-neutral-400 text-xs">佣金</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCopyAffiliateLink(program.toolId)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          {copiedLink === program.toolId ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>复制链接</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
