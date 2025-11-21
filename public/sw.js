const CACHE_NAME = 'shortlist-v1'
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
]

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('Failed to cache:', err))
  )
})

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch strategy: Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP(S) requests (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone()
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache)
          })
        return response
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
