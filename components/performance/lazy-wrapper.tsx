"use client"

import { Suspense, type ReactNode } from "react"
import { motion } from "framer-motion"
import LoadingSkeleton from "@/components/ui/loading-skeleton"

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  delay?: number
}

export default function LazyWrapper({ children, fallback, className = "", delay = 0 }: LazyWrapperProps) {
  const defaultFallback = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`w-full ${className}`}>
      <LoadingSkeleton variant="card" />
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
    </motion.div>
  )
}
