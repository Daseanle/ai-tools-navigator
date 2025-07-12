// Progressive Web App Implementation
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, RefreshCw, Wifi, WifiOff, Bell, Settings } from 'lucide-react'

// ==================== PWA Manager ====================

export class PWAManager {
  private static instance: PWAManager
  private registration: ServiceWorkerRegistration | null = null
  private isOnline: boolean = true
  private updateAvailable: boolean = false
  private deferredPrompt: any = null

  static getInstance(): PWAManager {
    if (!this.instance) {
      this.instance = new PWAManager()
    }
    return this.instance
  }

  async initialize() {
    if (typeof window === 'undefined') return

    // Register service worker
    await this.registerServiceWorker()
    
    // Setup online/offline detection
    this.setupNetworkDetection()
    
    // Setup install prompt handling
    this.setupInstallPrompt()
    
    // Setup update detection
    this.setupUpdateDetection()
    
    // Setup background sync
    this.setupBackgroundSync()
    
    // Setup push notifications
    this.setupPushNotifications()
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        console.log('Service Worker registered:', this.registration.scope)
        
        // Check for updates
        this.registration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate()
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  private setupNetworkDetection() {
    this.isOnline = navigator.onLine
    
    window.addEventListener('online', () => {
      this.isOnline = true
      this.dispatchEvent('network-status-changed', { online: true })
      this.syncOfflineData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.dispatchEvent('network-status-changed', { online: false })
    })
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.dispatchEvent('install-prompt-available', { prompt: e })
    })
    
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      this.dispatchEvent('app-installed', {})
    })
  }

  private setupUpdateDetection() {
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true
              this.dispatchEvent('update-available', {})
            }
          })
        }
      })
    }
  }

  private setupBackgroundSync() {
    // Register background sync for offline actions
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as any).sync.register('background-sync').catch(console.error)
      })
    }
  }

  private async setupPushNotifications() {
    // Only setup push notifications if VAPID keys are configured
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.log('Push notifications disabled: VAPID keys not configured')
      return
    }
    
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        this.subscribeToNotifications()
      }
    }
  }

  private async subscribeToNotifications() {
    if (!this.registration) return
    
    // Double-check VAPID key before subscription
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      console.error('Cannot subscribe to push notifications: VAPID public key not configured')
      return
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  private handleServiceWorkerUpdate() {
    this.updateAvailable = true
    this.dispatchEvent('update-available', {})
  }

  private async syncOfflineData() {
    // Sync any offline data when coming back online
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        (registration as any).sync.register('sync-offline-data')
      })
    }
  }

  private dispatchEvent(eventName: string, data: any) {
    window.dispatchEvent(new CustomEvent(`pwa-${eventName}`, { detail: data }))
  }

  // Public methods
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt()
      const result = await this.deferredPrompt.userChoice
      this.deferredPrompt = null
      return result.outcome === 'accepted'
    }
    return false
  }

  async updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  isInstallable(): boolean {
    return this.deferredPrompt !== null
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable
  }

  isOnlineStatus(): boolean {
    return this.isOnline
  }

  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate()
    }
    return null
  }

  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
  }
}

