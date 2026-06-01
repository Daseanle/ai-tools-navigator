"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  PenTool, 
  Users, 
  TrendingUp, 
  DollarSign,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Star,
  Crown,
  Gift,
  Play,
  Eye,
  ThumbsUp,
  Award,
  Calendar,
  Tag,
  Filter,
  Search,
  Plus,
  CheckCircle,
  Lock,
  Zap
} from "lucide-react"
import { 
  mockCommunityPosts, 
  communityCategories, 
  creatorPrograms,
  CommunityManager,
  type CommunityPost,
  type CreatorProgram
} from "@/lib/community"

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState<'explore' | 'create' | 'earnings'>('explore')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<CreatorProgram | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [creatorStats, setCreatorStats] = useState<any>(null)

  // 模拟创作者状态
  const [userCreatorStatus] = useState({
    tier: 'silver',
    earnings: 5240,
    followers: 1580,
    totalViews: 45600,
    revenueShare: 0.7
  })

  useEffect(() => {
    if (isCreator) {
      CommunityManager.getCreatorStats('user-123').then(setCreatorStats)
    }
  }, [isCreator])

  const filteredPosts = mockCommunityPosts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handlePurchaseContent = async (postId: string) => {
    const result = await CommunityManager.purchaseContent('user-123', postId)
    if (result.success) {
      // 更新UI显示已购买
      console.log('Content purchased successfully')
    }
  }

  const handleSendTip = async (postId: string, authorId: string, amount: number) => {
    const tip = await CommunityManager.sendTip('user-123', authorId, amount, postId)
    console.log('Tip sent:', tip)
  }

  const handleApplyCreatorProgram = async (programId: string) => {
    const result = await CommunityManager.applyCreatorProgram('user-123', programId, {
      portfolio: ['作品1', '作品2'],
      experience: '3年AI工具使用经验',
      contentPlan: '每周发布2-3篇高质量教程'
    })
    
    if (result.success) {
      setIsCreator(true)
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
            AI社区
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            分享知识，创造价值。加入创作者计划，让您的专业知识变现
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'explore' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              发现内容
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'create' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4 inline mr-2" />
              创作者中心
            </button>
            {isCreator && (
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'earnings' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                收益分析
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 发现内容页面 */}
      {activeTab === 'explore' && (
        <div>
          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, title: "活跃创作者", value: "500+", color: "text-blue-400" },
              { icon: PenTool, title: "优质内容", value: "2000+", color: "text-green-400" },
              { icon: TrendingUp, title: "月浏览量", value: "50万+", color: "text-purple-400" },
              { icon: DollarSign, title: "创作者收益", value: "¥100万+", color: "text-yellow-400" }
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

          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索内容、标签、作者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-neutral-900 text-white rounded-xl border border-neutral-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">所有分类</option>
              {communityCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* 内容列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {/* 内容头部 */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {post.author.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{post.author.displayName}</span>
                          {post.author.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.author.level === 'expert' ? 'bg-purple-500/20 text-purple-400' :
                            post.author.level === 'contributor' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {post.author.level === 'expert' ? '专家' :
                             post.author.level === 'contributor' ? '贡献者' : '会员'}
                          </span>
                        </div>
                        <div className="text-neutral-400 text-sm">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {post.featured && (
                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>精选</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-neutral-400 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 统计数据 */}
                  <div className="flex items-center justify-between text-sm text-neutral-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.engagement.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{post.engagement.rating}</span>
                      </div>
                    </div>
                    
                    {post.isPremium && (
                      <div className="flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400">付费内容</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 定价信息 */}
                {post.monetization.enabled && (
                  <div className="px-6 pb-4">
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          {post.monetization.type === 'paid' ? (
                            <div className="text-2xl font-bold text-green-400">
                              ¥{post.monetization.price}
                            </div>
                          ) : post.monetization.type === 'tip_based' ? (
                            <div className="text-green-400 font-semibold">
                              支持打赏
                            </div>
                          ) : (
                            <div className="text-blue-400 font-semibold">
                              订阅可看
                            </div>
                          )}
                          <div className="text-neutral-400 text-sm">
                            已有 {post.monetization.purchaseCount} 人购买
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {post.monetization.type === 'paid' ? (
                            <button
                              onClick={() => handlePurchaseContent(post.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                              立即购买
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendTip(post.id, post.authorId, 10)}
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-1"
                            >
                              <Gift className="w-4 h-4" />
                              <span>打赏</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 互动按钮 */}
                <div className="px-6 py-4 bg-neutral-950 flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-neutral-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>点赞</span>
                    </button>
                    <button className="flex items-center space-x-1 text-neutral-400 hover:text-blue-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span>评论</span>
                    </button>
                    <button className="flex items-center space-x-1 text-neutral-400 hover:text-green-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>分享</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 text-neutral-400 hover:text-yellow-400 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span>收藏</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 创作者中心页面 */}
      {activeTab === 'create' && (
        <div>
          {!isCreator ? (
            /* 创作者计划申请 */
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">成为创作者，知识变现</h2>
                <p className="text-purple-100 mb-8">
                  分享您的专业知识，获得丰厚收益。我们提供完善的创作者支持体系和优厚的分成比例。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-xl p-6">
                    <DollarSign className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">高收益分成</h3>
                    <p className="text-purple-100 text-sm">60%-80%收益分成</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">流量扶持</h3>
                    <p className="text-purple-100 text-sm">官方推荐和曝光</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-6">
                    <Award className="w-8 h-8 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">专业认证</h3>
                    <p className="text-purple-100 text-sm">权威身份标识</p>
                  </div>
                </div>
              </div>

              {/* 创作者计划 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {creatorPrograms.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-neutral-900 rounded-2xl p-8 border-2 transition-all duration-300 ${
                      program.id === 'silver-creator' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    {program.id === 'silver-creator' && (
                      <div className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full text-sm mb-4">
                        <Crown className="w-3 h-3 mr-1" />
                        推荐
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{program.name}</h3>
                      <p className="text-neutral-400 mb-4">{program.description}</p>
                      
                      <div className="text-3xl font-bold text-green-400 mb-2">
                        {Math.round(program.benefits.revenueShare * 100)}%
                      </div>
                      <div className="text-neutral-400 text-sm">收益分成</div>
                    </div>

                    {/* 要求 */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">申请要求:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-neutral-300">
                            {program.requirements.minFollowers} 粉丝以上
                          </span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-neutral-300">
                            {program.requirements.minContentCount} 篇优质内容
                          </span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="text-neutral-300">
                            评分 {program.requirements.minRating} 分以上
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* 福利 */}
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">专属福利:</h4>
                      <ul className="space-y-1 text-sm">
                        {program.benefits.exclusiveFeatures.map((feature, idx) => (
                          <li key={idx} className="text-blue-400">• {feature}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 费用 */}
                    <div className="mb-6 text-center">
                      {program.applicationFee > 0 ? (
                        <div>
                          <div className="text-2xl font-bold text-white">
                            ¥{program.applicationFee}
                          </div>
                          <div className="text-neutral-400 text-sm">申请费</div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-400">
                          免费申请
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleApplyCreatorProgram(program.id)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      立即申请
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* 创作者仪表板 */
            <div>
              {/* 创作者状态 */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      欢迎回来，创作者！
                    </h2>
                    <p className="text-green-100">
                      当前等级: <span className="font-semibold">{userCreatorStatus.tier === 'silver' ? '白银创作者' : '黄金创作者'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      ¥{userCreatorStatus.earnings.toLocaleString()}
                    </div>
                    <div className="text-green-100">总收益</div>
                  </div>
                </div>
              </div>

              {/* 快速统计 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">本月收益</h3>
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">¥{(userCreatorStatus.earnings * 0.3).toLocaleString()}</div>
                  <p className="text-green-400 text-sm">+15% 环比上月</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">粉丝数量</h3>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{userCreatorStatus.followers.toLocaleString()}</div>
                  <p className="text-blue-400 text-sm">+8% 本月新增</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">总浏览量</h3>
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{userCreatorStatus.totalViews.toLocaleString()}</div>
                  <p className="text-purple-400 text-sm">全部内容累计</p>
                </div>
                
                <div className="bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-neutral-400">收益分成</h3>
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{Math.round(userCreatorStatus.revenueShare * 100)}%</div>
                  <p className="text-yellow-400 text-sm">当前分成比例</p>
                </div>
              </div>

              {/* 创作工具 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-neutral-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">快速创作</h3>
                  <div className="space-y-4">
                    <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex items-center space-x-3">
                      <PenTool className="w-5 h-5" />
                      <span>发布新教程</span>
                    </button>
                    <button className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center space-x-3">
                      <Star className="w-5 h-5" />
                      <span>写产品评测</span>
                    </button>
                    <button className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center space-x-3">
                      <Play className="w-5 h-5" />
                      <span>分享作品展示</span>
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-900 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">热门内容</h3>
                  <div className="space-y-4">
                    {mockCommunityPosts.slice(0, 3).map((post, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div>
                          <div className="text-white font-medium text-sm line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-neutral-400 text-xs">
                            {post.engagement.views} 浏览 • ¥{post.monetization.totalEarnings} 收益
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 收益分析页面 */}
      {activeTab === 'earnings' && isCreator && creatorStats && (
        <div>
          {/* 收益概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-2">总收益</h3>
              <div className="text-4xl font-bold mb-2">¥{creatorStats.totalEarnings.toLocaleString()}</div>
              <p className="text-green-100">累计收入</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-2">本月收益</h3>
              <div className="text-4xl font-bold mb-2">¥{creatorStats.monthlyEarnings.toLocaleString()}</div>
              <p className="text-blue-100">+25% 环比增长</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-2">平均单价</h3>
              <div className="text-4xl font-bold mb-2">¥{Math.round(creatorStats.totalEarnings / creatorStats.totalViews * 1000)}</div>
              <p className="text-purple-100">每千次浏览</p>
            </div>
          </div>

          {/* 详细分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-neutral-900 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">收益构成</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-white">付费内容</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">¥3,420</div>
                    <div className="text-neutral-400 text-sm">65%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-white">打赏收入</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">¥1,230</div>
                    <div className="text-neutral-400 text-sm">23%</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-white">订阅收入</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">¥590</div>
                    <div className="text-neutral-400 text-sm">12%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">热门作品</h3>
              <div className="space-y-4">
                {creatorStats.topPosts.map((post: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                    <div>
                      <div className="text-white font-medium text-sm line-clamp-1">
                        {post.title}
                      </div>
                      <div className="text-neutral-400 text-xs">
                        {post.engagement.views} 浏览 • {post.engagement.likes} 点赞
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        ¥{post.monetization.totalEarnings}
                      </div>
                      <div className="text-neutral-400 text-xs">收益</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 内容详情弹窗 */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 作者信息 */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-neutral-800 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedPost.author.displayName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{selectedPost.author.displayName}</span>
                    {selectedPost.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="text-neutral-400 text-sm">
                    声望: {selectedPost.author.reputation} • 
                    {selectedPost.author.badges.join(', ')}
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  关注
                </button>
              </div>

              {/* 内容正文 */}
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-neutral-300 leading-relaxed">
                  {selectedPost.content}
                </p>
              </div>

              {/* 互动和购买 */}
              <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
                <div className="flex space-x-6">
                  <button className="flex items-center space-x-2 text-neutral-400 hover:text-red-400 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span>{selectedPost.engagement.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-neutral-400 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{selectedPost.engagement.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-neutral-400 hover:text-green-400 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>分享</span>
                  </button>
                </div>

                {selectedPost.monetization.enabled && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSendTip(selectedPost.id, selectedPost.authorId, 20)}
                      className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Gift className="w-4 h-4" />
                      <span>打赏 ¥20</span>
                    </button>
                    {selectedPost.monetization.type === 'paid' && (
                      <button
                        onClick={() => handlePurchaseContent(selectedPost.id)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        购买完整内容 ¥{selectedPost.monetization.price}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
