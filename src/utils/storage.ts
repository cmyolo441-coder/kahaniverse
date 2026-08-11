import { SavedStoryProject } from '../types';

const DB_NAME = 'KahaniVerseDB';
const STORE_NAME = 'story_history';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a new project into IndexedDB history. Keeps only the last 5 projects.
 */
export async function saveProjectToHistory(project: SavedStoryProject): Promise<SavedStoryProject[]> {
  try {
    const db = await openDB();
    const existing = await getAllHistoryProjects();

    // Remove if project ID already exists
    const filtered = existing.filter((p) => p.id !== project.id);
    // Add new project to top
    filtered.unshift(project);

    // Keep max 5 projects
    const toKeep = filtered.slice(0, 5);
    const toDelete = filtered.slice(5);

    // Perform transaction
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Save project
    store.put(project);

    // Clean up older than 5
    for (const oldProj of toDelete) {
      store.delete(oldProj.id);
    }

    await new Promise((resolve) => {
      tx.oncomplete = resolve;
    });

    return toKeep;
  } catch (err) {
    console.error('Failed to save project to IndexedDB history:', err);
    return [];
  }
}

/**
 * Fetch all saved projects from IndexedDB history (max 5) sorted by newest first
 */
export async function getAllHistoryProjects(): Promise<SavedStoryProject[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const projects = (request.result as SavedStoryProject[]) || [];
        // Sort descending by createdAt
        projects.sort((a, b) => b.createdAt - a.createdAt);

        // Generate fresh ObjectURLs for blobs because old stored blob: URLs expire after browser session
        const formatted = projects.slice(0, 5).map((p) => {
          let url = '';
          if (p.audioBlob) {
            try {
              const freshBlob = new Blob([p.audioBlob], { type: 'audio/wav' });
              url = URL.createObjectURL(freshBlob);
            } catch {
              url = p.audioUrl || '';
            }
          } else {
            url = p.audioUrl || '';
          }
          return { ...p, audioUrl: url };
        });

        resolve(formatted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load history projects:', err);
    return [];
  }
}

/**
 * Delete a specific project from history
 */
export async function deleteProjectFromHistory(id: string): Promise<SavedStoryProject[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    await new Promise((resolve) => {
      tx.oncomplete = resolve;
    });

    return await getAllHistoryProjects();
  } catch (err) {
    console.error('Failed to delete history project:', err);
    return [];
  }
}
