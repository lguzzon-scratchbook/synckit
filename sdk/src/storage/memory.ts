/**
 * Memory Storage Adapter
 * In-memory storage (useful for testing, non-persistent)
 * @module storage/memory
 */

import type { StorageAdapter, StoredDocument } from '../types'

export class MemoryStorage implements StorageAdapter {
  private store = new Map<string, StoredDocument>()
  
  async init(): Promise<void> {
    // No initialization needed for memory storage
  }
  
  async get(docId: string): Promise<StoredDocument | null> {
    return this.store.get(docId) ?? null
  }
  
  async set(docId: string, doc: StoredDocument): Promise<void> {
    this.store.set(docId, doc)
  }
  
  async delete(docId: string): Promise<void> {
    this.store.delete(docId)
  }
  
  async list(): Promise<string[]> {
    return Array.from(this.store.keys())
  }
  
  async clear(): Promise<void> {
    this.store.clear()
  }
}