// ==================== PWA Status Component ====================

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [storageInfo, setStorageInfo] = useState<any>(null)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const pwaManager = PWAManager.getInstance()
    pwaManager.initialize()

    // Update initial state
    setIsOnline(pwaManager.isOnlineStatus())
    setIsInstallable(pwaManager.isInstallable())
    setIsUpdateAvailable(pwaManager.isUpdateAvailable())

    // Load storage info
    pwaManager.getStorageEstimate().then(setStorageInfo)

    // Listen for PWA events
    const handleNetworkChange = (e: any) => setIsOnline(e.detail.online)
    const handleInstallPrompt = () => setIsInstallable(true)
    const handleAppInstalled = () => setIsInstallable(false)
    const handleUpdateAvailable = () => setIsUpdateAvailable(true)

    window.addEventListener('pwa-network-status-changed', handleNetworkChange)
    window.addEventListener('pwa-install-prompt-available', handleInstallPrompt)
    window.addEventListener('pwa-app-installed', handleAppInstalled)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-network-status-changed', handleNetworkChange)
      window.removeEventListener('pwa-install-prompt-available', handleInstallPrompt)
      window.removeEventListener('pwa-app-installed', handleAppInstalled)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    const pwaManager = PWAManager.getInstance()
    const installed = await pwaManager.installApp()
    setIsInstalling(false)
    if (installed) {
      setIsInstallable(false)
    }
  }

  const handleUpdate = async () => {
    const pwaManager = PWAManager.getInstance()
    await pwaManager.updateApp()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          PWA状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">网络状态</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  在线
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <Badge variant="destructive">离线</Badge>
              </>
            )}
          </div>
        </div>

        {/* Install Status */}
        {isInstallable && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">安装应用</span>
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isInstalling ? '安装中...' : '安装'}
            </Button>
          </div>
        )}

        {/* Update Status */}
        {isUpdateAvailable && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">应用更新</span>
            <Button
              onClick={handleUpdate}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              更新
            </Button>
          </div>
        )}

        {/* Storage Info */}
        {storageInfo && (
          <div className="space-y-2">
            <span className="text-sm font-medium">存储使用情况</span>
            <div className="text-xs text-gray-600">
              <div>已使用: {(storageInfo.usage / 1024 / 1024).toFixed(2)} MB</div>
              <div>配额: {(storageInfo.quota / 1024 / 1024 / 1024).toFixed(2)} GB</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(storageInfo.usage / storageInfo.quota) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== Offline Indicator ====================

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 md:left-auto md:w-auto">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm">您当前处于离线状态</span>
      </div>
    </div>
  )
}

// ==================== Install Prompt ====================

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    const handleInstallPrompt = () => setShowPrompt(true)
    const handleAppInstalled = () => setShowPrompt(false)
    
    window.addEventListener('pwa-install-prompt-available', handleInstallPrompt)
    window.addEventListener('pwa-app-installed', handleAppInstalled)
    
    return () => {
      window.removeEventListener('pwa-install-prompt-available', handleInstallPrompt)
      window.removeEventListener('pwa-app-installed', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    const pwaManager = PWAManager.getInstance()
    const installed = await pwaManager.installApp()
    setIsInstalling(false)
    if (installed) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 md:left-auto md:max-w-sm">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">安装应用</h3>
            <p className="text-xs text-gray-600 mt-1">
              安装AI工具导航到您的设备，享受更快的访问速度和离线功能。
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="text-xs"
              >
                {isInstalling ? '安装中...' : '安装'}
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                稍后
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Update Banner ====================

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    const handleUpdateAvailable = () => setShowUpdate(true)
    
    window.addEventListener('pwa-update-available', handleUpdateAvailable)
    
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const handleUpdate = async () => {
    const pwaManager = PWAManager.getInstance()
    await pwaManager.updateApp()
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 md:left-auto md:max-w-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">新版本可用</h3>
          <p className="text-xs opacity-90">点击更新以获取最新功能</p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            onClick={handleUpdate}
            size="sm"
            variant="secondary"
            className="text-xs"
          >
            更新
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-xs text-white hover:text-white hover:bg-white/20"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}

// ==================== PWA Hooks ====================

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    const pwaManager = PWAManager.getInstance()
    
    const handleNetworkChange = (e: any) => setIsOnline(e.detail.online)
    const handleInstallPrompt = () => setIsInstallable(true)
    const handleAppInstalled = () => setIsInstallable(false)
    const handleUpdateAvailable = () => setIsUpdateAvailable(true)

    window.addEventListener('pwa-network-status-changed', handleNetworkChange)
    window.addEventListener('pwa-install-prompt-available', handleInstallPrompt)
    window.addEventListener('pwa-app-installed', handleAppInstalled)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-network-status-changed', handleNetworkChange)
      window.removeEventListener('pwa-install-prompt-available', handleInstallPrompt)
      window.removeEventListener('pwa-app-installed', handleAppInstalled)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const installApp = async () => {
    const pwaManager = PWAManager.getInstance()
    return await pwaManager.installApp()
  }

  const updateApp = async () => {
    const pwaManager = PWAManager.getInstance()
    await pwaManager.updateApp()
  }

  return {
    isOnline,
    isInstallable,
    isUpdateAvailable,
    installApp,
    updateApp
  }
}

export default PWAManager