// PWA Configuration and Utilities
import { MetadataGenerator } from '@/lib/seo-optimizer'

// ==================== PWA Configuration ====================

export const pwaConfig = {
  name: 'AI Tools Navigator',
  shortName: 'AI Tools',
  description: '发现最佳AI工具和应用的专业导航平台',
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  scope: '/',
  startUrl: '/',
  
  // Icons
  icons: {
    '72': '/icons/icon-72x72.png',
    '96': '/icons/icon-96x96.png',
    '128': '/icons/icon-128x128.png',
    '144': '/icons/icon-144x144.png',
    '152': '/icons/icon-152x152.png',
    '192': '/icons/icon-192x192.png',
    '384': '/icons/icon-384x384.png',
    '512': '/icons/icon-512x512.png'
  },
  
  // App shortcuts
  shortcuts: [
    {
      name: '搜索工具',
      url: '/search',
      icon: '/icons/search-96x96.png'
    },
    {
      name: '工具分类',
      url: '/categories',
      icon: '/icons/categories-96x96.png'
    },
    {
      name: '收藏夹',
      url: '/favorites',
      icon: '/icons/favorites-96x96.png'
    }
  ],
  
  // Categories
  categories: ['productivity', 'utilities', 'education'],
  
  // Cache settings
  cache: {
    staticCacheName: 'ai-tools-static-v1',
    dynamicCacheName: 'ai-tools-dynamic-v1',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100
  },
  
  // Notification settings
  notifications: {
    enabled: true,
    badge: '/icons/badge-72x72.png',
    actions: [
      {
        action: 'view',
        title: '查看',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/icons/dismiss.png'
      }
    ]
  }
}

// ==================== PWA Utilities ====================

export class PWAUtils {
  static generateManifest() {
    return {
      name: pwaConfig.name,
      short_name: pwaConfig.shortName,
      description: pwaConfig.description,
      start_url: pwaConfig.startUrl,
      display: pwaConfig.display,
      background_color: pwaConfig.backgroundColor,
      theme_color: pwaConfig.themeColor,
      orientation: pwaConfig.orientation,
      scope: pwaConfig.scope,
      lang: 'zh-CN',
      dir: 'ltr',
      categories: pwaConfig.categories,
      
      icons: Object.entries(pwaConfig.icons).map(([size, src]) => ({
        src,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'maskable any'
      })),
      
      shortcuts: pwaConfig.shortcuts.map(shortcut => ({
        name: shortcut.name,
        short_name: shortcut.name,
        description: shortcut.name,
        url: shortcut.url,
        icons: shortcut.icon ? [{ src: shortcut.icon, sizes: '96x96' }] : undefined
      })),
      
      prefer_related_applications: false,
      
      screenshots: [
        {
          src: '/images/screenshot-mobile.png',
          sizes: '390x844',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Mobile Screenshot'
        },
        {
          src: '/images/screenshot-desktop.png',
          sizes: '1920x1080',
          type: 'image/png',
          form_factor: 'wide',
          label: 'Desktop Screenshot'
        }
      ]
    }
  }

  static async checkSupport(): Promise<{
    serviceWorker: boolean
    pushNotifications: boolean
    backgroundSync: boolean
    installPrompt: boolean
    storage: boolean
  }> {
    const support = {
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'Notification' in window && 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      storage: 'storage' in navigator && 'estimate' in navigator.storage
    }

    return support
  }

  static async getInstallationStatus(): Promise<{
    isInstalled: boolean
    isInstallable: boolean
    platform: string
  }> {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       window.matchMedia('(display-mode: fullscreen)').matches ||
                       (window.navigator as any).standalone === true

    const platform = this.detectPlatform()
    
    return {
      isInstalled,
      isInstallable: !isInstalled && this.canInstall(),
      platform
    }
  }

  private static canInstall(): boolean {
    // Check if PWA can be installed based on platform
    const userAgent = navigator.userAgent.toLowerCase()
    
    // Chrome on Android
    if (userAgent.includes('chrome') && userAgent.includes('android')) {
      return true
    }
    
    // Safari on iOS (iOS 16.4+)
    if (userAgent.includes('safari') && userAgent.includes('iphone')) {
      return true
    }
    
    // Chrome on desktop
    if (userAgent.includes('chrome') && !userAgent.includes('mobile')) {
      return true
    }
    
    return false
  }

  public static detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios'
    } else if (userAgent.includes('android')) {
      return 'android'
    } else if (userAgent.includes('windows')) {
      return 'windows'
    } else if (userAgent.includes('mac')) {
      return 'mac'
    } else if (userAgent.includes('linux')) {
      return 'linux'
    } else {
      return 'unknown'
    }
  }

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (Notification.permission !== 'default') {
      return Notification.permission
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  static async getStorageUsage(): Promise<{
    used: number
    quota: number
    percentage: number
    details: any
  } | null> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (used / quota) * 100 : 0

      return {
        used,
        quota,
        percentage,
        details: estimate
      }
    } catch (error) {
      console.error('Failed to get storage estimate:', error)
      return null
    }
  }

  static async clearStorage(): Promise<void> {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }

      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        // This would clear app-specific IndexedDB databases
        console.log('IndexedDB clearing not implemented')
      }

      // Clear localStorage
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  static getPerformanceMetrics(): {
    loadTime: number
    domContentLoaded: number
    firstPaint: number
    firstContentfulPaint: number
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0
    const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0

    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint,
      firstContentfulPaint
    }
  }
}

// ==================== PWA Installation Banner ====================

export function createInstallBanner(): HTMLElement | null {
  if (typeof window === 'undefined') return null

  const banner = document.createElement('div')
  banner.className = 'pwa-install-banner'
  banner.innerHTML = `
    <div class="pwa-banner-content">
      <div class="pwa-banner-icon">📱</div>
      <div class="pwa-banner-text">
        <h3>安装应用</h3>
        <p>安装AI工具导航到您的设备，享受更快的访问速度。</p>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-install-btn">安装</button>
        <button class="pwa-dismiss-btn">×</button>
      </div>
    </div>
  `

  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    .pwa-install-banner {
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .pwa-banner-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }
    
    .pwa-banner-icon {
      font-size: 24px;
    }
    
    .pwa-banner-text {
      flex: 1;
    }
    
    .pwa-banner-text h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .pwa-banner-text p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    
    .pwa-banner-actions {
      display: flex;
      gap: 8px;
    }
    
    .pwa-install-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }
    
    .pwa-dismiss-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #999;
      padding: 4px 8px;
    }
    
    @media (max-width: 640px) {
      .pwa-install-banner {
        left: 10px;
        right: 10px;
      }
    }
  `

  document.head.appendChild(style)
  return banner
}

// ==================== PWA Metrics ====================

export class PWAMetrics {
  private static metrics: Record<string, any> = {}

  static record(name: string, value: any, tags: Record<string, string> = {}) {
    this.metrics[name] = {
      value,
      timestamp: Date.now(),
      tags
    }
  }

  static get(name: string) {
    return this.metrics[name]
  }

  static getAll() {
    return { ...this.metrics }
  }

  static clear() {
    this.metrics = {}
  }

  static async sendToAnalytics() {
    try {
      await fetch('/api/analytics/pwa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: this.metrics,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          platform: PWAUtils.detectPlatform()
        })
      })
      
      this.clear()
    } catch (error) {
      console.error('Failed to send PWA metrics:', error)
    }
  }
}

export default PWAUtils

// NaviGuard-AI Security Audited - 2026-06-01
