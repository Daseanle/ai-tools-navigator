// Service Worker for PWA
const CACHE_NAME = 'ai-tools-navigator-v1'
const STATIC_CACHE_NAME = 'ai-tools-static-v1'
const DYNAMIC_CACHE_NAME = 'ai-tools-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
]

// API routes to cache
const API_CACHE_PATTERNS = [
  /^\/api\/tools/,
  /^\/api\/categories/,
  /^\/api\/search/
]

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 3000

// Install Event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll([
          '/',
          '/offline.html'
        ])
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete')
      return self.skipWaiting()
    })
  )
})

// Activate Event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating')
  
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName \!== CACHE_NAME && 
                cacheName \!== STATIC_CACHE_NAME && 
                cacheName \!== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete')
    })
  )
})

// Fetch Event
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  if (\!request.url.startsWith('http')) {
    return
  }
  
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request))
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request))
  } else {
    event.respondWith(handleOtherRequest(request))
  }
})

// Request Handlers
async function handleAPIRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME
  
  try {
    const networkResponse = await Promise.race([
      fetch(request.clone()),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ])
    
    if (request.method === 'GET' && networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request.clone(), networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: '当前处于离线状态，请稍后重试'
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request.clone(), networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 })
  }
}

async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request.clone(), networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const offlineResponse = await caches.match('/offline.html')
    return offlineResponse || new Response('Offline', { status: 503 })
  }
}

async function handleOtherRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Request failed', { status: 503 })
  }
}

// Helper Functions
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)
}

function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept')?.includes('text/html')
}

// Message Handling
self.addEventListener('message', event => {
  const { data } = event
  
  if (data && data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting')
    self.skipWaiting()
  }
})
EOF < /dev/null