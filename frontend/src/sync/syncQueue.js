/**
 * Offline Sync Queue - Pure JavaScript
 * Stores frontline visit notes and registration events in localStorage when disconnected.
 * Clearly marked as simulated synchronization since no server exists.
 */

const STORAGE_KEY = 'swasthyavani_sync_queue_v1';

export class SyncQueue {
  constructor() {
    this.queue = this._load();
  }

  _load() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _save() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage full or restricted
    }
  }

  /**
   * Enqueue a newly logged visit note or custom event.
   * @param {Object|string} item
   * @param {Object} [payload]
   */
  enqueue(item, payload = null) {
    let entry;
    if (typeof item === 'string' && payload) {
      entry = {
        id: `SYNC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: item,
        payload: payload,
        synced: false,
      };
    } else {
      entry = {
        id: `NOTE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        memberId: item.memberId,
        dueItem: item.dueItem,
        notes: item.notes,
        synced: false,
      };
    }
    this.queue.push(entry);
    this._save();
    return entry;
  }

  /**
   * Return all queued items.
   * @returns {Array<Object>}
   */
  getItems() {
    return this.queue;
  }

  /**
   * Return list of pending un-synced items.
   * @returns {Array<Object>}
   */
  getPending() {
    return this.queue.filter((x) => !x.synced);
  }

  /**
   * Return count of pending un-synced notes.
   * @returns {number}
   */
  getPendingCount() {
    return this.queue.filter((x) => !x.synced).length;
  }

  /**
   * Simulated flush to central registry.
   */
  flush() {
    for (const item of this.queue) {
      item.synced = true;
    }
    this._save();
    return this.queue.length;
  }

  /**
   * Clear all items.
   */
  clear() {
    this.queue = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }
}

export const syncQueue = new SyncQueue();
