"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Menu, Sparkles } from "lucide-react"
import ThemeToggle from "@/components/ui/theme-toggle"
import LanguageSwitcher from "@/components/language-switcher"
import { UserNav } from "@/components/ui/user-nav"

export default function AppHeader() {
  const pathname = usePathname()
  const params = useParams()
  const lang = params.lang as string || 'zh'

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-neutral-900/70 border-b border-neutral-800/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href={`/${lang}`} className="inline-flex items-center space-x-2 text-white font-semibold">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>AI&nbsp;Navigator</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm text-neutral-300">
          <Link
            href={`/${lang}`}
            className={`hover:text-white transition-colors ${pathname === `/${lang}` ? "text-white font-medium" : ""}`}
          >
            首页
          </Link>
          <Link 
            href={`/${lang}/categories`} 
            className={`hover:text-white transition-colors ${pathname.includes('/categories') ? "text-white font-medium" : ""}`}
          >
            分类
          </Link>
          <Link 
            href={`/${lang}/tools`} 
            className={`hover:text-white transition-colors ${pathname.includes('/tools') ? "text-white font-medium" : ""}`}
          >
            工具
          </Link>
          <Link 
            href={`/${lang}/trials`} 
            className={`hover:text-white transition-colors ${pathname.includes('/trials') ? "text-white font-medium" : ""}`}
          >
            免费试用
          </Link>
          <Link 
            href={`/${lang}/prompts`} 
            className={`hover:text-white transition-colors ${pathname.includes('/prompts') ? "text-white font-medium" : ""}`}
          >
            Prompt市场
          </Link>
          <Link 
            href={`/${lang}/community`} 
            className={`hover:text-white transition-colors ${pathname.includes('/community') ? "text-white font-medium" : ""}`}
          >
            社区
          </Link>
          <Link 
            href={`/${lang}/developers`} 
            className={`hover:text-white transition-colors ${pathname.includes('/developers') ? "text-white font-medium" : ""}`}
          >
            开发者
          </Link>
          <Link 
            href={`/${lang}/membership`} 
            className={`hover:text-white transition-colors ${pathname.includes('/membership') ? "text-white font-medium" : ""}`}
          >
            会员
          </Link>
          <Link 
            href={`/${lang}/enterprise`} 
            className={`hover:text-white transition-colors ${pathname.includes('/enterprise') ? "text-white font-medium" : ""}`}
          >
            企业服务
          </Link>
          <Link 
            href={`/${lang}/industries`} 
            className={`hover:text-white transition-colors ${pathname.includes('/industries') ? "text-white font-medium" : ""}`}
          >
            行业方案
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

// NaviGuard-AI Security Audited - 2026-06-01
