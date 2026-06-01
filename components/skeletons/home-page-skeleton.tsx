"use client"

import { motion } from "framer-motion"

export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Hero Skeleton */}
        <div className="text-center max-w-4xl mx-auto space-y-6 mb-20">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="h-16 w-3/4 mx-auto bg-gray-200/50 dark:bg-gray-800/50 rounded-xl"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            className="h-6 w-2/3 mx-auto bg-gray-200/50 dark:bg-gray-800/50 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
            className="h-14 w-full max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 rounded-2xl"
          />
        </div>

        {/* Categories Skeleton */}
        <div className="mb-20">
          <div className="h-8 w-48 bg-gray-200/50 dark:bg-gray-800/50 rounded-full mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/80 dark:bg-gray-800/80" />
            ))}
          </div>
        </div>

        {/* Tools Grid Skeleton */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 bg-gray-200/50 dark:bg-gray-800/50 rounded-full" />
            <div className="h-6 w-24 bg-gray-200/50 dark:bg-gray-800/50 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/80 dark:bg-gray-800/80" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
