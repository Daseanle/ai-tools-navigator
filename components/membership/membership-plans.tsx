"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Star, Zap, Crown, Users, ArrowRight } from "lucide-react"
import { membershipPlans, type MembershipTier, type BillingCycle, MembershipService } from "@/lib/membership"

interface MembershipPlansProps {
  currentTier?: MembershipTier
  onSelectPlan?: (planId: string, billing: BillingCycle) => void
}

export default function MembershipPlans({ currentTier = 'free', onSelectPlan }: MembershipPlansProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')
  
  const getTierIcon = (tier: MembershipTier) => {
    switch (tier) {
      case 'free': return '🆓'
      case 'experience': return '⭐'
      case 'industry': return '👑'
      case 'team': return '🏢'
      default: return '📦'
    }
  }
  
  const getTierColor = (tier: MembershipTier) => {
    switch (tier) {
      case 'free': return 'gray'
      case 'experience': return 'blue'
      case 'industry': return 'purple'
      case 'team': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">选择适合您的会员计划</h1>
        <p className="text-xl text-neutral-400 mb-8">透明定价，无隐藏费用，随时可以取消</p>
        
        {/* 计费周期切换 */}
        <div className="inline-flex items-center p-1 bg-neutral-800 rounded-xl">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            按月付费
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white text-neutral-900'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            按年付费
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              节省{MembershipService.calculateSavings('experience')}%
            </span>
          </button>
        </div>
      </div>

      {/* 会员计划卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {membershipPlans.map((plan, index) => {
          const isCurrentPlan = plan.tier === currentTier
          const color = getTierColor(plan.tier)
          const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly
          const monthlyPrice = billingCycle === 'yearly' ? plan.price.yearly / 12 : plan.price.monthly
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-neutral-900 rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : isCurrentPlan
                    ? 'border-green-500 shadow-lg shadow-green-500/20'
                    : 'border-neutral-700 hover:border-neutral-600'
              }`}
            >
              {/* 推荐标签 */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    推荐选择
                  </span>
                </div>
              )}
              
              {/* 当前计划标签 */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    当前计划
                  </span>
                </div>
              )}

              {/* 计划图标和名称 */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">{getTierIcon(plan.tier)}</div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-neutral-400 text-sm">{plan.description}</p>
              </div>

              {/* 价格 */}
              <div className="text-center mb-6">
                {price === 0 ? (
                  <div className="text-3xl font-bold text-white">免费</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-white">
                      ¥{Math.round(monthlyPrice)}
                      <span className="text-lg font-normal text-neutral-400">/月</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-neutral-400">
                        年付 ¥{price} (节省 {MembershipService.calculateSavings(plan.tier)}%)
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 功能列表 */}
              <div className="space-y-3 mb-8">
                {plan.features.slice(0, 6).map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">{feature.name}</span>
                  </div>
                ))}
                {plan.features.length > 6 && (
                  <div className="text-neutral-400 text-xs">
                    还有 {plan.features.length - 6} 项功能...
                  </div>
                )}
              </div>

              {/* 限制信息 */}
              <div className="space-y-2 mb-6 text-xs text-neutral-500">
                <div>收藏: {plan.limits.toolsBookmarks === 'unlimited' ? '无限制' : `${plan.limits.toolsBookmarks} 个`}</div>
                <div>Prompt下载: {plan.limits.promptDownloads === 'unlimited' ? '无限制' : `${plan.limits.promptDownloads} 次/月`}</div>
                <div>团队成员: {plan.limits.teamMembers === 'unlimited' ? '无限制' : `${plan.limits.teamMembers} 人`}</div>
              </div>

              {/* 选择按钮 */}
              <button
                onClick={() => onSelectPlan?.(plan.id, billingCycle)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isCurrentPlan
                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                {isCurrentPlan ? '当前计划' : plan.tier === 'free' ? '免费使用' : '立即订阅'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* 功能对比表 */}
      <div className="bg-neutral-900 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">详细功能对比</h2>
          <p className="text-neutral-400 mt-2">了解每个计划包含的具体功能</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800">
              <tr>
                <th className="text-left p-4 text-white font-medium">功能</th>
                {membershipPlans.map(plan => (
                  <th key={plan.id} className="text-center p-4 text-white font-medium min-w-32">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 动态生成所有功能的对比行 */}
              {Array.from(new Set(membershipPlans.flatMap(p => p.features.map(f => f.id)))).map(featureId => {
                const feature = membershipPlans
                  .flatMap(p => p.features)
                  .find(f => f.id === featureId)
                
                if (!feature) return null
                
                return (
                  <tr key={featureId} className="border-b border-neutral-800">
                    <td className="p-4 text-neutral-300">{feature.name}</td>
                    {membershipPlans.map(plan => {
                      const hasFeature = plan.features.some(f => f.id === featureId && f.enabled)
                      return (
                        <td key={plan.id} className="text-center p-4">
                          {hasFeature ? (
                            <Check className="w-5 h-5 text-green-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">常见问题</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-neutral-900 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">可以随时取消吗？</h3>
            <p className="text-neutral-400 text-sm">
              是的，您可以随时取消订阅。取消后，您的会员权益将持续到当前计费周期结束。
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">支持哪些支付方式？</h3>
            <p className="text-neutral-400 text-sm">
              我们支持支付宝、微信支付、银行卡等多种支付方式，安全便捷。
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">企业用户有专属方案吗？</h3>
            <p className="text-neutral-400 text-sm">
              有的，我们为企业用户提供定制化解决方案，包括SSO、专属支持等。
            </p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-2">有试用期吗？</h3>
            <p className="text-neutral-400 text-sm">
              新用户可以免费试用高级功能7天，无需绑定信用卡。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
