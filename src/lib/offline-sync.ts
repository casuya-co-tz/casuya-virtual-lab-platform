const DB_NAME = 'casuya-offline'
const DB_VERSION = 1
const LAB_STORE = 'labs'
const PROGRESS_STORE = 'progress-queue'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LAB_STORE)) {
        db.createObjectStore(LAB_STORE, { keyPath: 'labId' })
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

export async function saveLabOffline(labId: string, labData: { title: string; code: string; subject: string }) {
  const db = await openDB()
  const tx = db.transaction(LAB_STORE, 'readwrite')
  tx.objectStore(LAB_STORE).put({ labId, ...labData, cachedAt: Date.now() })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getLabOffline(labId: string): Promise<{ title: string; code: string; subject: string } | null> {
  const db = await openDB()
  const tx = db.transaction(LAB_STORE, 'readonly')
  const request = tx.objectStore(LAB_STORE).get(labId)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function queueProgressUpdate(update: { labId: string; status: string; score: number; completionData?: unknown }) {
  const db = await openDB()
  const tx = db.transaction(PROGRESS_STORE, 'readwrite')
  tx.objectStore(PROGRESS_STORE).add({ ...update, queuedAt: Date.now() })
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getQueuedUpdates(): Promise<Array<{ id: number; labId: string; status: string; score: number; completionData?: unknown; queuedAt: number }>> {
  const db = await openDB()
  const tx = db.transaction(PROGRESS_STORE, 'readonly')
  const request = tx.objectStore(PROGRESS_STORE).getAll()
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function clearQueuedUpdate(id: number) {
  const db = await openDB()
  const tx = db.transaction(PROGRESS_STORE, 'readwrite')
  tx.objectStore(PROGRESS_STORE).delete(id)
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncQueuedUpdates() {
  if (!navigator.onLine) return

  const updates = await getQueuedUpdates()
  for (const update of updates) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_id: update.labId, status: update.status, score: update.score, completion_data: update.completionData }),
      })
      if (res.ok) await clearQueuedUpdate(update.id)
    } catch {
      break
    }
  }
}

export async function getCachedLabCount(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(LAB_STORE, 'readonly')
  const request = tx.objectStore(LAB_STORE).count()
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearOfflineCache() {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction([LAB_STORE, PROGRESS_STORE], 'readwrite')
    tx.objectStore(LAB_STORE).clear()
    tx.objectStore(PROGRESS_STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}
