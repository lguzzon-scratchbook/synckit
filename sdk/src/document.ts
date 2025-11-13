/**
 * SyncDocument - Type-safe document wrapper
 * Provides a high-level API over the WASM document primitive
 * @module document
 */

import type {
  DocumentData,
  FieldPath,
  SubscriptionCallback,
  Unsubscribe,
  StorageAdapter,
  StoredDocument
} from './types'
import { DocumentError } from './types'
import type { WasmDocument } from './wasm-loader'
import { initWASM } from './wasm-loader'

export class SyncDocument<T extends Record<string, unknown> = Record<string, unknown>> {
  private wasmDoc: WasmDocument | null = null
  private subscribers = new Set<SubscriptionCallback<T>>()
  private data: T = {} as T
  private clock = 0n
  
  constructor(
    private readonly id: string,
    private readonly clientId: string,
    private readonly storage?: StorageAdapter
  ) {}
  
  /**
   * Initialize the document (loads from storage if available)
   */
  async init(): Promise<void> {
    const wasm = await initWASM()
    this.wasmDoc = new wasm.WasmDocument(this.id)
    
    // Load from storage if available
    if (this.storage) {
      const stored = await this.storage.get(this.id)
      if (stored) {
        this.loadFromStored(stored)
      }
    }
    
    this.updateLocalState()
  }
  
  /**
   * Get the current document data
   */
  get(): T {
    return { ...this.data }
  }
  
  /**
   * Get a single field value
   */
  getField<K extends keyof T>(field: K): T[K] | undefined {
    return this.data[field]
  }
  
  /**
   * Set a single field value
   */
  async set<K extends keyof T>(field: K, value: T[K]): Promise<void> {
    if (!this.wasmDoc) {
      throw new DocumentError('Document not initialized')
    }
    
    // Increment clock
    this.clock++
    
    // Update WASM document
    const valueJson = JSON.stringify(value)
    this.wasmDoc.setField(
      String(field),
      valueJson,
      this.clock,
      this.clientId
    )
    
    // Update local state
    this.updateLocalState()
    
    // Save to storage
    await this.persist()
    
    // Notify subscribers
    this.notifySubscribers()
  }
  
  /**
   * Update multiple fields at once
   */
  async update(updates: Partial<T>): Promise<void> {
    if (!this.wasmDoc) {
      throw new DocumentError('Document not initialized')
    }
    
    // Apply all updates
    for (const [field, value] of Object.entries(updates)) {
      this.clock++
      const valueJson = JSON.stringify(value)
      this.wasmDoc.setField(field, valueJson, this.clock, this.clientId)
    }
    
    // Update local state
    this.updateLocalState()
    
    // Save to storage
    await this.persist()
    
    // Notify subscribers
    this.notifySubscribers()
  }
  
  /**
   * Delete a field
   */
  async delete<K extends keyof T>(field: K): Promise<void> {
    if (!this.wasmDoc) {
      throw new DocumentError('Document not initialized')
    }
    
    this.wasmDoc.deleteField(String(field))
    this.updateLocalState()
    await this.persist()
    this.notifySubscribers()
  }
  
  /**
   * Subscribe to document changes
   */
  subscribe(callback: SubscriptionCallback<T>): Unsubscribe {
    this.subscribers.add(callback)
    
    // Immediately call with current state
    callback(this.get())
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }
  
  /**
   * Merge with another document
   */
  async merge(other: SyncDocument<T>): Promise<void> {
    if (!this.wasmDoc || !other.wasmDoc) {
      throw new DocumentError('Documents not initialized')
    }
    
    this.wasmDoc.merge(other.wasmDoc)
    this.updateLocalState()
    await this.persist()
    this.notifySubscribers()
  }
  
  /**
   * Export as JSON
   */
  toJSON(): T {
    if (!this.wasmDoc) {
      return this.data
    }
    
    const json = this.wasmDoc.toJSON()
    return JSON.parse(json) as T
  }
  
  /**
   * Get document ID
   */
  getId(): string {
    return this.id
  }
  
  /**
   * Get field count
   */
  getFieldCount(): number {
    return this.wasmDoc?.fieldCount() ?? 0
  }
  
  // Private methods
  
  private updateLocalState(): void {
    if (!this.wasmDoc) return
    
    const json = this.wasmDoc.toJSON()
    this.data = JSON.parse(json) as T
  }
  
  private notifySubscribers(): void {
    const currentData = this.get()
    this.subscribers.forEach(callback => {
      try {
        callback(currentData)
      } catch (error) {
        console.error('Error in subscription callback:', error)
      }
    })
  }
  
  private async persist(): Promise<void> {
    if (!this.storage || !this.wasmDoc) return
    
    const stored: StoredDocument = {
      id: this.id,
      data: this.data,
      version: { [this.clientId]: Number(this.clock) },
      updatedAt: Date.now()
    }
    
    await this.storage.set(this.id, stored)
  }
  
  private loadFromStored(stored: StoredDocument): void {
    if (!this.wasmDoc) return
    
    // Reconstruct document from stored data
    for (const [field, value] of Object.entries(stored.data)) {
      const clock = BigInt(stored.version[this.clientId] || 0)
      this.wasmDoc.setField(field, JSON.stringify(value), clock, this.clientId)
    }
    
    this.clock = BigInt(Math.max(...Object.values(stored.version), 0))
    this.updateLocalState()
  }
  
  /**
   * Cleanup (call when document is no longer needed)
   */
  dispose(): void {
    this.subscribers.clear()
    if (this.wasmDoc) {
      this.wasmDoc.free()
      this.wasmDoc = null
    }
  }
}
