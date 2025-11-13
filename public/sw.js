self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(
        [
          '/',
          '/assets/',
          '/index.html',
          '/manifest.json',
          '/apple-touch-icon.png',
          '/favicon.ico',
        ]
      )
    })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})
