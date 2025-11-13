/**
 * Storage Adapters
 * @module storage
 */

export { MemoryStorage } from './memory'
export { IndexedDBStorage } from './indexeddb'
export type { StorageAdapter, StoredDocument } from '../types'

/**
 * Create a storage adapter based on type string
 */
export function createStorage(type: 'memory' | 'indexeddb', name: string = 'synckit'): StorageAdapter {
  switch (type) {
    case 'memory':
      return new MemoryStorage()
    case 'indexeddb':
      return new IndexedDBStorage(name)
    default:
      throw new Error(`Unknown storage type: ${type}`)
  }
}
