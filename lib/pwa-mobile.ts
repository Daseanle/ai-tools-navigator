/**
 * PWA (Progressive Web App) 配置和移动端优化
 * 支持离线访问、推送通知、原生应用体验
 */

export interface PWAConfig {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation: 'portrait' | 'landscape' | 'any'
  startUrl: string
  scope: string
  icons: {
    src: string
    sizes: string
    type: string
    purpose?: 'any' | 'maskable' | 'badge'
  }[]
  shortcuts: {
    name: string
    shortName: string
    description: string
    url: string
    icons: { src: string; sizes: string }[]
  }[]
  categories: string[]
}

export interface ServiceWorkerConfig {
  version: string
  cacheName: string
  cacheStrategies: {
    static: 'cache-first' | 'network-first' | 'stale-while-revalidate'
    api: 'cache-first' | 'network-first' | 'network-only'
    images: 'cache-first' | 'network-first' | 'stale-while-revalidate'
  }
  offlinePages: string[]
  precacheAssets: string[]
  maxCacheSize: number
  maxCacheAge: number
}

export interface MobileOptimization {
  touchOptimization: {
    minTouchTargetSize: number
    touchFeedback: boolean
    gestureSupport: boolean
  }
  performanceOptimization: {
    lazyLoading: boolean
    imageOptimization: boolean
    codesplitting: boolean
    prefetching: boolean
  }
  uiOptimization: {
    responsiveBreakpoints: Record<string, number>
    mobileFirstDesign: boolean
    adaptiveNavigation: boolean
    swipeGestures: boolean
  }
  networkOptimization: {
    compressionEnabled: boolean
    requestBatching: boolean
    offlineSupport: boolean
    backgroundSync: boolean
  }
}

export class PWAManager {
  private config: PWAConfig
  private serviceWorkerConfig: ServiceWorkerConfig
  private mobileConfig: MobileOptimization
  private isInstalled: boolean = false
  private deferredPrompt: any = null

  constructor() {
    this.config = this.getDefaultPWAConfig()
    this.serviceWorkerConfig = this.getDefaultSWConfig()
    this.mobileConfig = this.getDefaultMobileConfig()
    this.initializePWA()
  }

