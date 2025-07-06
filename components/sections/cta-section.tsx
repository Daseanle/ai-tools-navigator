"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useState } from "react"
import RegistrationModal from "@/components/modals/registration-modal"

export default function CTASection() {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  const handleRegisterClick = () => {
    setIsRegistrationModalOpen(true)
  }

  const handleExploreClick = () => {
    router.push(`/${lang}/tools`)
  }
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-16"
    >
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 md:p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 to-purple-700/50 backdrop-blur-sm"></div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            加入我们的社区
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            开启 AI 工具探索之旅
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            获取最新 AI 工具资讯、专业评测和使用技巧，与千万用户一起探索AI的无限可能。
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <button 
              onClick={handleRegisterClick}
              className="group inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 transform cursor-pointer"
            >
              免费注册
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleExploreClick}
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 cursor-pointer"
            >
              探索工具
            </button>
          </motion.div>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setIsRegistrationModalOpen(false)} 
      />
    </motion.section>
  )
}
