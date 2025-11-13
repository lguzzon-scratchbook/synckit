/**
 * SyncKit - Main SDK Class
 * Entry point for the SyncKit SDK
 * @module synckit
 */

import type { SyncKitConfig, StorageAdapter } from './types'
import { SyncKitError } from './types'
import { SyncDocument } from './document'
import { createStorage } from './storage'
import { initWASM } from './wasm-loader'

export class SyncKit {
  private storage: StorageAdapter
  private clientId: string
  private initialized = false
  private documents = new Map<string, SyncDocument<any>>()
  
  constructor(private config: SyncKitConfig = {}) {
    // Generate client ID if not provided
    this.clientId = config.clientId ?? this.generateClientId()
    
    // Initialize storage
    if (typeof config.storage === 'string') {
      this.storage = createStorage(config.storage, config.name)
    } else if (config.storage) {
      this.storage = config.storage
    } else {
      // Default to IndexedDB in browser, Memory in Node
      const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined'
      this.storage = createStorage(isBrowser ? 'indexeddb' : 'memory', config.name)
    }
  }
  
  /**
   * Initialize SyncKit
   * Must be called before using any documents
   */
  async init(): Promise<void> {
    if (this.initialized) return
    
    try {
      // Initialize WASM module
      await initWASM()
      
      // Initialize storage
      await this.storage.init()
      
      this.initialized = true
    } catch (error) {
      throw new SyncKitError(
        `Failed to initialize SyncKit: ${error}`,
        'INIT_ERROR'
      )
    }
  }
  
  /**
   * Create or get a document
   * Documents are cached per ID
   */
  document<T extends Record<string, unknown> = Record<string, unknown>>(
    id: string
  ): SyncDocument<T> {
    if (!this.initialized) {
      throw new SyncKitError(
        'SyncKit not initialized. Call init() first.',
        'NOT_INITIALIZED'
      )
    }
    
    // Return cached document if exists
    if (this.documents.has(id)) {
      return this.documents.get(id)!
    }
    
    // Create new document
    const doc = new SyncDocument<T>(id, this.clientId, this.storage)
    this.documents.set(id, doc)
    
    // Initialize document asynchronously
    doc.init().catch(error => {
      console.error(`Failed to initialize document ${id}:`, error)
    })
    
    return doc
  }
  
  /**
   * List all document IDs in storage
   */
  async listDocuments(): Promise<string[]> {
    if (!this.initialized) {
      throw new SyncKitError(
        'SyncKit not initialized. Call init() first.',
        'NOT_INITIALIZED'
      )
    }
    
    return this.storage.list()
  }
  
  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    if (!this.initialized) {
      throw new SyncKitError(
        'SyncKit not initialized. Call init() first.',
        'NOT_INITIALIZED'
      )
    }
    
    // Remove from cache
    const doc = this.documents.get(id)
    if (doc) {
      doc.dispose()
      this.documents.delete(id)
    }
    
    // Remove from storage
    await this.storage.delete(id)
  }
  
  /**
   * Clear all documents
   */
  async clearAll(): Promise<void> {
    if (!this.initialized) {
      throw new SyncKitError(
        'SyncKit not initialized. Call init() first.',
        'NOT_INITIALIZED'
      )
    }
    
    // Dispose all cached documents
    for (const doc of this.documents.values()) {
      doc.dispose()
    }
    this.documents.clear()
    
    // Clear storage
    await this.storage.clear()
  }
  
  /**
   * Get client ID
   */
  getClientId(): string {
    return this.clientId
  }
  
  /**
   * Check if SyncKit is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
  
  // Private methods
  
  private generateClientId(): string {
    // Generate a random client ID
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    return `client-${timestamp}-${random}`
  }
}
