"use client"

import { motion } from "framer-motion"

interface LoadingSkeletonProps {
  className?: string
  variant?: "card" | "text" | "avatar" | "button"
  count?: number
}

export default function LoadingSkeleton({ className = "", variant = "card", count = 1 }: LoadingSkeletonProps) {
  const getSkeletonClass = () => {
    switch (variant) {
      case "text":
        return "h-4 bg-neutral-800/50 rounded-full"
      case "avatar":
        return "w-12 h-12 bg-neutral-800/50 rounded-xl"
      case "button":
        return "h-10 bg-neutral-800/50 rounded-xl"
      case "card":
      default:
        return "h-64 bg-neutral-800/50 rounded-2xl"
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`skeleton ${getSkeletonClass()} ${className}`}
        />
      ))}
    </>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
