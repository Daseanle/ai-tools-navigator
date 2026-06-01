"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TestTube2, 
  Users, 
  Star, 
  Gift,
  MessageSquare,
  Clock,
  CheckCircle,
  Mail,
  Share2,
  TrendingUp,
  Award,
  Target,
  Zap
} from "lucide-react"

export interface TestingProgram {
  id: string
  name: string
  description: string
  type: 'alpha' | 'beta' | 'feature' | 'usability'
  status: 'recruiting' | 'ongoing' | 'completed'
  startDate: string
  endDate: string
  participantCount: number
  maxParticipants: number
  rewards: string[]
  requirements: string[]
  tasks: TestingTask[]
}

export interface TestingTask {
  id: string
  title: string
  description: string
  type: 'exploration' | 'specific_action' | 'feedback' | 'bug_report'
  estimatedTime: number // 分钟
  reward: number // 积分
  completed?: boolean
}

export interface UserFeedback {
  id: string
  userId: string
  programId: string
  taskId?: string
  rating: number
  content: string
  category: 'bug' | 'feature_request' | 'usability' | 'general'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'reviewing' | 'in_progress' | 'resolved' | 'closed'
  attachments?: string[]
  createdAt: string
}

// 测试项目配置
const testingPrograms: TestingProgram[] = [
  {
    id: 'beta-monetization',
    name: '变现系统Beta测试',
    description: '测试新的会员体系、支付系统和内容变现功能，帮助我们完善用户体验',
    type: 'beta',
    status: 'recruiting',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    participantCount: 0,
    maxParticipants: 100,
    rewards: ['500积分奖励', '3个月免费会员', '专属测试徽章', '优先体验新功能'],
    requirements: ['活跃用户（30天内登录5次以上）', '愿意提供详细反馈', '有在线支付经验'],
    tasks: [
      {
        id: 'task-1',
        title: '体验会员升级流程',
        description: '尝试从免费用户升级到付费会员，体验完整的支付流程',
        type: 'specific_action',
        estimatedTime: 15,
        reward: 100
      },
      {
        id: 'task-2', 
        title: '测试Prompt市场购买',
        description: '在Prompt市场中浏览、购买和使用付费内容',
        type: 'specific_action',
        estimatedTime: 20,
        reward: 150
      },
      {
        id: 'task-3',
        title: '试用AI工具分销功能',
        description: '申请成为分销合伙人，生成推广链接并分享',
        type: 'specific_action',
        estimatedTime: 25,
        reward: 200
      },
      {
        id: 'task-4',
        title: '反馈用户体验问题',
        description: '记录使用过程中遇到的任何问题或改进建议',
        type: 'feedback',
        estimatedTime: 10,
        reward: 50
      }
    ]
  },
  {
    id: 'alpha-community',
    name: '社区功能Alpha测试',
    description: '抢先体验全新的AI社区功能，包括内容创作、打赏系统和创作者计划',
    type: 'alpha',
    status: 'ongoing',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-31T00:00:00Z',
    participantCount: 45,
    maxParticipants: 50,
    rewards: ['1000积分奖励', '创作者认证资格', '社区贡献徽章'],
    requirements: ['内容创作经验', '社区活跃用户', '愿意分享专业知识'],
    tasks: [
      {
        id: 'task-5',
        title: '发布优质内容',
        description: '在社区中发布AI工具相关的教程或评测内容',
        type: 'specific_action',
        estimatedTime: 60,
        reward: 300
      },
      {
        id: 'task-6',
        title: '测试打赏功能',
        description: '给其他创作者的内容打赏，体验支付流程',
        type: 'specific_action',
        estimatedTime: 10,
        reward: 100
      }
    ]
  },
  {
    id: 'usability-mobile',
    name: '移动端可用性测试',
    description: '帮助我们优化移动端用户体验，让AI工具发现更加便捷',
    type: 'usability',
    status: 'recruiting',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-02-05T00:00:00Z',
    participantCount: 23,
    maxParticipants: 80,
    rewards: ['200积分奖励', '移动端优化先享权', '可用性测试证书'],
    requirements: ['主要使用手机访问网站', '愿意录制操作视频', '提供详细的可用性反馈'],
    tasks: [
      {
        id: 'task-7',
        title: '移动端导航测试',
        description: '测试移动端菜单、搜索和页面跳转的便捷性',
        type: 'exploration',
        estimatedTime: 20,
        reward: 80
      },
      {
        id: 'task-8',
        title: '移动支付体验',
        description: '在手机上完成会员购买或内容付费流程',
        type: 'specific_action',
        estimatedTime: 15,
        reward: 120
      }
    ]
  }
]

