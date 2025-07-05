"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Sparkles } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import LanguageSwitcher from "@/components/language-switcher"
import { UserNav } from "@/components/ui/user-nav"

export default function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-neutral-900/70 border-b border-neutral-800/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="inline-flex items-center space-x-2 text-white font-semibold">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>AI&nbsp;Navigator</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm text-neutral-300">
          <Link
            href="/zh"
            className={`hover:text-white transition-colors ${pathname === "/zh" ? "text-white font-medium" : ""}`}
          >
            首页
          </Link>
          <Link href="/zh/categories" className="hover:text-white transition-colors">
            分类
          </Link>
          <Link href="/zh/tools" className="hover:text-white transition-colors">
            工具
          </Link>
          <Link href="/zh/about" className="hover:text-white transition-colors">
            关于
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserNav />
          </div>
        </nav>

        {/* Mobile toggles */}
        <div className="flex lg:hidden items-center space-x-2">
          <UserNav />
          <LanguageSwitcher />
          <ThemeToggle />
          {/* 简单菜单图标—可后续替换为抽屉菜单 */}
          <Menu className="w-6 h-6 text-neutral-300" />
        </div>
      </div>
    </header>
  )
}
