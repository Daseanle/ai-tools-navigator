// AI Navigator Pro Service Worker
// Version: 1.0.0

const CACHE_NAME = 'ai-navigator-v1'
const OFFLINE_URL = '/offline'

// 预缓存的资源
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js'
]

// 缓存策略配置
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first', 
  images: 'stale-while-revalidate'
}

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 安装中...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 预缓存资源')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker 安装完成')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker 安装失败:', error)
      })
  )
})

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 激活中...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ 删除旧缓存:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker 激活完成')
        return self.clients.claim()
      })
  )
})

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return
  }

  // 处理导航请求
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request))
    return
  }

  // 处理静态资源
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'manifest') {
    event.respondWith(handleStatic(request))
    return
  }

  // 处理图片资源
  if (request.destination === 'image') {
    event.respondWith(handleImage(request))
    return
  }

  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPI(request))
    return
  }
})

// 导航请求处理 (HTML页面)
async function handleNavigate(request) {
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.log('📱 离线模式，返回缓存页面')
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 返回离线页面
    return cache.match(OFFLINE_URL)
  }
}

// 静态资源处理 (Cache First)
async function handleStatic(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error('静态资源加载失败:', error)
    throw error
  }
}

// 图片资源处理 (Stale While Revalidate)
async function handleImage(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      cache.put(request, networkResponse.clone())
      return networkResponse
    })
    .catch(() => cachedResponse)
  
  return cachedResponse || fetchPromise
}

// API请求处理 (Network First)
async function handleAPI(request) {
  try {
    const networkResponse = await fetch(request)
    
    // 只缓存GET请求的成功响应
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    if (request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    throw error
  }
}

// 推送通知处理
self.addEventListener('push', (event) => {
  console.log('📨 收到推送通知:', event)
  
  const options = {
    body: '您有新的AI工具推荐！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'explore',
        title: '立即查看',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: '稍后查看',
        icon: '/icons/icon-72x72.png'
      }
    ]
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      options.title = payload.title || 'AI Navigator Pro'
      options.body = payload.body || options.body
      options.data.url = payload.url || options.data.url
    } catch (error) {
      console.error('推送数据解析失败:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification('AI Navigator Pro', options)
  )
})

// 通知点击处理
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 通知被点击:', event)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data
  
  if (action === 'dismiss') {
    return
  }
  
  const url = data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // 查找已打开的窗口
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // 打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('🔄 后台同步:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// 执行后台同步
async function doBackgroundSync() {
  try {
    // 同步离线收藏
    await syncOfflineFavorites()
    
    // 同步用户行为数据
    await syncUserBehavior()
    
    console.log('✅ 后台同步完成')
  } catch (error) {
    console.error('❌ 后台同步失败:', error)
  }
}

// 同步离线收藏
async function syncOfflineFavorites() {
  // 获取离线存储的收藏数据
  const offlineFavorites = await getOfflineFavorites()
  
  if (offlineFavorites.length > 0) {
    try {
      await fetch('/api/favorites/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ favorites: offlineFavorites })
      })
      
      // 清除已同步的离线数据
      await clearOfflineFavorites()
    } catch (error) {
      console.error('收藏同步失败:', error)
    }
  }
}

// 同步用户行为数据
async function syncUserBehavior() {
  const behaviorData = await getOfflineBehaviorData()
  
  if (behaviorData.length > 0) {
    try {
      await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: behaviorData })
      })
      
      await clearOfflineBehaviorData()
    } catch (error) {
      console.error('行为数据同步失败:', error)
    }
  }
}

// IndexedDB 辅助函数
async function getOfflineFavorites() {
  // 简化实现，实际应使用 IndexedDB
  return []
}

async function clearOfflineFavorites() {
  // 清除离线收藏数据
}

async function getOfflineBehaviorData() {
  // 获取离线行为数据
  return []
}

async function clearOfflineBehaviorData() {
  // 清除离线行为数据
}

// 缓存管理
async function cleanupCache() {
  const cache = await caches.open(CACHE_NAME)
  const requests = await cache.keys()
  const now = Date.now()
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天
  
  for (const request of requests) {
    const response = await cache.match(request)
    const dateHeader = response?.headers.get('date')
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime()
      if (now - responseDate > maxAge) {
        await cache.delete(request)
      }
    }
  }
}

// 定期清理缓存
setInterval(cleanupCache, 24 * 60 * 60 * 1000) // 每24小时清理一次

console.log('🚀 AI Navigator Pro Service Worker 已加载')