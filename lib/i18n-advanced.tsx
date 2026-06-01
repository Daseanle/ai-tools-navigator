// Advanced Internationalization (i18n) System
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// ==================== Supported Locales ====================

export const locales = ['zh-CN', 'en-US', 'ja-JP'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'zh-CN'

// Locale metadata
export const localeMetadata = {
  'zh-CN': {
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    dir: 'ltr',
    country: 'CN',
    currency: 'CNY',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  'en-US': {
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    country: 'US',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm:ss A',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 2
    }
  },
  'ja-JP': {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    country: 'JP',
    currency: 'JPY',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      precision: 0
    }
  }
} as const

// ==================== Translation System ====================

type TranslationValues = Record<string, string | number>
type TranslationFunction = (key: string, values?: TranslationValues) => string

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationFunction
  formatDate: (date: Date) => string
  formatTime: (date: Date) => string
  formatNumber: (number: number) => string
  formatCurrency: (amount: number) => string
  dir: 'ltr' | 'rtl'
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// ==================== Translation Database ====================

export const translations = {
  'zh-CN': {
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.more': '更多',
    'common.less': '收起',
    'common.next': '下一页',
    'common.prev': '上一页',
    'common.close': '关闭',
    'common.open': '打开',
    'common.view': '查看',
    'common.share': '分享',
    'common.copy': '复制',
    'common.download': '下载',
    'common.upload': '上传',
    'common.install': '安装',
    'common.update': '更新',
    
    // Navigation
    'nav.home': '首页',
    'nav.tools': '工具',
    'nav.categories': '分类',
    'nav.favorites': '收藏',
    'nav.search': '搜索',
    'nav.settings': '设置',
    'nav.about': '关于',
    'nav.contact': '联系',
    'nav.help': '帮助',
    'nav.login': '登录',
    'nav.logout': '退出',
    'nav.profile': '个人资料',
    'nav.dashboard': '仪表板',
    
    // Tools
    'tools.title': 'AI工具导航',
    'tools.subtitle': '发现最优秀的AI工具和应用',
    'tools.search.placeholder': '搜索AI工具...',
    'tools.filter.all': '全部',
    'tools.filter.free': '免费',
    'tools.filter.paid': '付费',
    'tools.filter.freemium': '免费增值',
    'tools.sort.rating': '评分',
    'tools.sort.name': '名称',
    'tools.sort.date': '日期',
    'tools.sort.popularity': '热度',
    'tools.rating': '评分',
    'tools.visits': '访问量',
    'tools.category': '分类',
    'tools.pricing': '定价',
    'tools.features': '功能',
    'tools.description': '描述',
    'tools.website': '访问网站',
    'tools.addToFavorites': '添加到收藏',
    'tools.removeFromFavorites': '取消收藏',
    'tools.share': '分享工具',
    'tools.report': '举报',
    'tools.notFound': '未找到匹配的工具',
    'tools.loadMore': '加载更多',
    
    // Categories
    'categories.title': '工具分类',
    'categories.all': '全部分类',
    'categories.popular': '热门分类',
    'categories.toolCount': '{count} 个工具',
    
    // User
    'user.favorites': '我的收藏',
    'user.history': '浏览历史',
    'user.settings': '个人设置',
    'user.language': '语言设置',
    'user.theme': '主题设置',
    'user.notifications': '通知设置',
    'user.privacy': '隐私设置',
    'user.account': '账户设置',
    
    // PWA
    'pwa.install': '安装应用',
    'pwa.update': '更新应用',
    'pwa.offline': '您当前处于离线状态',
    'pwa.online': '网络连接已恢复',
    'pwa.updateAvailable': '发现新版本',
    'pwa.installPrompt': '安装AI工具导航到您的设备',
    
    // SEO
    'seo.title': 'AI工具导航 - 发现最佳AI工具和应用',
    'seo.description': '探索和发现最新、最优秀的AI工具。我们收录了数千个AI应用，帮助您找到最适合的AI解决方案。',
    'seo.keywords': 'AI工具, 人工智能, AI应用, 机器学习, 深度学习',
    
    // Time and Date
    'time.now': '刚刚',
    'time.minutesAgo': '{minutes} 分钟前',
    'time.hoursAgo': '{hours} 小时前',
    'time.daysAgo': '{days} 天前',
    'time.weeksAgo': '{weeks} 周前',
    'time.monthsAgo': '{months} 个月前',
    'time.yearsAgo': '{years} 年前',
    
    // Notifications
    'notification.toolAdded': '工具已添加到收藏',
    'notification.toolRemoved': '工具已从收藏中移除',
    'notification.copySuccess': '复制成功',
    'notification.shareSuccess': '分享成功',
    'notification.error': '操作失败，请重试',
    'notification.networkError': '网络连接错误',
    'notification.permissionDenied': '权限被拒绝',
    
    // Dashboard
    'dashboard.title': '管理仪表板',
    'dashboard.overview': '概览',
    'dashboard.analytics': '分析',
    'dashboard.tools': '工具管理',
    'dashboard.users': '用户管理',
    'dashboard.settings': '系统设置',
    'dashboard.totalTools': '工具总数',
    'dashboard.totalUsers': '用户总数',
    'dashboard.totalViews': '总浏览量',
    'dashboard.activeUsers': '活跃用户',
  },
  
  'en-US': {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.more': 'More',
    'common.less': 'Less',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.view': 'View',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.install': 'Install',
    'common.update': 'Update',
    
    // Navigation
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.categories': 'Categories',
    'nav.favorites': 'Favorites',
    'nav.search': 'Search',
    'nav.settings': 'Settings',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.help': 'Help',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    
    // Tools
    'tools.title': 'AI Tools Navigator',
    'tools.subtitle': 'Discover the best AI tools and applications',
    'tools.search.placeholder': 'Search AI tools...',
    'tools.filter.all': 'All',
    'tools.filter.free': 'Free',
    'tools.filter.paid': 'Paid',
    'tools.filter.freemium': 'Freemium',
    'tools.sort.rating': 'Rating',
    'tools.sort.name': 'Name',
    'tools.sort.date': 'Date',
    'tools.sort.popularity': 'Popularity',
    'tools.rating': 'Rating',
    'tools.visits': 'Visits',
    'tools.category': 'Category',
    'tools.pricing': 'Pricing',
    'tools.features': 'Features',
    'tools.description': 'Description',
    'tools.website': 'Visit Website',
    'tools.addToFavorites': 'Add to Favorites',
    'tools.removeFromFavorites': 'Remove from Favorites',
    'tools.share': 'Share Tool',
    'tools.report': 'Report',
    'tools.notFound': 'No matching tools found',
    'tools.loadMore': 'Load More',
    
    // Categories
    'categories.title': 'Tool Categories',
    'categories.all': 'All Categories',
    'categories.popular': 'Popular Categories',
    'categories.toolCount': '{count} tools',
    
    // User
    'user.favorites': 'My Favorites',
    'user.history': 'Browse History',
    'user.settings': 'User Settings',
    'user.language': 'Language Settings',
    'user.theme': 'Theme Settings',
    'user.notifications': 'Notification Settings',
    'user.privacy': 'Privacy Settings',
    'user.account': 'Account Settings',
    
    // PWA
    'pwa.install': 'Install App',
    'pwa.update': 'Update App',
    'pwa.offline': 'You are currently offline',
    'pwa.online': 'Network connection restored',
    'pwa.updateAvailable': 'New version available',
    'pwa.installPrompt': 'Install AI Tools Navigator to your device',
    
    // SEO
    'seo.title': 'AI Tools Navigator - Discover the Best AI Tools and Applications',
    'seo.description': 'Explore and discover the latest and greatest AI tools. We curate thousands of AI applications to help you find the perfect AI solution.',
    'seo.keywords': 'AI tools, artificial intelligence, AI applications, machine learning, deep learning',
    
    // Time and Date
    'time.now': 'just now',
    'time.minutesAgo': '{minutes} minutes ago',
    'time.hoursAgo': '{hours} hours ago',
    'time.daysAgo': '{days} days ago',
    'time.weeksAgo': '{weeks} weeks ago',
    'time.monthsAgo': '{months} months ago',
    'time.yearsAgo': '{years} years ago',
    
    // Notifications
    'notification.toolAdded': 'Tool added to favorites',
    'notification.toolRemoved': 'Tool removed from favorites',
    'notification.copySuccess': 'Copied successfully',
    'notification.shareSuccess': 'Shared successfully',
    'notification.error': 'Operation failed, please try again',
    'notification.networkError': 'Network connection error',
    'notification.permissionDenied': 'Permission denied',
    
    // Dashboard
    'dashboard.title': 'Management Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.analytics': 'Analytics',
    'dashboard.tools': 'Tools Management',
    'dashboard.users': 'Users Management',
    'dashboard.settings': 'System Settings',
    'dashboard.totalTools': 'Total Tools',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.totalViews': 'Total Views',
    'dashboard.activeUsers': 'Active Users',
  },
  
  'ja-JP': {
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.search': '検索',
    'common.filter': 'フィルタ',
    'common.sort': 'ソート',
    'common.more': 'もっと見る',
    'common.less': '少なく',
    'common.next': '次へ',
    'common.prev': '前へ',
    'common.close': '閉じる',
    'common.open': '開く',
    'common.view': '表示',
    'common.share': '共有',
    'common.copy': 'コピー',
    'common.download': 'ダウンロード',
    'common.upload': 'アップロード',
    'common.install': 'インストール',
    'common.update': '更新',
    
    // Navigation
    'nav.home': 'ホーム',
    'nav.tools': 'ツール',
    'nav.categories': 'カテゴリ',
    'nav.favorites': 'お気に入り',
    'nav.search': '検索',
    'nav.settings': '設定',
    'nav.about': 'について',
    'nav.contact': 'お問い合わせ',
    'nav.help': 'ヘルプ',
    'nav.login': 'ログイン',
    'nav.logout': 'ログアウト',
    'nav.profile': 'プロフィール',
    'nav.dashboard': 'ダッシュボード',
    
    // Tools
    'tools.title': 'AIツールナビゲーター',
    'tools.subtitle': '最高のAIツールとアプリケーションを発見',
    'tools.search.placeholder': 'AIツールを検索...',
    'tools.filter.all': 'すべて',
    'tools.filter.free': '無料',
    'tools.filter.paid': '有料',
    'tools.filter.freemium': 'フリーミアム',
    'tools.sort.rating': '評価',
    'tools.sort.name': '名前',
    'tools.sort.date': '日付',
    'tools.sort.popularity': '人気',
    'tools.rating': '評価',
    'tools.visits': '訪問数',
    'tools.category': 'カテゴリ',
    'tools.pricing': '価格',
    'tools.features': '機能',
    'tools.description': '説明',
    'tools.website': 'ウェブサイトを訪問',
    'tools.addToFavorites': 'お気に入りに追加',
    'tools.removeFromFavorites': 'お気に入りから削除',
    'tools.share': 'ツールを共有',
    'tools.report': '報告',
    'tools.notFound': '一致するツールが見つかりません',
    'tools.loadMore': 'もっと読み込む',
    
    // Categories
    'categories.title': 'ツールカテゴリ',
    'categories.all': 'すべてのカテゴリ',
    'categories.popular': '人気のカテゴリ',
    'categories.toolCount': '{count} ツール',
    
    // User
    'user.favorites': 'マイお気に入り',
    'user.history': '閲覧履歴',
    'user.settings': 'ユーザー設定',
    'user.language': '言語設定',
    'user.theme': 'テーマ設定',
    'user.notifications': '通知設定',
    'user.privacy': 'プライバシー設定',
    'user.account': 'アカウント設定',
    
    // PWA
    'pwa.install': 'アプリをインストール',
    'pwa.update': 'アプリを更新',
    'pwa.offline': '現在オフライン状態です',
    'pwa.online': 'ネットワーク接続が復旧しました',
    'pwa.updateAvailable': '新しいバージョンが利用可能',
    'pwa.installPrompt': 'AIツールナビゲーターをデバイスにインストール',
    
    // SEO
    'seo.title': 'AIツールナビゲーター - 最高のAIツールとアプリケーションを発見',
    'seo.description': '最新で最高のAIツールを探索し発見してください。数千のAIアプリケーションをキュレーションし、完璧なAIソリューションを見つけるお手伝いをします。',
    'seo.keywords': 'AIツール, 人工知能, AIアプリケーション, 機械学習, 深層学習',
    
    // Time and Date
    'time.now': 'たった今',
    'time.minutesAgo': '{minutes} 分前',
    'time.hoursAgo': '{hours} 時間前',
    'time.daysAgo': '{days} 日前',
    'time.weeksAgo': '{weeks} 週間前',
    'time.monthsAgo': '{months} ヶ月前',
    'time.yearsAgo': '{years} 年前',
    
    // Notifications
    'notification.toolAdded': 'ツールがお気に入りに追加されました',
    'notification.toolRemoved': 'ツールがお気に入りから削除されました',
    'notification.copySuccess': 'コピーが成功しました',
    'notification.shareSuccess': '共有が成功しました',
    'notification.error': '操作に失敗しました。もう一度お試しください',
    'notification.networkError': 'ネットワーク接続エラー',
    'notification.permissionDenied': '許可が拒否されました',
    
    // Dashboard
    'dashboard.title': '管理ダッシュボード',
    'dashboard.overview': '概要',
    'dashboard.analytics': '分析',
    'dashboard.tools': 'ツール管理',
    'dashboard.users': 'ユーザー管理',
    'dashboard.settings': 'システム設定',
    'dashboard.totalTools': 'ツール総数',
    'dashboard.totalUsers': 'ユーザー総数',
    'dashboard.totalViews': '総表示回数',
    'dashboard.activeUsers': 'アクティブユーザー',
  }
} as const

