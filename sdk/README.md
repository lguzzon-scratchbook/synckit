# @synckit/sdk

> ⚠️ **PHASE 6 DELIVERABLE** - This is a placeholder. Full implementation scheduled for **Days 19-23**.

## Overview

The SyncKit TypeScript SDK will provide a developer-friendly interface to the Rust-powered sync engine. It wraps the WASM-compiled core with an intuitive, type-safe API.

## Planned Features (Phase 6)

### Tier 1: Document Sync (LWW)
```typescript
import { SyncKit } from '@synckit/sdk'

const sync = new SyncKit({ 
  url: 'ws://localhost:8080',
  storage: 'indexeddb' 
})

// Create/open a document
const doc = sync.document<Todo>('todo-123')

// Update with automatic conflict resolution
await doc.update({ completed: true })

// Subscribe to changes
doc.subscribe(todo => {
  console.log('Todo updated:', todo)
})
```

### Tier 2: Text Sync (Replicated Growable Array)
```typescript
const text = sync.text('note-456')

// Collaborative text editing
text.insert(0, 'Hello ')
text.insert(6, 'World!')
text.delete(5, 1)

// Subscribe to content changes
text.subscribe(content => {
  editor.setValue(content)
})
```

### Tier 3: CRDT Data Structures
```typescript
// Counter (PN-Counter)
const counter = sync.counter('likes-789')
counter.increment()
counter.decrement()

// Set (OR-Set)
const tags = sync.set<string>('tags-101')
tags.add('typescript')
tags.remove('javascript')

// Map (LWW-Map)
const settings = sync.map<Settings>('settings-202')
settings.set('theme', 'dark')
```

## Architecture

```
┌─────────────────────────────┐
│   TypeScript SDK (Phase 6)  │
│  - High-level API           │
│  - Storage adapters         │
│  - Type definitions         │
└─────────────────────────────┘
              ↓
┌─────────────────────────────┐
│   WASM Bindings (Phase 5)   │
│  - JS ↔ Rust interface      │
│  - Memory management        │
└─────────────────────────────┘
              ↓
┌─────────────────────────────┐
│   Rust Core (Phase 2-3)     │
│  - LWW merge ✅             │
│  - CRDTs (Phase 3)          │
│  - Vector clocks ✅         │
└─────────────────────────────┘
```

## Storage Adapters (Planned)

- **IndexedDB** - Browser persistent storage
- **SQLite** - Node.js/Electron apps
- **Memory** - Testing/ephemeral data
- **Custom** - Bring your own storage

## Installation (After Phase 6)

```bash
npm install @synckit/sdk
# or
yarn add @synckit/sdk
# or
pnpm add @synckit/sdk
```

## Current Status

| Component | Status | Phase |
|-----------|--------|-------|
| Rust Core (LWW) | ✅ Complete | Phase 2 |
| Rust Core (CRDTs) | ⏳ Planned | Phase 3 |
| Protocol & Serialization | ⏳ Planned | Phase 4 |
| WASM Compilation | ⏳ Planned | Phase 5 |
| **TypeScript SDK** | 📦 **Placeholder** | **Phase 6** |
| Reference Server | ⏳ Planned | Phase 7 |

## Dependencies

The SDK will depend on:
- WASM module from Phase 5
- Protocol definitions from Phase 4
- Storage adapter interfaces

## Timeline

- **Phase 5 (Days 14-16):** WASM compilation & FFI
- **Phase 6 (Days 19-23):** TypeScript SDK implementation ← **YOU ARE HERE**
- **Phase 7 (Days 22-26):** Reference server
- **Phase 8 (Days 27-29):** Testing infrastructure

## Documentation

Full API documentation will be available in Phase 6. For now, see:
- [Architecture Documentation](../docs/architecture/ARCHITECTURE.md)
- [SDK API Design](../docs/api/SDK_API.md)
- [Rust Core Documentation](../core/README.md)

## Development

This placeholder allows the repository structure to exist before implementation:

```bash
cd sdk

# Install dependencies (when implemented)
npm install

# Build SDK (Phase 6)
npm run build

# Run tests (Phase 6)
npm test

# Type checking (Phase 6)
npm run typecheck
```

## Contributing

The SDK is not yet ready for contributions. Please focus on:
- Phase 3: CRDT implementation
- Phase 4: Protocol & serialization
- Phase 5: WASM compilation

## License

MIT License - See [LICENSE](../LICENSE) for details

---

**Note:** This README will be updated significantly in Phase 6 with actual implementation details, examples, and API documentation.
