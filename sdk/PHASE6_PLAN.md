# Phase 6: TypeScript SDK - Implementation Plan

## 🎯 Goal
Build a developer-friendly TypeScript SDK that wraps the WASM core with:
- Intuitive API
- Type safety
- Storage adapters
- Offline support
- Framework integrations

## 📋 Implementation Order

### Step 1: Core SDK Infrastructure (60 min)
- [ ] WASM loader wrapper
- [ ] SyncKit main class
- [ ] Configuration system
- [ ] Error handling

### Step 2: Document API (90 min)
- [ ] SyncDocument class with generics
- [ ] Type-safe field operations
- [ ] Observable pattern for reactivity
- [ ] JSON serialization helpers

### Step 3: Storage Layer (120 min)
- [ ] Storage interface
- [ ] IndexedDB adapter (priority - universal)
- [ ] Memory adapter (testing)
- [ ] Storage auto-detection

### Step 4: Offline Queue (60 min)
- [ ] Operation queue
- [ ] Retry logic with exponential backoff
- [ ] Conflict buffer

### Step 5: React Integration (90 min)
- [ ] useSyncDocument hook
- [ ] useSyncField hook
- [ ] SyncProvider context

### Step 6: Build & Testing (60 min)
- [ ] tsup configuration
- [ ] Basic tests with vitest
- [ ] Example app

## 📦 Package Structure

```
sdk/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── synckit.ts               # Core SyncKit class
│   ├── document.ts              # SyncDocument wrapper
│   ├── types.ts                 # TypeScript types
│   ├── error.ts                 # Error classes
│   ├── wasm-loader.ts           # WASM initialization
│   ├── storage/
│   │   ├── index.ts             # Storage exports
│   │   ├── interface.ts         # Storage interface
│   │   ├── indexeddb.ts         # IndexedDB adapter
│   │   └── memory.ts            # Memory adapter
│   ├── offline/
│   │   ├── queue.ts             # Operation queue
│   │   └── types.ts             # Queue types
│   └── adapters/
│       └── react.tsx            # React hooks
├── tests/
│   ├── document.test.ts
│   ├── storage.test.ts
│   └── offline.test.ts
└── examples/
    └── basic/
        └── index.html           # Basic usage example

## 🎨 API Design

### Core API
```typescript
import { SyncKit } from '@synckit/sdk'

const sync = new SyncKit({
  storage: 'indexeddb',  // or 'memory' or custom adapter
  name: 'my-app'
})

await sync.init()
```

### Document API
```typescript
interface Todo {
  title: string
  completed: boolean
}

const doc = sync.document<Todo>('todo-123')

// Type-safe operations
await doc.set('title', 'Buy milk')
await doc.set('completed', true)

// Get current state
const todo = doc.get() // Typed as Todo

// Subscribe to changes
doc.subscribe((data) => {
  console.log('Todo updated:', data)
})
```

### React Hooks
```typescript
import { useSyncDocument } from '@synckit/sdk/react'

function TodoItem({ id }: { id: string }) {
  const [todo, setTodo] = useSyncDocument<Todo>(id)
  
  return (
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={(e) => setTodo({ completed: e.target.checked })}
    />
  )
}
```

## 🔧 Technical Decisions

### 1. WASM Loading
- Use dynamic import for code splitting
- Lazy load WASM on first use
- Cache WASM instance

### 2. Type Safety
- Generics for document types
- Strict TypeScript (no any)
- Runtime validation for critical paths

### 3. Reactivity
- Observable pattern (not EventEmitter)
- Batched updates
- Framework-agnostic core

### 4. Storage
- IndexedDB first (universal browser support)
- Async interface (all operations)
- Automatic schema management

### 5. Offline Support
- Queue mutations while offline
- Retry with exponential backoff
- Conflict resolution on reconnect

## 📊 Success Metrics

- [ ] API surface: <20 core methods
- [ ] Bundle size: SDK <20KB (+ 51KB WASM = 71KB total)
- [ ] Time to first sync: <5 minutes for new developer
- [ ] Type coverage: 100%
- [ ] Test coverage: >80%

## 🚀 Let's Build!

Starting with Step 1: Core SDK Infrastructure