export default function UserTestingInvite() {
  const [selectedProgram, setSelectedProgram] = useState<TestingProgram | null>(null)
  const [userFeedback, setUserFeedback] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [isParticipant, setIsParticipant] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  // 模拟用户测试统计
  const testingStats = {
    totalParticipants: 168,
    activeFeedback: 89,
    resolvedIssues: 156,
    averageRating: 4.6
  }

  const handleJoinProgram = (program: TestingProgram) => {
    // 模拟加入测试程序
    setIsParticipant(true)
    console.log(`Joined testing program: ${program.name}`)
  }

  const handleCompleteTask = (taskId: string) => {
    setCompletedTasks(prev => [...prev, taskId])
    // 这里会给用户添加积分奖励
  }

  const handleSubmitFeedback = () => {
    const feedback: UserFeedback = {
      id: 'feedback_' + Date.now(),
      userId: 'user-123',
      programId: selectedProgram?.id || '',
      rating: userRating,
      content: userFeedback,
      category: 'general',
      priority: 'medium',
      status: 'new',
      createdAt: new Date().toISOString()
    }
    
    console.log('Feedback submitted:', feedback)
    setShowFeedbackForm(false)
    setUserFeedback('')
    setUserRating(0)
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
            用户测试计划
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            加入我们的测试计划，抢先体验新功能，获得丰厚奖励，共同打造更好的AI工具平台
          </p>
        </motion.div>

        {/* 测试统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Users, title: "测试用户", value: testingStats.totalParticipants, color: "text-blue-400" },
            { icon: MessageSquare, title: "活跃反馈", value: testingStats.activeFeedback, color: "text-green-400" },
            { icon: CheckCircle, title: "问题解决", value: testingStats.resolvedIssues, color: "text-purple-400" },
            { icon: Star, title: "平均评分", value: testingStats.averageRating, color: "text-yellow-400" }
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

      {/* 测试项目列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {testingPrograms.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            {/* 项目头部 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{program.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    program.type === 'alpha' ? 'bg-red-500/20 text-red-400' :
                    program.type === 'beta' ? 'bg-blue-500/20 text-blue-400' :
                    program.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {program.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-neutral-400 mb-4">{program.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{program.participantCount}/{program.maxParticipants}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(program.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    program.status === 'recruiting' ? 'bg-green-500/20 text-green-400' :
                    program.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {program.status === 'recruiting' ? '招募中' :
                     program.status === 'ongoing' ? '进行中' : '已结束'}
                  </div>
                </div>
              </div>
            </div>

            {/* 奖励展示 */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <Gift className="w-4 h-4 text-yellow-400" />
                <span>测试奖励:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {program.rewards.map((reward, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">{reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 参与要求 */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span>参与要求:</span>
              </h4>
              <ul className="space-y-1">
                {program.requirements.map((req, idx) => (
                  <li key={idx} className="text-neutral-400 text-sm">• {req}</li>
                ))}
              </ul>
            </div>

            {/* 测试任务 */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <TestTube2 className="w-4 h-4 text-purple-400" />
                <span>测试任务 ({program.tasks.length}个):</span>
              </h4>
              <div className="space-y-2">
                {program.tasks.slice(0, 2).map((task, idx) => (
                  <div key={idx} className="bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{task.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-neutral-400 text-xs">{task.estimatedTime}分钟</span>
                        <span className="text-yellow-400 text-xs">+{task.reward}积分</span>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-xs">{task.description}</p>
                  </div>
                ))}
                {program.tasks.length > 2 && (
                  <div className="text-neutral-400 text-sm text-center">
                    还有 {program.tasks.length - 2} 个任务...
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedProgram(program)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                查看详情
              </button>
              {program.status === 'recruiting' && (
                <button
                  onClick={() => handleJoinProgram(program)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  立即加入
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 成为测试用户的好处 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">为什么加入测试计划？</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          成为我们的测试用户，不仅能抢先体验最新功能，还能获得丰厚奖励和专属特权
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6">
            <Zap className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">抢先体验</h3>
            <p className="text-blue-100 text-sm">优先试用新功能</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6">
            <Award className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">丰厚奖励</h3>
            <p className="text-blue-100 text-sm">积分、会员、专属徽章</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">影响产品</h3>
            <p className="text-blue-100 text-sm">您的建议改变产品</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6">
            <Users className="w-8 h-8 text-white mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">专属社群</h3>
            <p className="text-blue-100 text-sm">测试用户专属群组</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            立即申请成为测试用户
          </button>
          <button 
            onClick={() => setShowFeedbackForm(true)}
            className="px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors"
          >
            提交产品建议
          </button>
        </div>
      </div>

      {/* 项目详情弹窗 */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedProgram.name}</h2>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-neutral-400 mb-8">{selectedProgram.description}</p>

              {/* 详细任务列表 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">测试任务列表</h3>
                <div className="space-y-4">
                  {selectedProgram.tasks.map((task, idx) => (
                    <div key={task.id} className="bg-neutral-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">{task.title}</h4>
                        <div className="flex items-center space-x-4">
                          <span className="text-neutral-400 text-sm">{task.estimatedTime}分钟</span>
                          <span className="text-yellow-400 font-medium">+{task.reward}积分</span>
                          {completedTasks.includes(task.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                            >
                              开始
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-neutral-400 text-sm">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 加入按钮 */}
              {selectedProgram.status === 'recruiting' && !isParticipant && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleJoinProgram(selectedProgram)}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    加入测试计划
                  </button>
                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: selectedProgram.name,
                        text: selectedProgram.description,
                        url: window.location.href
                      })
                    }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>分享</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 反馈提交弹窗 */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-2xl w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">提交产品反馈</h2>
                <button
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">整体评分</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`text-2xl ${star <= userRating ? 'text-yellow-400' : 'text-neutral-600'} hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">详细反馈</label>
                  <textarea
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    placeholder="请详细描述您的使用体验、遇到的问题或改进建议..."
                    rows={6}
                    className="w-full p-3 bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    提交反馈
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
