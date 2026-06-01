"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Building2, 
  GraduationCap, 
  Stethoscope, 
  Briefcase, 
  Palette, 
  Code, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Target,
  Zap,
  Award,
  DollarSign,
  BarChart3,
  Eye,
  ShoppingCart
} from "lucide-react"
import { 
  IndustrySolution, 
  IndustrySolutionManager, 
  VerticalPageManager 
} from "@/lib/industry-solutions"

const categoryIcons = {
  business: Building2,
  education: GraduationCap,
  healthcare: Stethoscope,
  finance: Briefcase,
  creative: Palette,
  technology: Code,
  ecommerce: ShoppingCart
}

const categoryColors = {
  business: 'from-blue-600 to-cyan-600',
  education: 'from-green-600 to-emerald-600',
  healthcare: 'from-red-600 to-pink-600',
  finance: 'from-yellow-600 to-orange-600',
  creative: 'from-purple-600 to-indigo-600',
  technology: 'from-gray-600 to-slate-600',
  ecommerce: 'from-emerald-600 to-teal-600'
}

export default function IndustrySolutionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [solutions, setSolutions] = useState<IndustrySolution[]>([])
  const [selectedSolution, setSelectedSolution] = useState<IndustrySolution | null>(null)
  const [companySize, setCompanySize] = useState<'small' | 'medium' | 'large'>('medium')

  useEffect(() => {
    const allSolutions = IndustrySolutionManager.getAllSolutions()
    if (selectedCategory === 'all') {
      setSolutions(allSolutions)
    } else {
      setSolutions(IndustrySolutionManager.getSolutionsByCategory(selectedCategory))
    }
  }, [selectedCategory])

  const categories = [
    { id: 'all', name: '全部行业', icon: Building2 },
    { id: 'business', name: '企业服务', icon: Building2 },
    { id: 'education', name: '教育培训', icon: GraduationCap },
    { id: 'healthcare', name: '医疗健康', icon: Stethoscope },
    { id: 'finance', name: '金融服务', icon: Briefcase },
    { id: 'creative', name: '创意设计', icon: Palette },
    { id: 'technology', name: '科技开发', icon: Code },
    { id: 'ecommerce', name: '跨境电商', icon: ShoppingCart }
  ]

  const featuredSolutions = IndustrySolutionManager.getFeaturedSolutions()
  const verticalPages = VerticalPageManager.getAllPages()

  const handleGetQuote = (solution: IndustrySolution) => {
    setSelectedSolution(solution)
  }

  const calculateROI = (solution: IndustrySolution) => {
    return IndustrySolutionManager.calculateROI(solution, companySize)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              行业AI解决方案
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              为不同行业量身定制的AI工具解决方案，助力企业数字化转型，提升运营效率
            </p>
          </motion.div>

          {/* 统计数据 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Building2, title: "服务行业", value: "7+", color: "text-blue-400" },
              { icon: Users, title: "客户案例", value: "120+", color: "text-green-400" },
              { icon: TrendingUp, title: "平均ROI", value: "280%", color: "text-purple-400" },
              { icon: Clock, title: "实施周期", value: "1-6月", color: "text-yellow-400" }
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
        </div>

        {/* 行业分类筛选 */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white scale-105'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 精选解决方案 */}
        {selectedCategory === 'all' && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">精选解决方案</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredSolutions.slice(0, 4).map((solution, index) => {
                const IconComponent = categoryIcons[solution.category]
                const roi = calculateROI(solution)
                return (
                  <motion.div
                    key={solution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-600 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryColors[solution.category]}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                              {solution.name}
                            </h3>
                            <span className="text-sm text-neutral-400">{solution.icon} {solution.category}</span>
                          </div>
                        </div>
                        <p className="text-neutral-400 mb-4">{solution.description}</p>
                      </div>
                    </div>

                    {/* 关键指标 */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">¥{roi.investment.toLocaleString()}</div>
                        <div className="text-xs text-neutral-400">投资金额</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{roi.roi}%</div>
                        <div className="text-xs text-neutral-400">年ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{solution.timeline}</div>
                        <div className="text-xs text-neutral-400">实施周期</div>
                      </div>
                    </div>

                    {/* 核心优势 */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {solution.benefits.slice(0, 3).map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-lg text-sm"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleGetQuote(solution)}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>获取报价</span>
                      </button>
                      <button className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* 解决方案列表 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {selectedCategory === 'all' ? '全部解决方案' : `${categories.find(c => c.id === selectedCategory)?.name}解决方案`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const IconComponent = categoryIcons[solution.category]
              const roi = calculateROI(solution)
              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-neutral-600 transition-all group cursor-pointer"
                  onClick={() => setSelectedSolution(solution)}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColors[solution.category]}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {solution.name}
                      </h3>
                      <span className="text-xs text-neutral-400">{solution.category}</span>
                    </div>
                  </div>

                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{solution.description}</p>

                  {/* 目标客户 */}
                  <div className="mb-4">
                    <div className="text-xs text-neutral-500 mb-1">适用对象:</div>
                    <div className="flex flex-wrap gap-1">
                      {solution.targetAudience.slice(0, 2).map((audience, idx) => (
                        <span key={idx} className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">
                          {audience}
                        </span>
                      ))}
                      {solution.targetAudience.length > 2 && (
                        <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">
                          +{solution.targetAudience.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ROI 指标 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-neutral-800 rounded-lg">
                      <div className="text-sm font-bold text-green-400">{roi.roi}%</div>
                      <div className="text-xs text-neutral-400">年ROI</div>
                    </div>
                    <div className="text-center p-2 bg-neutral-800 rounded-lg">
                      <div className="text-sm font-bold text-blue-400">{solution.timeline}</div>
                      <div className="text-xs text-neutral-400">周期</div>
                    </div>
                  </div>

                  {/* 案例数量 */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">{solution.caseStudies.length} 个成功案例</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 垂直行业页面 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">行业专题页面</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {verticalPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-neutral-600 transition-all group"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {page.title}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-3">{page.description}</p>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-neutral-500 mb-2">推荐工具:</div>
                  <div className="flex flex-wrap gap-1">
                    {page.tools.slice(0, 3).map((tool, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <Link 
                  href={`/industries/${page.slug}`}
                  className="block w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-center rounded-lg transition-colors text-sm"
                >
                  查看专题页面
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">找不到适合的解决方案？</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            我们提供定制化AI解决方案服务，针对您的具体需求量身打造专属方案
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
              咨询定制方案
            </button>
            <button className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors">
              预约演示
            </button>
          </div>
        </div>
      </div>

      {/* 解决方案详情弹窗 */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryColors[selectedSolution.category]}`}>
                    {React.createElement(categoryIcons[selectedSolution.category], { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSolution.name}</h2>
                    <p className="text-neutral-400">{selectedSolution.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="text-neutral-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左侧详情 */}
                <div className="space-y-6">
                  {/* 目标客户 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">目标客户</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedSolution.targetAudience.map((audience, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Target className="w-3 h-3 text-blue-400" />
                          <span className="text-neutral-300 text-sm">{audience}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 核心痛点 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">解决痛点</h3>
                    <div className="space-y-2">
                      {selectedSolution.painPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-neutral-300 text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 解决方案 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">解决方案</h3>
                    <div className="space-y-2">
                      {selectedSolution.solutions.map((solution, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-300 text-sm">{solution}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 推荐工具 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">推荐工具</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSolution.recommendedTools.map((tool, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧ROI分析 */}
                <div className="space-y-6">
                  {/* 公司规模选择 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">选择企业规模</h3>
                    <div className="flex space-x-2">
                      {[
                        { value: 'small', label: '小型(50人以下)' },
                        { value: 'medium', label: '中型(50-500人)' },
                        { value: 'large', label: '大型(500人以上)' }
                      ].map((size) => (
                        <button
                          key={size.value}
                          onClick={() => setCompanySize(size.value as any)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            companySize === size.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ROI 计算 */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">投资回报分析</h3>
                    <div className="bg-neutral-800 rounded-xl p-6">
                      {(() => {
                        const roi = calculateROI(selectedSolution)
                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">总投资金额</span>
                              <span className="text-white font-bold">¥{roi.investment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">年度节省</span>
                              <span className="text-green-400 font-bold">¥{roi.annualSaving.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">投资回报率</span>
                              <span className="text-blue-400 font-bold">{roi.roi}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">回收周期</span>
                              <span className="text-purple-400 font-bold">{roi.paybackPeriod}年</span>
                            </div>
                          </div>
                        )
                      })()} 
                    </div>
                  </div>

                  {/* 客户案例 */}
                  {selectedSolution.caseStudies.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">客户案例</h3>
                      <div className="bg-neutral-800 rounded-xl p-6">
                        <div className="mb-3">
                          <h4 className="text-white font-semibold">{selectedSolution.caseStudies[0].companyName}</h4>
                          <span className="text-neutral-400 text-sm">{selectedSolution.caseStudies[0].industry}</span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-neutral-400 mb-1">挑战:</div>
                          <div className="text-neutral-300 text-sm">{selectedSolution.caseStudies[0].challenge}</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-neutral-400 mb-1">解决方案:</div>
                          <div className="text-neutral-300 text-sm">{selectedSolution.caseStudies[0].solution}</div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">+{selectedSolution.caseStudies[0].metrics.efficiency}%</div>
                            <div className="text-xs text-neutral-400">效率提升</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">-{selectedSolution.caseStudies[0].metrics.costSaving}%</div>
                            <div className="text-xs text-neutral-400">成本节省</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">-{selectedSolution.caseStudies[0].metrics.timeReduction}%</div>
                            <div className="text-xs text-neutral-400">时间缩短</div>
                          </div>
                        </div>
                        
                        <blockquote className="text-neutral-300 text-sm italic border-l-4 border-blue-600 pl-3">
                          "{selectedSolution.caseStudies[0].testimonial}"
                        </blockquote>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-4 mt-8">
                <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>获取详细报价</span>
                </button>
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  预约演示
                </button>
                <button className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors">
                  下载资料
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// React import for createElement
import React from 'react'

// NaviGuard-AI Security Audited - 2026-06-01