// ==================== I18n Provider ====================

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Translation function
  const t: TranslationFunction = (key: string, values?: TranslationValues) => {
    const translation = translations[locale][key as keyof typeof translations[typeof locale]]
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`)
      return key
    }
    
    let result = translation as string
    
    // Replace placeholder values
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`{${placeholder}}`, 'g'), String(value))
      })
    }
    
    return result
  }

  // Set locale and update URL
  const setLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return
    
    setIsLoading(true)
    
    try {
      // Store locale preference
      localStorage.setItem('preferred-locale', newLocale)
      
      // Update state
      setLocaleState(newLocale)
      
      // Update URL
      const currentPath = pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '') || '/'
      const newPath = `/${newLocale}${currentPath}`
      
      router.push(newPath)
      
    } catch (error) {
      console.error('Failed to change locale:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format date
  const formatDate = (date: Date): string => {
    const format = localeMetadata[locale].dateFormat
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
  }

  // Format time
  const formatTime = (date: Date): string => {
    const format = localeMetadata[locale].timeFormat
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    if (format.includes('A')) {
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const hours12 = hours % 12 || 12
      return format
        .replace('h', String(hours12))
        .replace('mm', minutes)
        .replace('ss', seconds)
        .replace('A', ampm)
    } else {
      return format
        .replace('HH', String(hours).padStart(2, '0'))
        .replace('mm', minutes)
        .replace('ss', seconds)
    }
  }

  // Format number
  const formatNumber = (number: number): string => {
    const { decimal, thousands, precision } = localeMetadata[locale].numberFormat
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    }).format(number)
  }

  // Format currency
  const formatCurrency = (amount: number): string => {
    const currency = localeMetadata[locale].currency
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount)
  }

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    dir: localeMetadata[locale].dir,
    isLoading
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// ==================== Hooks ====================

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useI18n()
  return { t }
}

export function useLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

// ==================== Utilities ====================

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/')
  const localeSegment = segments[1]
  
  if (locales.includes(localeSegment as Locale)) {
    return localeSegment as Locale
  }
  
  return defaultLocale
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/')
  const localeSegment = segments[1]
  
  if (locales.includes(localeSegment as Locale)) {
    return '/' + segments.slice(2).join('/')
  }
  
  return pathname
}

export function addLocaleToPath(pathname: string, locale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname)
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
}

export function detectUserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  
  // Check stored preference
  const stored = localStorage.getItem('preferred-locale')
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale
  }
  
  // Check browser language
  const browserLocales = navigator.languages || [navigator.language]
  
  for (const browserLocale of browserLocales) {
    // Exact match
    if (locales.includes(browserLocale as Locale)) {
      return browserLocale as Locale
    }
    
    // Language match (e.g., 'en' -> 'en-US')
    const language = browserLocale.split('-')[0]
    const match = locales.find(l => l.startsWith(language))
    if (match) {
      return match
    }
  }
  
  return defaultLocale
}

// ==================== Advanced Utilities ====================

export class I18nUtils {
  static getRelativeTime(date: Date, locale: Locale): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
    
    const t = (key: string, values?: TranslationValues) => 
      translations[locale][key as keyof typeof translations[typeof locale]] as string
    
    if (diffMins < 1) return t('time.now')
    if (diffMins < 60) return t('time.minutesAgo', { minutes: diffMins })
    if (diffHours < 24) return t('time.hoursAgo', { hours: diffHours })
    if (diffDays < 7) return t('time.daysAgo', { days: diffDays })
    if (diffWeeks < 4) return t('time.weeksAgo', { weeks: diffWeeks })
    if (diffMonths < 12) return t('time.monthsAgo', { months: diffMonths })
    return t('time.yearsAgo', { years: diffYears })
  }
  
  static pluralize(count: number, key: string, locale: Locale): string {
    // Simple pluralization - could be extended for more complex rules
    const translation = translations[locale][key as keyof typeof translations[typeof locale]] as string
    return translation.replace('{count}', String(count))
  }
  
  static sortByLocale<T>(array: T[], getValue: (item: T) => string, locale: Locale): T[] {
    return array.sort((a, b) => {
      return getValue(a).localeCompare(getValue(b), locale)
    })
  }
}

export default I18nProvider

// NaviGuard-AI Security Audited - 2026-06-01
