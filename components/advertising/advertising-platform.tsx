"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Target, 
  BarChart3, 
  DollarSign, 
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Settings,
  Play,
  Pause,
  Edit,
  Copy,
  Download,
  Filter,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Image,
  Video
} from "lucide-react"
import { 
  adPlacements, 
  AdPlatform,
  type AdCampaign,
  type AdPlacement,
  type Advertiser
} from "@/lib/advertising"

export default function AdvertisingPlatform() {
  const [activeTab, setActiveTab] = useState<'placements' | 'campaigns' | 'analytics' | 'account'>('placements')
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null)
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [isAdvertiser, setIsAdvertiser] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)

  // 模拟广告主状态
  const [advertiserInfo] = useState<Advertiser>({
    id: 'advertiser-123',
    userId: 'user-123',
    companyName: '创新科技有限公司',
    industry: '软件开发',
    website: 'https://example.com',
    contactEmail: 'ads@example.com',
    phone: '13800138000',
    status: 'approved',
    spendTier: 'growth',
    totalSpend: 25600,
    monthlySpend: 8900,
    createdAt: '2024-10-01T00:00:00Z',
    verificationStatus: 'verified',
    billingInfo: {
      method: 'credit_card',
      autoRecharge: true,
      threshold: 1000
    }
  })

  useEffect(() => {
    if (isAdvertiser) {
      AdPlatform.getAdvertiserCampaigns('advertiser-123').then(setCampaigns)
    }
  }, [isAdvertiser])

  const handleCreateAdvertiser = async () => {
    const newAdvertiser = await AdPlatform.createAdvertiser({
      userId: 'user-123',
      companyName: '我的公司',
      industry: '科技',
      website: 'https://mycompany.com',
      contactEmail: 'me@mycompany.com',
      phone: '13800138000',
      status: 'pending',
      verificationStatus: 'pending',
      billingInfo: {
        method: 'credit_card',
        autoRecharge: false,
        threshold: 500
      }
    })
    setIsAdvertiser(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'paused': return 'text-yellow-400 bg-yellow-500/20'
      case 'pending': return 'text-blue-400 bg-blue-500/20'
      case 'completed': return 'text-gray-400 bg-gray-500/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-neutral-400 bg-neutral-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '投放中'
      case 'paused': return '已暂停'
      case 'pending': return '待审核'
      case 'completed': return '已完成'
      case 'rejected': return '被拒绝'
      default: return '草稿'
    }
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
            广告投放平台
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            精准触达目标用户，高效转化营销投入。自助投放，实时优化，数据透明
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab('placements')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'placements' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              广告位
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'campaigns' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              活动管理
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              数据分析
            </button>
            {isAdvertiser && (
              <button
                onClick={() => setActiveTab('account')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'account' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                账户管理
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 广告位展示页面 */}
      {activeTab === 'placements' && (
        <div>
          {/* 平台概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, title: "日活跃用户", value: "10万+", color: "text-blue-400" },
              { icon: Eye, title: "日曝光量", value: "500万+", color: "text-green-400" },
              { icon: MousePointer, title: "平均CTR", value: "3.2%", color: "text-purple-400" },
              { icon: TrendingUp, title: "转化率", value: "6.5%", color: "text-yellow-400" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-6 text-center"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-neutral-400 text-sm">{stat.title}</div>
              </motion.div>
            ))}
          </div>

          {/* 广告位列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {adPlacements.map((placement, index) => (
              <motion.div
                key={placement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {/* 广告位头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{placement.name}</h3>
                    <p className="text-neutral-400 mb-3">{placement.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Monitor className="w-3 h-3" />
                        <span>{placement.dimensions.width}×{placement.dimensions.height}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{(placement.pricing.monthlyImpressions / 10000).toFixed(0)}万/月</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    placement.availability > 0.8 ? 'bg-green-500/20 text-green-400' :
                    placement.availability > 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {Math.round(placement.availability * 100)}% 可用
                  </div>
                </div>

                {/* 定价信息 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <div className="text-neutral-400 text-sm mb-1">CPM</div>
                    <div className="text-2xl font-bold text-blue-400">¥{placement.pricing.cpm}</div>
                  </div>
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <div className="text-neutral-400 text-sm mb-1">CPC</div>
                    <div className="text-2xl font-bold text-green-400">¥{placement.pricing.cpc}</div>
                  </div>
                </div>

                {/* 受众数据 */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">受众特征:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400 mb-1">平均年龄</div>
                      <div className="text-white">{placement.demographics.averageAge}岁</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 mb-1">平均CTR</div>
                      <div className="text-white">{placement.performance.averageCTR}%</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-neutral-400 mb-2">热门兴趣:</div>
                    <div className="flex flex-wrap gap-1">
                      {placement.demographics.topInterests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedPlacement(placement)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    查看详情
                  </button>
                  {isAdvertiser && (
                    <button
                      onClick={() => setShowCreateCampaign(true)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      立即投放
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* 开始投放CTA */}
          {!isAdvertiser && (
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">开始您的广告投放之旅</h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                注册成为广告主，享受专业的投放服务和数据分析支持
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-6">
                  <Target className="w-8 h-8 text-white mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">精准定向</h3>
                  <p className="text-blue-100 text-sm">多维度用户定向</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <BarChart3 className="w-8 h-8 text-white mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">实时数据</h3>
                  <p className="text-blue-100 text-sm">透明的投放效果</p>
                </div>
                <div className="bg-white/10 rounded-xl p-6">
                  <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">灵活计费</h3>
                  <p className="text-blue-100 text-sm">按效果付费</p>
                </div>
              </div>

              <button 
                onClick={handleCreateAdvertiser}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                立即注册成为广告主
              </button>
            </div>
          )}
        </div>
      )}

      {/* 活动管理页面 */}
      {activeTab === 'campaigns' && (
        <div>
          {!isAdvertiser ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">需要先注册成为广告主</h3>
              <p className="text-neutral-400 mb-6">注册后即可创建和管理广告活动</p>
              <button
                onClick={handleCreateAdvertiser}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                立即注册
              </button>
            </div>
          ) : (
            <div>
              {/* 活动管理头部 */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">广告活动管理</h2>
                  <p className="text-neutral-400">创建、编辑和监控您的广告活动</p>
                </div>
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>创建活动</span>
                </button>
              </div>

              {/* 活动概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">总花费</h3>
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">¥{advertiserInfo.monthlySpend.toLocaleString()}</div>
                  <p className="text-green-400 text-sm">本月消费</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">活跃活动</h3>
                    <Play className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</div>
                  <p className="text-blue-400 text-sm">正在投放</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">总点击</h3>
                    <MousePointer className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0).toLocaleString()}
                  </div>
                  <p className="text-purple-400 text-sm">累计点击</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">平均CTR</h3>
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {campaigns.length > 0 ? 
                      (campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length).toFixed(1) + '%' : 
                      '0%'
                    }
                  </div>
                  <p className="text-yellow-400 text-sm">点击率</p>
                </div>
              </div>

              {/* 活动列表 */}
              <div className="space-y-6">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {getStatusText(campaign.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-neutral-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span>{campaign.type === 'banner' ? '横幅广告' : '其他'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {campaign.status === 'active' ? (
                          <button className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 活动数据 */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-white">{campaign.metrics.impressions.toLocaleString()}</div>
                        <div className="text-neutral-400 text-xs">曝光量</div>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{campaign.metrics.clicks.toLocaleString()}</div>
                        <div className="text-neutral-400 text-xs">点击量</div>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{campaign.metrics.ctr.toFixed(1)}%</div>
                        <div className="text-neutral-400 text-xs">点击率</div>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">¥{campaign.metrics.cpc.toFixed(1)}</div>
                        <div className="text-neutral-400 text-xs">CPC</div>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-400">{campaign.metrics.conversions}</div>
                        <div className="text-neutral-400 text-xs">转化量</div>
                      </div>
                      <div className="bg-neutral-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-400">¥{campaign.metrics.spend.toLocaleString()}</div>
                        <div className="text-neutral-400 text-xs">花费</div>
                      </div>
                    </div>

                    {/* 预算进度 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-neutral-400 text-sm">预算使用</span>
                        <span className="text-white text-sm">
                          ¥{campaign.budget.spent} / ¥{campaign.budget.amount}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.budget.spent / campaign.budget.amount) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      查看详细报告
                    </button>
                  </motion.div>
                ))}

                {campaigns.length === 0 && (
                  <div className="text-center py-16">
                    <Target className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">还没有广告活动</h3>
                    <p className="text-neutral-400 mb-6">创建您的第一个广告活动开始投放</p>
                    <button
                      onClick={() => setShowCreateCampaign(true)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      创建活动
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 数据分析页面 */}
      {activeTab === 'analytics' && (
        <div>
          {!isAdvertiser ? (
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">需要广告主账户</h3>
              <p className="text-neutral-400 mb-6">注册成为广告主后查看详细的投放数据分析</p>
              <button
                onClick={handleCreateAdvertiser}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                立即注册
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">数据分析中心</h2>
              
              {/* 分析概览 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
                  <h3 className="text-lg font-semibold mb-2">投放ROI</h3>
                  <div className="text-4xl font-bold mb-2">
                    {campaigns.length > 0 ? 
                      ((campaigns.reduce((sum, c) => sum + c.metrics.conversions * 50, 0) / 
                        campaigns.reduce((sum, c) => sum + c.metrics.spend, 0)) * 100).toFixed(0) + '%' : 
                      '0%'
                    }
                  </div>
                  <p className="text-blue-100">投资回报率</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
                  <h3 className="text-lg font-semibold mb-2">转化成本</h3>
                  <div className="text-4xl font-bold mb-2">
                    ¥{campaigns.length > 0 ? 
                      (campaigns.reduce((sum, c) => sum + c.metrics.spend, 0) / 
                       campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0) || 0).toFixed(0) : 
                      '0'
                    }
                  </div>
                  <p className="text-green-100">平均CPA</p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                  <h3 className="text-lg font-semibold mb-2">广告覆盖</h3>
                  <div className="text-4xl font-bold mb-2">
                    {campaigns.reduce((sum, c) => sum + c.metrics.reach, 0).toLocaleString()}
                  </div>
                  <p className="text-purple-100">触达用户</p>
                </div>
              </div>

              {/* 详细分析图表占位 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-neutral-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">投放趋势</h3>
                  <div className="h-64 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-400">投放数据图表</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">受众分析</h3>
                  <div className="h-64 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                      <p className="text-neutral-400">受众分布图表</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 账户管理页面 */}
      {activeTab === 'account' && isAdvertiser && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-8">账户管理</h2>
          
          {/* 账户信息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-neutral-900 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-neutral-400 text-sm">公司名称</label>
                  <div className="text-white font-medium">{advertiserInfo.companyName}</div>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">行业</label>
                  <div className="text-white font-medium">{advertiserInfo.industry}</div>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">官网</label>
                  <div className="text-blue-400">{advertiserInfo.website}</div>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">联系邮箱</label>
                  <div className="text-white font-medium">{advertiserInfo.contactEmail}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">已认证</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">账户统计</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">账户等级</span>
                  <span className="text-blue-400 font-semibold">
                    {advertiserInfo.spendTier === 'growth' ? '成长版' : '企业版'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">累计消费</span>
                  <span className="text-white font-semibold">¥{advertiserInfo.totalSpend.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">本月消费</span>
                  <span className="text-white font-semibold">¥{advertiserInfo.monthlySpend.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">支付方式</span>
                  <span className="text-white font-medium">
                    {advertiserInfo.billingInfo.method === 'credit_card' ? '信用卡' : '其他'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">自动充值</span>
                  <span className={`text-sm ${advertiserInfo.billingInfo.autoRecharge ? 'text-green-400' : 'text-neutral-400'}`}>
                    {advertiserInfo.billingInfo.autoRecharge ? '已开启' : '已关闭'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 广告位详情弹窗 */}
      {selectedPlacement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedPlacement.name}</h2>
                <button
                  onClick={() => setSelectedPlacement(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-white font-semibold mb-4">广告位信息</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">尺寸</span>
                      <span className="text-white">{selectedPlacement.dimensions.width} × {selectedPlacement.dimensions.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">类型</span>
                      <span className="text-white">{selectedPlacement.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">月曝光量</span>
                      <span className="text-white">{(selectedPlacement.pricing.monthlyImpressions / 10000).toFixed(0)}万</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">可用率</span>
                      <span className="text-green-400">{Math.round(selectedPlacement.availability * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">性能数据</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">平均CTR</span>
                      <span className="text-white">{selectedPlacement.performance.averageCTR}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">可见率</span>
                      <span className="text-white">{selectedPlacement.performance.averageViewability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">平均停留</span>
                      <span className="text-white">{selectedPlacement.performance.averageTime}秒</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 受众特征 */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-4">受众特征</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-neutral-400 mb-2">兴趣标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlacement.demographics.topInterests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-neutral-400 mb-2">地理分布</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlacement.demographics.topLocations.map((location, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 投放按钮 */}
              {isAdvertiser && (
                <div className="flex space-x-4">
                  <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    预估投放效果
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedPlacement(null)
                      setShowCreateCampaign(true)
                    }}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    创建投放活动
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 创建活动弹窗 */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">创建广告活动</h2>
                <button
                  onClick={() => setShowCreateCampaign(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">活动名称</label>
                  <input
                    type="text"
                    placeholder="输入活动名称"
                    className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">投放目标</label>
                  <select className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none">
                    <option value="conversions">提升转化</option>
                    <option value="traffic">增加流量</option>
                    <option value="brand_awareness">品牌曝光</option>
                    <option value="engagement">提升互动</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">日预算</label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">出价方式</label>
                    <select className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none">
                      <option value="cpc">按点击付费 (CPC)</option>
                      <option value="cpm">按展示付费 (CPM)</option>
                      <option value="cpa">按转化付费 (CPA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">投放时间</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="date"
                      className="p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateCampaign(false)}
                    className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    创建活动
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
