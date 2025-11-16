/**
 * Storage Layer Exports
 * 
 * Provides database persistence and multi-server coordination
 */

// Core interfaces
export type {
  StorageAdapter,
  TransactionalStorageAdapter,
  StorageConfig,
  DocumentState,
  VectorClockEntry,
  DeltaEntry,
  SessionEntry,
  Transaction,
} from './interface';

// Error types
export {
  StorageError,
  ConnectionError,
  QueryError,
  NotFoundError,
  ConflictError,
} from './interface';

// Implementations
export { PostgresAdapter } from './postgres';
export { RedisPubSub } from './redis';
