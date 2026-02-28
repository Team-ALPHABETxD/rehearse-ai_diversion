const DB_NAME = "rehearse_recordings"
const DB_VERSION = 1
const STORE_NAME = "recordings"

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true })
        store.createIndex("createdAt", "createdAt", { unique: false })
        store.createIndex("type", "type", { unique: false })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function saveRecording({ blob, mimeType, createdAt, durationSec, type }) {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)

  const payload = {
    type: type || "interview",
    createdAt: createdAt || Date.now(),
    mimeType: mimeType || blob?.type || "video/webm",
    durationSec: typeof durationSec === "number" ? durationSec : null,
    sizeBytes: blob?.size ?? null,
    blob,
  }

  const id = await requestToPromise(store.add(payload))
  await txDone(tx)
  db.close()
  return { id, ...payload }
}

export async function listRecordings({ type } = {}) {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, "readonly")
  const store = tx.objectStore(STORE_NAME)
  const all = await requestToPromise(store.getAll())
  await txDone(tx)
  db.close()

  const filtered = type ? all.filter((r) => r.type === type) : all
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  return filtered
}

export async function deleteRecording(id) {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, "readwrite")
  const store = tx.objectStore(STORE_NAME)
  await requestToPromise(store.delete(id))
  await txDone(tx)
  db.close()
}

