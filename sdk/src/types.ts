/**
 * Core TypeScript types for SyncKit SDK
 * @module types
 */

// ====================
// Configuration Types
// ====================

export interface SyncKitConfig {
  /** Storage adapter to use */
  storage?: 'indexeddb' | 'memory' | StorageAdapter
  
  /** Application name (used for storage namespacing) */
  name?: string
  
  /** Server URL for remote sync (optional for offline-only) */
  serverUrl?: string
  
  /** Client ID (auto-generated if not provided) */
  clientId?: string
}

// ====================
// Storage Interface
// ====================

export interface StorageAdapter {
  /**
   * Initialize the storage adapter
   */
  init(): Promise<void>
  
  /**
   * Get a document by ID
   */
  get(docId: string): Promise<StoredDocument | null>
  
  /**
   * Save a document
   */
  set(docId: string, doc: StoredDocument): Promise<void>
  
  /**
   * Delete a document
   */
  delete(docId: string): Promise<void>
  
  /**
   * List all document IDs
   */
  list(): Promise<string[]>
  
  /**
   * Clear all documents
   */
  clear(): Promise<void>
}

export interface StoredDocument {
  id: string
  data: Record<string, unknown>
  version: Record<string, number>
  updatedAt: number
}

// ====================
// Document Types
// ====================

export type DocumentData<T = Record<string, unknown>> = T

export type FieldPath = string

export type SubscriptionCallback<T> = (data: T) => void

export interface Unsubscribe {
  (): void
}

// ====================
// Offline Queue Types
// ====================

export interface QueuedOperation {
  id: string
  docId: string
  type: 'set' | 'delete'
  field?: string
  value?: unknown
  timestamp: number
  retries: number
}

export interface QueueConfig {
  maxRetries?: number
  retryDelay?: number
  retryBackoff?: number
}

// ====================
// Error Types
// ====================

export class SyncKitError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'SyncKitError'
  }
}

export class StorageError extends SyncKitError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR')
    this.name = 'StorageError'
  }
}

export class WASMError extends SyncKitError {
  constructor(message: string) {
    super(message, 'WASM_ERROR')
    this.name = 'WASMError'
  }
}

export class DocumentError extends SyncKitError {
  constructor(message: string) {
    super(message, 'DOCUMENT_ERROR')
    this.name = 'DocumentError'
  }
}
