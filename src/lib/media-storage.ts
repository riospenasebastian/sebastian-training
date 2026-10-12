// IndexedDB-based local media storage for custom gym exercise videos
// This avoids localStorage 5MB quota limits and allows recording/storing high quality videos on mobile

const DB_NAME = 'SebasGymMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'exercise_videos';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(id: string, file: Blob | File): Promise<string> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        id,
        blob: file,
        mimeType: file.type || 'video/mp4',
        name: (file as File).name || 'video.mp4',
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving video to IndexedDB:', err);
    throw err;
  }
}

export async function getVideoBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error reading video from IndexedDB:', err);
    return null;
  }
}

// In-memory cache of object URLs to avoid recreating them constantly
const objectUrlCache = new Map<string, string>();

export async function getVideoObjectUrl(id: string): Promise<string | null> {
  if (objectUrlCache.has(id)) {
    return objectUrlCache.get(id)!;
  }

  const blob = await getVideoBlob(id);
  if (!blob) return null;

  const url = URL.createObjectURL(blob);
  objectUrlCache.set(id, url);
  return url;
}

export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    if (objectUrlCache.has(id)) {
      URL.revokeObjectURL(objectUrlCache.get(id)!);
      objectUrlCache.delete(id);
    }
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error deleting video from IndexedDB:', err);
  }
}
