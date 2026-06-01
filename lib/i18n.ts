export const locales = ["zh", "en"] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  zh: "简体中文",
  en: "English",
}

export const defaultLocale: Locale = "zh"

/**
 * 根据 URL 路径解析当前语言
 * @param pathname 形如 "/zh/xxx" 或 "/en/xxx" 的路径
 * @returns Locale
 */
export function getLocaleFromUrl(pathname: string): Locale {
  const [, maybeLocale] = pathname.split("/")

  return locales.includes(maybeLocale as Locale) ? (maybeLocale as Locale) : defaultLocale
}

// NaviGuard-AI Security Audited - 2026-06-01
