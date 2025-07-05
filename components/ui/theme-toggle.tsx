"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon },
    { value: "system", label: "系统", icon: Monitor },
  ] as const

  const currentTheme = themes.find((t) => t.value === theme) || themes[1]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-300"
        aria-label="切换主题"
      >
        <currentTheme.icon className="w-5 h-5 text-neutral-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-32 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center space-x-2 transition-colors ${
                    theme === themeOption.value
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-neutral-300 hover:bg-neutral-800/50"
                  }`}
                >
                  <themeOption.icon className="w-4 h-4" />
                  <span className="text-sm">{themeOption.label}</span>
                </button>
              ))}
            </motion.div>

            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