  // 获取默认PWA配置
  private getDefaultPWAConfig(): PWAConfig {
    return {
      name: 'AI Navigator Pro - 智能AI工具导航平台',
      shortName: 'AI Navigator',
      description: '发现、评测、精通最新AI工具，提升工作效率的智能导航平台',
      themeColor: '#1e40af',
      backgroundColor: '#0a0a0a',
      display: 'standalone',
      orientation: 'portrait',
      startUrl: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: '搜索AI工具',
          shortName: '搜索',
          description: '快速搜索AI工具',
          url: '/search',
          icons: [{ src: '/icons/search-96x96.png', sizes: '96x96' }]
        },
        {
          name: '工具分类',
          shortName: '分类',
          description: '浏览工具分类',
          url: '/categories',
          icons: [{ src: '/icons/categories-96x96.png', sizes: '96x96' }]
        },
        {
          name: '我的收藏',
          shortName: '收藏',
          description: '查看收藏的工具',
          url: '/dashboard/favorites',
          icons: [{ src: '/icons/favorites-96x96.png', sizes: '96x96' }]
        },
        {
          name: '热门工具',
          shortName: '热门',
          description: '查看热门AI工具',
          url: '/tools?sort=trending',
          icons: [{ src: '/icons/trending-96x96.png', sizes: '96x96' }]
        }
      ],
      categories: ['productivity', 'ai', 'tools', 'technology']
    }
  }

  // 获取默认Service Worker配置
  private getDefaultSWConfig(): ServiceWorkerConfig {
    return {
      version: '1.0.0',
      cacheName: 'ai-navigator-v1',
      cacheStrategies: {
        static: 'cache-first',
        api: 'network-first',
        images: 'stale-while-revalidate'
      },
      offlinePages: ['/', '/offline', '/categories', '/tools'],
      precacheAssets: [
        '/',
        '/manifest.json',
        '/offline',
        '/static/css/globals.css',
        '/static/js/main.js'
      ],
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      maxCacheAge: 7 * 24 * 60 * 60 * 1000 // 7天
    }
  }

  // 获取默认移动端配置
  private getDefaultMobileConfig(): MobileOptimization {
    return {
      touchOptimization: {
        minTouchTargetSize: 44, // 44px iOS标准
        touchFeedback: true,
        gestureSupport: true
      },
      performanceOptimization: {
        lazyLoading: true,
        imageOptimization: true,
        codesplitting: true,
        prefetching: true
      },
      uiOptimization: {
        responsiveBreakpoints: {
          mobile: 640,
          tablet: 768,
          laptop: 1024,
          desktop: 1280
        },
        mobileFirstDesign: true,
        adaptiveNavigation: true,
        swipeGestures: true
      },
      networkOptimization: {
        compressionEnabled: true,
        requestBatching: true,
        offlineSupport: true,
        backgroundSync: true
      }
    }
  }

  // 初始化PWA
  private async initializePWA(): Promise<void> {
    try {
      // 注册Service Worker
      await this.registerServiceWorker()
      
      // 设置安装提示
      this.setupInstallPrompt()
      
      // 初始化推送通知
      await this.initializePushNotifications()
      
      // 设置移动端优化
      this.setupMobileOptimizations()
      
      // 设置离线支持
      this.setupOfflineSupport()
      
      console.log('✅ PWA初始化完成')
    } catch (error) {
      console.error('❌ PWA初始化失败:', error)
    }
  }

  // 注册Service Worker
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('Service Worker注册成功:', registration.scope)
        
        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable()
              }
            })
          }
        })
        
      } catch (error) {
        console.error('Service Worker注册失败:', error)
      }
    }
  }

  // 设置安装提示
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallBanner()
    })

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.hideInstallBanner()
      this.trackInstallEvent()
    })
  }

  // 显示安装横幅
  private showInstallBanner(): void {
    // 创建安装提示UI
    const banner = document.createElement('div')
    banner.id = 'install-banner'
    banner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between'
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        </div>
        <div>
          <div class="font-semibold">安装AI Navigator</div>
          <div class="text-sm opacity-90">获得更快的访问速度和离线体验</div>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="install-dismiss" class="px-3 py-1 text-sm opacity-75 hover:opacity-100">稍后</button>
        <button id="install-accept" class="px-4 py-2 bg-white text-blue-600 rounded font-medium text-sm hover:bg-gray-100">安装</button>
      </div>
    `
    
    document.body.appendChild(banner)
    
    // 绑定事件
    document.getElementById('install-accept')?.addEventListener('click', () => {
      this.installApp()
    })
    
    document.getElementById('install-dismiss')?.addEventListener('click', () => {
      this.hideInstallBanner()
    })
  }

  // 隐藏安装横幅
  private hideInstallBanner(): void {
    const banner = document.getElementById('install-banner')
    if (banner) {
      banner.remove()
    }
  }

  // 安装应用
  async installApp(): Promise<void> {
    if (!this.deferredPrompt) return
    
    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('用户接受了安装提示')
      } else {
        console.log('用户拒绝了安装提示')
      }
      
      this.deferredPrompt = null
      this.hideInstallBanner()
    } catch (error) {
      console.error('安装应用失败:', error)
    }
  }

  // 初始化推送通知
  private async initializePushNotifications(): Promise<void> {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission()
        
        if (permission === 'granted') {
          console.log('推送通知权限已获取')
          await this.subscribeToPushNotifications()
        }
      } catch (error) {
        console.error('推送通知初始化失败:', error)
      }
    }
  }

  // 订阅推送通知
  private async subscribeToPushNotifications(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      })
      
      // 发送订阅信息到服务器
      await this.sendSubscriptionToServer(subscription)
      
      console.log('推送通知订阅成功')
    } catch (error) {
      console.error('推送通知订阅失败:', error)
    }
  }

  // VAPID密钥转换
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  // 发送订阅信息到服务器
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('发送订阅信息失败:', error)
    }
  }

  // 设置移动端优化
  private setupMobileOptimizations(): void {
    // 设置视口meta标签
    this.setupViewportMeta()
    
    // 设置触摸优化
    this.setupTouchOptimizations()
    
    // 设置手势支持
    this.setupGestureSupport()
    
    // 设置性能优化
    this.setupPerformanceOptimizations()
  }

  // 设置视口meta标签
  private setupViewportMeta(): void {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    
    if (!viewport) {
      viewport = document.createElement('meta')
      viewport.name = 'viewport'
      document.head.appendChild(viewport)
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no'
  }

  // 设置触摸优化
  private setupTouchOptimizations(): void {
    // 添加触摸反馈样式
    const style = document.createElement('style')
    style.textContent = `
      .touch-target {
        min-width: ${this.mobileConfig.touchOptimization.minTouchTargetSize}px;
        min-height: ${this.mobileConfig.touchOptimization.minTouchTargetSize}px;
        touch-action: manipulation;
      }
      
      .touch-feedback:active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
      }
      
      /* 禁用300ms点击延迟 */
      a, button, input, select, textarea {
        touch-action: manipulation;
      }
      
      /* 优化滚动性能 */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
    `
    
    document.head.appendChild(style)
  }

  // 设置手势支持
  private setupGestureSupport(): void {
    if (!this.mobileConfig.uiOptimization.swipeGestures) return
    
    let startX: number
    let startY: number
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }, { passive: true })
    
    document.addEventListener('touchend', (e) => {
      if (!startX || !startY) return
      
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      
      const deltaX = endX - startX
      const deltaY = endY - startY
      
      // 检测滑动手势
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.handleSwipeRight()
        } else {
          this.handleSwipeLeft()
        }
      }
    }, { passive: true })
  }

  // 处理右滑手势
  private handleSwipeRight(): void {
    // 可以实现返回功能
    if (window.history.length > 1) {
      window.history.back()
    }
  }

  // 处理左滑手势
  private handleSwipeLeft(): void {
    // 可以实现前进功能或侧边栏开关
    console.log('左滑手势')
  }

  // 设置性能优化
  private setupPerformanceOptimizations(): void {
    // 图片懒加载
    if (this.mobileConfig.performanceOptimization.lazyLoading) {
      this.setupLazyLoading()
    }
    
    // 预加载关键资源
    if (this.mobileConfig.performanceOptimization.prefetching) {
      this.setupPrefetching()
    }
  }

  // 设置图片懒加载
  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
            }
          }
        })
      })
      
      // 观察所有带有data-src的图片
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img)
      })
    }
  }

  // 设置预加载
  private setupPrefetching(): void {
    // 预加载关键页面
    const criticalPages = ['/tools', '/categories', '/search']
    
    criticalPages.forEach(page => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = page
      document.head.appendChild(link)
    })
  }

  // 设置离线支持
  private setupOfflineSupport(): void {
    // 监听在线/离线状态
    window.addEventListener('online', () => {
      this.handleOnline()
    })
    
    window.addEventListener('offline', () => {
      this.handleOffline()
    })
    
    // 初始状态检查
    if (!navigator.onLine) {
      this.handleOffline()
    }
  }

  // 处理在线状态
  private handleOnline(): void {
    console.log('网络连接已恢复')
    this.hideOfflineMessage()
    this.syncOfflineData()
  }

  // 处理离线状态
  private handleOffline(): void {
    console.log('网络连接已断开')
    this.showOfflineMessage()
  }

  // 显示离线消息
  private showOfflineMessage(): void {
    const message = document.createElement('div')
    message.id = 'offline-message'
    message.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-black p-3 text-center z-50'
    message.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>您当前处于离线状态，部分功能可能受限</span>
      </div>
    `
    
    document.body.appendChild(message)
  }

  // 隐藏离线消息
  private hideOfflineMessage(): void {
    const message = document.getElementById('offline-message')
    if (message) {
      message.remove()
    }
  }

  // 同步离线数据
  private async syncOfflineData(): Promise<void> {
    try {
      // 这里可以实现离线数据同步逻辑
      console.log('开始同步离线数据...')
    } catch (error) {
      console.error('离线数据同步失败:', error)
    }
  }

  // 显示更新可用提示
  private showUpdateAvailable(): void {
    const notification = document.createElement('div')
    notification.id = 'update-notification'
    notification.className = 'fixed bottom-20 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50'
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="font-semibold">新版本可用</div>
          <div class="text-sm opacity-90">点击更新以获得最新功能</div>
        </div>
        <button id="update-button" class="px-4 py-2 bg-white text-green-600 rounded font-medium text-sm hover:bg-gray-100">
          更新
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    document.getElementById('update-button')?.addEventListener('click', () => {
      this.updateApp()
    })
  }

  // 更新应用
  private updateApp(): void {
    window.location.reload()
  }

  // 追踪安装事件
  private trackInstallEvent(): void {
    // 发送安装事件到分析系统
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installed'
      })
    }
  }

  // 获取PWA状态
  getPWAStatus(): {
    isInstalled: boolean
    isStandalone: boolean
    hasServiceWorker: boolean
    supportsNotifications: boolean
    isOnline: boolean
  } {
    return {
      isInstalled: this.isInstalled,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: 'serviceWorker' in navigator,
      supportsNotifications: 'Notification' in window,
      isOnline: navigator.onLine
    }
  }

  // 发送推送通知
  async sendPushNotification(data: {
    title: string
    body: string
    icon?: string
    badge?: string
    tag?: string
    url?: string
  }): Promise<void> {
    try {
      await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('发送推送通知失败:', error)
    }
  }

  // 生成Manifest文件
  generateManifest(): PWAConfig {
    return this.config
  }

  // 更新PWA配置
  updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// 导出默认实例
export const pwaManager = new PWAManager()

// NaviGuard-AI Security Audited - 2026-06-01
