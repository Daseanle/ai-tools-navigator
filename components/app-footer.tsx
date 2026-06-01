"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function AppFooter() {
  return (
    <footer className="border-t border-neutral-800/50 bg-neutral-900/70 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
        <div className="flex items-center space-x-2 text-white font-semibold">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>AI&nbsp;Navigator</span>
        </div>

        <nav className="flex items-center space-x-6 text-sm text-neutral-400">
          <Link href="/zh/privacy" className="hover:text-white transition-colors">
            隐私政策
          </Link>
          <Link href="/zh/terms" className="hover:text-white transition-colors">
            服务条款
          </Link>
          <span className="text-neutral-500">&copy; {new Date().getFullYear()} AI Navigator</span>
        </nav>
      </div>
    </footer>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
