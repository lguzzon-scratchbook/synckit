/**
 * WASM Module Loader
 * Handles initialization and caching of the SyncKit WASM module
 * @module wasm-loader
 */

import { WASMError } from './types'

// WASM module types (from generated bindings)
export interface WASMModule {
  WasmDocument: {
    new (id: string): WasmDocument
  }
  WasmVectorClock: {
    new (): WasmVectorClock
  }
  WasmDelta: {
    compute(from: WasmDocument, to: WasmDocument): WasmDelta
  }
  init_panic_hook(): void
}

export interface WasmDocument {
  getId(): string
  setField(path: string, valueJson: string, clock: bigint, clientId: string): void
  getField(path: string): string | undefined
  deleteField(path: string): void
  fieldCount(): number
  toJSON(): string
  merge(other: WasmDocument): void
  free(): void
}

export interface WasmVectorClock {
  tick(clientId: string): void
  update(clientId: string, clock: bigint): void
  get(clientId: string): bigint
  merge(other: WasmVectorClock): void
  toJSON(): string
  free(): void
}

export interface WasmDelta {
  applyTo(document: WasmDocument, clientId: string): void
  getDocumentId(): string
  changeCount(): number
  toJSON(): string
  free(): void
}

// Singleton WASM instance
let wasmModule: WASMModule | null = null
let initPromise: Promise<WASMModule> | null = null

/**
 * Initialize the WASM module
 * Uses singleton pattern - subsequent calls return cached instance
 */
export async function initWASM(): Promise<WASMModule> {
  // Return cached instance if already loaded
  if (wasmModule) {
    return wasmModule
  }
  
  // Return in-flight promise if initialization in progress
  if (initPromise) {
    return initPromise
  }
  
  // Start initialization
  initPromise = (async () => {
    try {
      // Dynamic import of WASM module
      // In production, this would import from ../core/pkg
      // For now, we'll prepare the interface
      
      // TODO: Replace with actual WASM import
      // const wasm = await import('../../core/pkg/synckit_core.js')
      // await wasm.default() // Initialize WASM
      // wasm.init_panic_hook() // Better error messages
      
      // Placeholder for development
      throw new WASMError(
        'WASM module not yet linked. Run build script to copy WASM files to SDK.'
      )
      
      // return wasm as WASMModule
    } catch (error) {
      initPromise = null // Reset so retry is possible
      if (error instanceof WASMError) throw error
      throw new WASMError(`Failed to initialize WASM: ${error}`)
    }
  })()
  
  wasmModule = await initPromise
  return wasmModule
}

/**
 * Check if WASM module is initialized
 */
export function isWASMInitialized(): boolean {
  return wasmModule !== null
}

/**
 * Reset WASM instance (mainly for testing)
 */
export function resetWASM(): void {
  wasmModule = null
  initPromise = null
}
