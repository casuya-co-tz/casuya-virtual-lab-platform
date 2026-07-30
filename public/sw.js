const CACHE_NAME = 'casuya-v3'
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/student',
  '/pricing',
  '/favicon.svg',
  '/manifest.json',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  if (request.url.includes('/api/vitals')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    )
    return
  }

  if (request.url.includes('/api/') && request.method === 'GET') {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      })
    )
    return
  }

  if (!request.url.startsWith(self.location.origin)) return
  if (request.method !== 'GET') return

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      }).catch(() => {
        if (cached) return cached
        return caches.match('/offline.html').then(r => r || new Response('Offline', { status: 503 }))
      })
      return cached || fetched
    }).catch(() => {})
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressQueue())
  }
})

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('casuya-offline', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('labs')) {
        db.createObjectStore('labs', { keyPath: 'labId' })
      }
      if (!db.objectStoreNames.contains('progress-queue')) {
        db.createObjectStore('progress-queue', { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function queueProgressUpdate(data) {
  try {
    const db = await openDB()
    const tx = db.transaction('progress-queue', 'readwrite')
    tx.objectStore('progress-queue').add({ ...data, queuedAt: Date.now() })
  } catch {}
}

async function syncProgressQueue() {
  try {
    const db = await openDB()
    const tx = db.transaction('progress-queue', 'readonly')
    const store = tx.objectStore('progress-queue')
    const request = store.getAll()
    const updates = await new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => resolve([])
    })

    for (const update of updates) {
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lab_id: update.lab_id, status: update.status, score: update.score }),
        })
        if (res.ok) {
          const db2 = await openDB()
          const tx2 = db2.transaction('progress-queue', 'readwrite')
          tx2.objectStore('progress-queue').delete(update.id)
        }
      } catch { break }
    }
  } catch {}
}
