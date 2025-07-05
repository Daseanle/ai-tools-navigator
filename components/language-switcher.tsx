"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, Languages } from "lucide-react"

export const locales = ["zh", "en"] as const
export type Locale = (typeof locales)[number]
export const localeNames: Record<Locale, string> = { zh: "简体中文", en: "English" }
export const defaultLocale: Locale = "zh"

function getLocaleFromUrl(pathname: string): Locale {
  const [, maybeLocale] = pathname.split("/")
  return locales.includes(maybeLocale as Locale) ? (maybeLocale as Locale) : defaultLocale
}

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = getLocaleFromUrl(pathname)

  // 外部点击关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLanguage = (locale: Locale) => {
    const segments = pathname.split("/")
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = locale
    } else {
      segments.splice(1, 0, locale)
    }
    router.push(segments.join("/"))
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-neutral-300 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
      >
        <Languages className="h-4 w-4" />
        <span>{localeNames[currentLocale]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-700 rounded-md shadow-lg z-50"
          role="menu"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => switchLanguage(locale)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === currentLocale ? "bg-blue-600/20 text-blue-400" : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
