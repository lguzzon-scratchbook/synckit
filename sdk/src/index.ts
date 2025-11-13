/**
 * SyncKit SDK
 * Production-grade local-first sync engine
 * 
 * @packageDocumentation
 * @module @synckit/sdk
 */

// Core exports
export { SyncKit } from './synckit'
export { SyncDocument } from './document'

// Storage adapters
export { MemoryStorage, IndexedDBStorage, createStorage } from './storage'
export type { StorageAdapter, StoredDocument } from './storage'

// Types
export type {
  SyncKitConfig,
  DocumentData,
  FieldPath,
  SubscriptionCallback,
  Unsubscribe,
  QueuedOperation,
  QueueConfig
} from './types'

// Errors
export {
  SyncKitError,
  StorageError,
  WASMError,
  DocumentError
} from './types'

// Version
export const VERSION = '0.1.0-alpha.1'

/**
 * Quick start example:
 * 
 * ```typescript
 * import { SyncKit } from '@synckit/sdk'
 * 
 * // Initialize SyncKit
 * const sync = new SyncKit({
 *   storage: 'indexeddb',
 *   name: 'my-app'
 * })
 * 
 * await sync.init()
 * 
 * // Create a typed document
 * interface Todo {
 *   title: string
 *   completed: boolean
 * }
 * 
 * const doc = sync.document<Todo>('todo-1')
 * 
 * // Set fields
 * await doc.set('title', 'Buy milk')
 * await doc.set('completed', false)
 * 
 * // Subscribe to changes
 * doc.subscribe((todo) => {
 *   console.log('Todo updated:', todo)
 * })
 * 
 * // Get current state
 * const todo = doc.get()
 * console.log(todo.title) // "Buy milk"
 * ```
 */
