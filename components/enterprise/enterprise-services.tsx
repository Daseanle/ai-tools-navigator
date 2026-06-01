"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Building, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Calendar,
  DollarSign
} from "lucide-react"
import { enterpriseServices, enterpriseClients, industrySolutions } from "@/lib/enterprise"

export default function EnterpriseServices() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            企业级AI工具解决方案
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            帮助企业实现AI工具的统一管理、高效应用和成本优化，
            让AI真正成为您业务增长的加速器
          </p>
        </motion.div>

        {/* 核心价值 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: TrendingUp, title: "效率提升", desc: "平均提升45%工作效率", color: "text-green-400" },
            { icon: DollarSign, title: "成本节省", desc: "年均节省30%AI工具成本", color: "text-blue-400" },
            { icon: Shield, title: "安全合规", desc: "企业级安全和数据保护", color: "text-purple-400" },
            { icon: Users, title: "团队协作", desc: "统一管理，无缝协作", color: "text-orange-400" }
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
      </div>

      {/* 服务列表 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">核心服务</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {enterpriseServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-neutral-900 rounded-2xl p-8 border-2 transition-all duration-300 cursor-pointer ${
                service.popular 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-neutral-700 hover:border-neutral-600'
              }`}
              onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
            >
              {service.popular && (
                <div className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-full text-sm mb-4">
                  <Star className="w-3 h-3 mr-1" />
                  热门服务
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-4">{service.name}</h3>
              <p className="text-neutral-400 mb-6">{service.description}</p>
              
              {/* 功能列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {service.features.slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* 项目信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <div className="text-neutral-500">项目周期</div>
                  <div className="text-white font-medium">{service.timeline}</div>
                </div>
                <div>
                  <div className="text-neutral-500">团队配置</div>
                  <div className="text-white font-medium">{service.teamSize}</div>
                </div>
              </div>

              {/* 价格 */}
              <div className="flex items-center justify-between">
                <div>
                  {service.pricing.customQuote ? (
                    <span className="text-blue-400 font-semibold">定制报价</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-white">
                        ¥{(service.pricing.startingPrice / 10000).toFixed(1)}万
                      </span>
                      <span className="text-neutral-400 text-sm ml-1">起</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowContactForm(true)
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  咨询详情
                </button>
              </div>

              {/* 展开的详细信息 */}
              {selectedService === service.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-neutral-800"
                >
                  <h4 className="text-white font-semibold mb-3">交付成果</h4>
                  <ul className="space-y-2 mb-4">
                    {service.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        <span className="text-neutral-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-neutral-400 text-sm">
                    <strong>支持服务：</strong> {service.supportLevel}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 成功案例 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">成功案例</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {enterpriseClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-900 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{client.companyName}</h3>
                  <p className="text-neutral-400">{client.industry} • {client.teamSize}人团队</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    ¥{(client.contract.value / 10000).toFixed(0)}万
                  </div>
                  <div className="text-neutral-400 text-sm">合同金额</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{client.success.toolsImplemented}</div>
                  <div className="text-neutral-400 text-xs">工具部署</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{client.success.efficiencyGain}</div>
                  <div className="text-neutral-400 text-xs">效率提升</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{client.success.costSaving}</div>
                  <div className="text-neutral-400 text-xs">成本节省</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{client.success.satisfaction}★</div>
                  <div className="text-neutral-400 text-xs">满意度</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {client.services.map(serviceId => {
                  const service = enterpriseServices.find(s => s.id === serviceId)
                  return service ? (
                    <span key={serviceId} className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs">
                      {service.name}
                    </span>
                  ) : null
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 行业解决方案 */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">行业解决方案</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {industrySolutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-900 rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-4">{solution.name}</h3>
              <p className="text-neutral-400 mb-6">{solution.description}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">主要挑战</h4>
                  <ul className="space-y-1">
                    {solution.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-neutral-400 text-sm">• {challenge}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">解决方案</h4>
                  <ul className="space-y-1">
                    {solution.solutions.map((sol, idx) => (
                      <li key={idx} className="text-green-400 text-sm">• {sol}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {solution.caseStudy && (
                <div className="bg-neutral-800 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">案例成果</h4>
                  <p className="text-neutral-400 text-sm mb-2">{solution.caseStudy.company}</p>
                  <ul className="space-y-1">
                    {solution.caseStudy.results.map((result, idx) => (
                      <li key={idx} className="text-blue-400 text-sm">• {result}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">开始您的AI数字化转型之旅</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          我们的专家团队将为您量身定制AI工具解决方案，
          帮助您的企业在AI时代获得竞争优势
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6">
            <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">免费咨询</h3>
            <p className="text-blue-100 text-sm">30分钟专家咨询</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6">
            <Building className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">定制方案</h3>
            <p className="text-blue-100 text-sm">量身定制解决方案</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6">
            <Zap className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">快速实施</h3>
            <p className="text-blue-100 text-sm">专业团队快速交付</p>
          </div>
        </div>

        <button 
          onClick={() => setShowContactForm(true)}
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
        >
          立即咨询企业方案
        </button>
      </div>

      {/* 联系表单模态框 */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">企业咨询</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="公司名称"
                className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="联系人姓名"
                className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="邮箱地址"
                className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="联系电话"
                className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
              <select className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none">
                <option value="">选择团队规模</option>
                <option value="1-50">1-50人</option>
                <option value="51-200">51-200人</option>
                <option value="201-500">201-500人</option>
                <option value="500+">500人以上</option>
              </select>
              <textarea
                placeholder="具体需求描述"
                rows={3}
                className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交咨询
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
