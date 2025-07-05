"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, Folder, Compass, Menu } from "lucide-react"

export default function MobileNavigation() {
  const pathname = usePathname()
  const params = useParams()
  const lang = params.lang as string || 'zh'

  const navItems = [
    { href: `/${lang}`, icon: Home, label: "首页" },
    { href: `/${lang}/categories`, icon: Folder, label: "分类" },
    { href: `/${lang}/tools`, icon: Compass, label: "工具" },
    { href: `/${lang}/about`, icon: Menu, label: "关于" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden justify-around bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800/50 h-14">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== `/${lang}` && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <item.icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-blue-500" : ""}`} />
            <span className={isActive ? "text-blue-500" : ""}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
