"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Star, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsSectionProps {
  toolsCount?: number
  categoriesCount?: number
  usersCount?: number
  reviewsCount?: number
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return <span>{count.toLocaleString()}</span>
}

export default function StatsSection({ 
  toolsCount = 2180, 
  categoriesCount = 8, 
  usersCount = 85000, 
  reviewsCount = 24600 
}: StatsSectionProps) {
  const stats = [
    {
      icon: Zap,
      label: "AI工具",
      value: toolsCount,
      suffix: "+",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      label: "工具分类",
      value: categoriesCount,
      suffix: "个",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Star,
      label: "用户评价",
      value: reviewsCount,
      suffix: "+",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: TrendingUp,
      label: "月更新工具",
      value: Math.floor(toolsCount * 0.05),
      suffix: "+",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="py-16"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative group"
          >
            <div className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300">
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>

              <div className="text-3xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </div>

              <div className="text-sm text-neutral-400 font-medium">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
