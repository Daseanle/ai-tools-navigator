"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  ExternalLink, 
  Gift, 
  Clock, 
  CreditCard, 
  CheckCircle,
  DollarSign,
  Copy
} from "lucide-react"
import { trialOffers, affiliatePrograms, TrialSystem, AffiliateSystem } from "@/lib/affiliate"

interface ToolTrialWidgetProps {
  toolId: string
  toolName: string
  className?: string
}

export default function ToolTrialWidget({ toolId, toolName, className = "" }: ToolTrialWidgetProps) {
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  
  // 查找对应的试用优惠
  const trialOffer = trialOffers.find(offer => offer.toolId === toolId)
  const affiliateProgram = affiliatePrograms.find(program => program.toolId === toolId)
  
  // 模拟用户分销ID
  const affiliateId = 'affiliate-demo-123'

  if (!trialOffer) {
    return null
  }

  const handleStartTrial = async () => {
    setIsStartingTrial(true)
    try {
      const result = await TrialSystem.startTrial('user-123', trialOffer.id)
      if (result.success && result.redirectUrl) {
        window.open(result.redirectUrl, '_blank')
      }
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleCopyAffiliateLink = () => {
    if (affiliateProgram) {
      const link = AffiliateSystem.generateAffiliateLink(affiliateId, toolId)
      navigator.clipboard.writeText(link)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">
              {trialOffer.type === 'free_trial' && '免费试用'}
              {trialOffer.type === 'discount' && `${Math.round((1 - trialOffer.value) * 100)}% 折扣`}
              {trialOffer.type === 'extended_trial' && '延长试用'}
            </span>
          </div>
          <h3 className="text-white font-bold text-lg">{toolName} 专属优惠</h3>
        </div>
        
        {trialOffer.type === 'free_trial' ? (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">免费</div>
            <div className="text-neutral-400 text-sm">{trialOffer.duration}天试用</div>
          </div>
        ) : trialOffer.type === 'discount' ? (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">¥{trialOffer.discountedPrice}</div>
            <div className="text-neutral-500 line-through text-sm">¥{trialOffer.originalPrice}</div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{trialOffer.value}天</div>
            <div className="text-neutral-400 text-sm">延长试用</div>
          </div>
        )}
      </div>

      {/* 功能亮点 */}
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {trialOffer.features.slice(0, 4).map((feature, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-neutral-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 试用条件 */}
      <div className="flex items-center space-x-4 mb-6 text-xs text-neutral-400">
        <div className="flex items-center space-x-1">
          <CreditCard className="w-3 h-3" />
          <span>{trialOffer.requiresCreditCard ? '需要绑卡' : '无需绑卡'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{trialOffer.autoRenewal ? '自动续费' : '不自动续费'}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={handleStartTrial}
          disabled={isStartingTrial}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isStartingTrial ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>立即试用</span>
            </>
          )}
        </button>
        
        {affiliateProgram && (
          <button
            onClick={handleCopyAffiliateLink}
            className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors flex items-center space-x-2"
            title="复制推广链接"
          >
            {copiedLink ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <DollarSign className="w-3 h-3 text-green-400" />
              </>
            )}
          </button>
        )}
      </div>

      {/* 佣金信息 */}
      {affiliateProgram && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">推广此工具可获得 {Math.round(affiliateProgram.commissionRate * 100)}% 佣金</span>
            <span className="text-neutral-400">30天追踪</span>
          </div>
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
