/**
 * React Hooks for SyncKit
 * @module adapters/react
 */

import { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react'
import type { SyncKit } from '../synckit'
import type { SyncDocument } from '../document'
import type { SubscriptionCallback } from '../types'

// ====================
// Context
// ====================

const SyncKitContext = createContext<SyncKit | null>(null)

export interface SyncProviderProps {
  synckit: SyncKit
  children: React.ReactNode
}

/**
 * Provider component for SyncKit instance
 */
export function SyncProvider({ synckit, children }: SyncProviderProps) {
  return (
    <SyncKitContext.Provider value={synckit}>
      {children}
    </SyncKitContext.Provider>
  )
}

/**
 * Get SyncKit instance from context
 */
export function useSyncKit(): SyncKit {
  const synckit = useContext(SyncKitContext)
  if (!synckit) {
    throw new Error('useSyncKit must be used within a SyncProvider')
  }
  return synckit
}

// ====================
// Document Hook
// ====================

export interface UseSyncDocumentOptions {
  /** Auto-initialize the document (default: true) */
  autoInit?: boolean
}

/**
 * Hook for syncing a document
 * Returns [data, setters, document]
 */
export function useSyncDocument<T extends Record<string, unknown>>(
  id: string,
  options: UseSyncDocumentOptions = {}
): [T, {
  set: <K extends keyof T>(field: K, value: T[K]) => Promise<void>
  update: (updates: Partial<T>) => Promise<void>
  delete: <K extends keyof T>(field: K) => Promise<void>
}, SyncDocument<T>] {
  const synckit = useSyncKit()
  const [data, setData] = useState<T>({} as T)
  const docRef = useRef<SyncDocument<T> | null>(null)
  
  // Get or create document
  if (!docRef.current) {
    docRef.current = synckit.document<T>(id)
  }
  
  const doc = docRef.current
  
  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = doc.subscribe((newData) => {
      setData(newData)
    })
    
    return unsubscribe
  }, [doc])
  
  // Memoized setters
  const set = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => doc.set(field, value),
    [doc]
  )
  
  const update = useCallback(
    (updates: Partial<T>) => doc.update(updates),
    [doc]
  )
  
  const deleteField = useCallback(
    <K extends keyof T>(field: K) => doc.delete(field),
    [doc]
  )
  
  return [data, { set, update, delete: deleteField }, doc]
}

// ====================
// Field Hook
// ====================

/**
 * Hook for syncing a single field
 * Returns [value, setValue]
 */
export function useSyncField<T extends Record<string, unknown>, K extends keyof T>(
  id: string,
  field: K
): [T[K] | undefined, (value: T[K]) => Promise<void>] {
  const [data, { set }] = useSyncDocument<T>(id)
  
  const value = data[field]
  const setValue = useCallback(
    (newValue: T[K]) => set(field, newValue),
    [set, field]
  )
  
  return [value, setValue]
}

// ====================
// List Hook
// ====================

/**
 * Hook for listing all documents
 */
export function useSyncDocumentList(): string[] {
  const synckit = useSyncKit()
  const [ids, setIds] = useState<string[]>([])
  
  useEffect(() => {
    synckit.listDocuments()
      .then(setIds)
      .catch(console.error)
  }, [synckit])
  
  return ids
}
