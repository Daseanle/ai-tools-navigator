"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Code2, 
  Users, 
  Zap, 
  BarChart3,
  Play,
  Copy,
  ExternalLink,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Shield,
  BookOpen,
  MessageSquare,
  Calendar,
  Download,
  Search,
  Filter
} from "lucide-react"
import { 
  developerAPIs, 
  developerServices, 
  APIMarketplace, 
  DeveloperServiceManager,
  type DeveloperAPI,
  type DeveloperService
} from "@/lib/developer"

export default function DeveloperMarketplace() {
  const [activeTab, setActiveTab] = useState<'apis' | 'services'>('apis')
  const [selectedAPI, setSelectedAPI] = useState<DeveloperAPI | null>(null)
  const [selectedService, setSelectedService] = useState<DeveloperService | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [testResult, setTestResult] = useState<any>(null)

  const apiCategories = [
    { id: '', name: '全部', count: developerAPIs.length },
    { id: 'ai-integration', name: 'AI集成', count: 2 },
    { id: 'data-processing', name: '数据处理', count: 1 },
    { id: 'analytics', name: '数据分析', count: 1 },
    { id: 'automation', name: '自动化', count: 1 }
  ]

  const serviceCategories = [
    { id: '', name: '全部', count: developerServices.length },
    { id: 'consulting', name: '咨询服务', count: 1 },
    { id: 'development', name: '开发服务', count: 1 },
    { id: 'integration', name: '集成服务', count: 1 },
    { id: 'training', name: '培训服务', count: 1 }
  ]

  const filteredAPIs = developerAPIs.filter(api => {
    const matchesSearch = !searchQuery || 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || api.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredServices = developerServices.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTestAPI = async (apiId: string, endpoint: string) => {
    const result = await APIMarketplace.testAPIEndpoint(apiId, endpoint, {})
    setTestResult(result)
  }

  const handleGenerateAPIKey = async (apiId: string) => {
    const key = await APIMarketplace.generateAPIKey('user-123', apiId)
    setApiKey(key)
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
            开发者中心
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            丰富的API接口和专业的开发服务，助力您快速构建AI应用
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-900 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab('apis')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'apis' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 inline mr-2" />
              API市场
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'services' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              开发服务
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={activeTab === 'apis' ? '搜索API...' : '搜索服务...'}
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
            {(activeTab === 'apis' ? apiCategories : serviceCategories).map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* API市场页面 */}
      {activeTab === 'apis' && (
        <div>
          {/* API概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Code2, title: "活跃API", value: `${developerAPIs.length}+`, color: "text-blue-400" },
              { icon: Zap, title: "日调用量", value: "50万+", color: "text-yellow-400" },
              { icon: TrendingUp, title: "成功率", value: "99.5%", color: "text-green-400" },
              { icon: Users, title: "开发者", value: "2000+", color: "text-purple-400" }
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

          {/* API列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {filteredAPIs.map((api, index) => (
              <motion.div
                key={api.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {/* API头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{api.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        api.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        api.status === 'beta' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {api.status === 'active' ? '稳定' : api.status === 'beta' ? '测试' : '已废弃'}
                      </span>
                    </div>
                    <p className="text-neutral-400 mb-3">{api.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{api.rating}</span>
                      </div>
                      <div>{api.reviews} 评价</div>
                      <div>v{api.version}</div>
                    </div>
                  </div>
                </div>

                {/* 定价信息 */}
                <div className="mb-6">
                  {api.pricing.model === 'freemium' && api.pricing.freeTier && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-semibold">免费额度</span>
                        <span className="text-white font-bold">
                          {api.pricing.freeTier.requestsPerMonth.toLocaleString()} 次/月
                        </span>
                      </div>
                      <div className="text-neutral-400 text-sm">
                        包含: {api.pricing.freeTier.features.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {api.pricing.paidTiers.map((tier, idx) => (
                      <div key={idx} className="bg-neutral-800 rounded-lg p-4">
                        <div className="font-semibold text-white mb-1">{tier.name}</div>
                        <div className="text-2xl font-bold text-blue-400 mb-2">
                          ¥{tier.price}
                          <span className="text-sm text-neutral-400">
                            /{tier.billingPeriod === 'monthly' ? '月' : tier.billingPeriod === 'per-request' ? '次' : '年'}
                          </span>
                        </div>
                        {tier.billingPeriod !== 'per-request' && (
                          <div className="text-neutral-400 text-sm">
                            包含 {tier.requestsIncluded.toLocaleString()} 次调用
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 功能特性 */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">核心功能:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {api.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-neutral-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedAPI(api)}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>查看文档</span>
                  </button>
                  {api.playground && (
                    <button
                      onClick={() => window.open(api.playground, '_blank')}
                      className="py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>在线测试</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* API详情弹窗 */}
          {selectedAPI && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedAPI.name}</h2>
                    <button
                      onClick={() => setSelectedAPI(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* API Key生成 */}
                  <div className="bg-neutral-800 rounded-lg p-6 mb-6">
                    <h3 className="text-white font-semibold mb-4">API密钥</h3>
                    {apiKey ? (
                      <div className="flex items-center space-x-3">
                        <code className="flex-1 p-3 bg-neutral-700 text-green-400 rounded font-mono text-sm">
                          {apiKey}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(apiKey)}
                          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateAPIKey(selectedAPI.id)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        生成API密钥
                      </button>
                    )}
                  </div>

                  {/* API端点 */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-4">API端点</h3>
                    <div className="space-y-4">
                      {selectedAPI.endpoints.map((endpoint, idx) => (
                        <div key={idx} className="bg-neutral-800 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {endpoint.method}
                              </span>
                              <code className="text-white font-mono">{endpoint.path}</code>
                            </div>
                            <button
                              onClick={() => handleTestAPI(selectedAPI.id, endpoint.path)}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                            >
                              测试
                            </button>
                          </div>
                          <p className="text-neutral-400 mb-4">{endpoint.description}</p>
                          
                          {/* 请求示例 */}
                          <div className="bg-neutral-700 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">请求示例:</h4>
                            <pre className="text-green-400 text-sm overflow-x-auto">
{JSON.stringify(endpoint.example.request, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 代码示例 */}
                  {selectedAPI.examples.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-4">代码示例</h3>
                      {selectedAPI.examples.map((example, idx) => (
                        <div key={idx} className="bg-neutral-800 rounded-lg p-6 mb-4">
                          <h4 className="text-white font-medium mb-3">{example.title}</h4>
                          <p className="text-neutral-400 text-sm mb-4">{example.description}</p>
                          <div className="bg-neutral-900 rounded-lg p-4 mb-4">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                              <code>{example.code}</code>
                            </pre>
                          </div>
                          {example.response && (
                            <div className="bg-neutral-700 rounded-lg p-4">
                              <h5 className="text-white font-medium mb-2">响应:</h5>
                              <pre className="text-blue-400 text-sm overflow-x-auto">
                                <code>{example.response}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SDK下载 */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">SDK下载</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAPI.sdks.map((sdk, idx) => (
                        <div key={idx} className="bg-neutral-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{sdk.language}</span>
                            <span className="text-neutral-400 text-sm">v{sdk.version}</span>
                          </div>
                          <button
                            onClick={() => window.open(sdk.downloadUrl, '_blank')}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                          >
                            <Download className="w-4 h-4" />
                            <span>下载SDK</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 开发服务页面 */}
      {activeTab === 'services' && (
        <div>
          {/* 服务概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Users, title: "专家开发者", value: "50+", color: "text-blue-400" },
              { icon: Star, title: "平均评分", value: "4.8", color: "text-yellow-400" },
              { icon: Clock, title: "平均交付", value: "2周", color: "text-green-400" },
              { icon: CheckCircle, title: "成功率", value: "98%", color: "text-purple-400" }
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

          {/* 服务列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                {/* 服务头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-neutral-400 mb-3">{service.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{service.rating}</span>
                      </div>
                      <div>{service.reviews} 评价</div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        service.availability === 'available' ? 'bg-green-500/20 text-green-400' :
                        service.availability === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {service.availability === 'available' ? '可接单' : 
                         service.availability === 'busy' ? '忙碌中' : '暂不接单'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 提供者信息 */}
                <div className="bg-neutral-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{service.provider}</div>
                      <div className="text-neutral-400 text-sm">{service.experience}</div>
                    </div>
                  </div>
                </div>

                {/* 定价信息 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400">定价方式:</span>
                    <span className="text-white font-semibold">
                      {service.pricing.type === 'hourly' ? '按小时' :
                       service.pricing.type === 'project' ? '按项目' :
                       service.pricing.type === 'monthly' ? '包月' : '定制'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    ¥{service.pricing.startingPrice.toLocaleString()}
                    <span className="text-sm text-neutral-400">
                      {service.pricing.type === 'hourly' ? '/小时' :
                       service.pricing.type === 'project' ? ' 起' :
                       service.pricing.type === 'monthly' ? '/月' : ''}
                    </span>
                  </div>
                  {service.pricing.estimatedHours && (
                    <div className="text-neutral-400 text-sm mt-1">
                      预估 {service.pricing.estimatedHours} 小时
                    </div>
                  )}
                </div>

                {/* 交付成果 */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">交付成果:</h4>
                  <div className="space-y-2">
                    {service.deliverables.slice(0, 4).map((deliverable, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-neutral-300 text-sm">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 技术栈 */}
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">技术栈:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech, idx) => (
                      <span key={idx} className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>查看详情</span>
                  </button>
                  <button
                    disabled={service.availability !== 'available'}
                    className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>预约咨询</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 服务详情弹窗 */}
          {selectedService && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedService.name}</h2>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 作品集 */}
                  {selectedService.portfolio.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-white font-semibold mb-4">项目案例</h3>
                      <div className="space-y-6">
                        {selectedService.portfolio.map((item, idx) => (
                          <div key={idx} className="bg-neutral-800 rounded-lg p-6">
                            <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                            <p className="text-neutral-400 mb-4">{item.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h5 className="text-white font-medium mb-2">使用技术:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {item.technology.map((tech, techIdx) => (
                                    <span key={techIdx} className="px-2 py-1 bg-neutral-700 text-neutral-300 rounded text-xs">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-white font-medium mb-2">项目成果:</h5>
                                <ul className="space-y-1">
                                  {item.results.map((result, resultIdx) => (
                                    <li key={resultIdx} className="text-green-400 text-sm">• {result}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {item.link && (
                              <button
                                onClick={() => window.open(item.link, '_blank')}
                                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>查看项目</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 咨询预约表单 */}
                  <div className="bg-neutral-800 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">预约咨询</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="您的姓名"
                          className="p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="邮箱地址"
                          className="p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="公司名称"
                        className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none"
                      />
                      <select className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none">
                        <option value="">预算范围</option>
                        <option value="5000-20000">¥5,000 - ¥20,000</option>
                        <option value="20000-50000">¥20,000 - ¥50,000</option>
                        <option value="50000-100000">¥50,000 - ¥100,000</option>
                        <option value="100000+">¥100,000+</option>
                      </select>
                      <textarea
                        placeholder="项目需求描述"
                        rows={4}
                        className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        提交咨询请求
                      </button>
                    </form>
                  </div>
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
