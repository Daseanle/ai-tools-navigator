"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * 简易 PWA 安装提示组件
 * 1. 监听 beforeinstallprompt 事件
 * 2. 向用户展示安装按钮
 * 3. 调用 prompt() 触发浏览器安装对话框
 */
export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  // 捕获 beforeinstallprompt 事件
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handler as EventListener)

    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener)
  }, [])

  // 点击安装
  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto bg-neutral-900/90 backdrop-blur-md border border-neutral-700/50 rounded-2xl px-4 py-3 flex items-center space-x-3 shadow-xl"
        >
          <Download className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <span className="text-sm text-white">安装 AI&nbsp;Navigator 到桌面，获得更好体验</span>
          <button
            onClick={handleInstall}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-sm text-white px-3 py-1.5 rounded-full transition-colors"
          >
            安装
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-2 text-neutral-400 hover:text-neutral-200 text-sm"
            aria-label="关闭"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 为 TypeScript 提供 BeforeInstallPromptEvent 类型
declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
