# Choosing the Right SyncKit Variant

SyncKit ships with two optimized variants to balance bundle size with functionality. This guide helps you choose the right one for your use case.

---

## 🎯 Quick Decision Tree

```
Start here
│
└─ Do you need network synchronization?
   │
   ├─ YES or MAYBE → Use Default variant
   │                 ✅ 59 KB gzipped total
   │                 ✅ Network sync with WebSocket (v0.1.0)
   │                 ✅ Offline queue with auto-replay
   │                 ✅ Network status tracking
   │                 ✅ Recommended for most apps (95% of use cases)
   │
   └─ NO, NEVER → Use Lite variant
                  ✅ 45 KB gzipped (smallest)
                  ✅ Local-only sync
                  ✅ Perfect for offline-first apps without backend
                  ✅ 13 KB smaller than Default
```

---

## 📦 Variant Comparison

### Default Variant - 59 KB gzipped (Recommended)

**Import:**
```typescript
import { SyncKit } from '@synckit-js/sdk'
```

**SDK v0.1.0 Features (Fully Functional):**
- ✅ Document sync (Last-Write-Wins)
- ✅ Vector clocks (causality tracking)
- ✅ Conflict resolution (automatic)
- ✅ Offline-first with network sync
- ✅ IndexedDB & Memory storage
- ✅ **Network sync (WebSocket with auto-reconnection)**
- ✅ **Offline queue with persistent storage**
- ✅ **Network status tracking**
- ✅ **Real-time document synchronization**
- ❌ Text CRDT *(coming in v0.2.0)*
- ❌ Counter CRDT *(coming in v0.2.0)*
- ❌ Set CRDT *(coming in v0.2.0)*

**WASM Binary Includes:**
- ✅ Network protocol (custom binary format with JSON payload)
- ✅ Delta computation
- ✅ DateTime serialization
- ✅ WebSocket client
- ✅ Offline queue management
- ✅ Text/Counter/Set CRDT implementations (for v0.2.0)

**Perfect for (v0.1.0 - Full Network Sync):**
- CRM systems with server sync
- Project management with team collaboration
- Dashboards syncing across devices
- Real-time collaborative applications
- Todo applications with cloud sync
- Note-taking apps with cross-device sync
- Offline-first PWAs with backend sync
- E-commerce with cloud sync
- **Any app that syncs structured data (JSON objects) with a server**

**Future (v0.2.0+):**
- Character-level collaborative text editing (Text CRDT)
- Distributed counters (Counter CRDT)
- Conflict-free sets (Set CRDT)

**Real-world examples:**
- [Todo App](../../examples/todo-app/) - Simple CRUD with filters
- [Project Management App](../../examples/project-management/) - Kanban board with drag-and-drop
- [Collaborative Editor](../../examples/collaborative-editor/) - Real-time document editing

**Code example (v0.1.0 - Network Sync):**
```typescript
import { SyncKit } from '@synckit-js/sdk'

// Enable network sync with serverUrl
const sync = new SyncKit({
  storage: 'indexeddb',
  name: 'my-app',
  serverUrl: 'ws://localhost:8080'  // ✅ Enables WebSocket sync
})

await sync.init()

// Create a document
const task = sync.document<Task>('task-123')
await task.update({
  title: 'Build feature',
  status: 'in-progress',
  assignee: 'alice@example.com'
})

// ✅ Works: Local storage with IndexedDB
// ✅ Works: Offline-first, instant writes
// ✅ Works: Conflict resolution (automatic)
// ✅ Works: Real-time sync to server (v0.1.0)
// ✅ Works: Network status tracking
// ✅ Works: Offline queue with auto-replay

// Monitor network status
const status = sync.getNetworkStatus()
console.log('Connected:', status?.connectionState)
```

**When to use:**
- ✅ You need real-time network synchronization
- ✅ You want cross-device sync
- ✅ You need team collaboration features
- ✅ You want offline queue with auto-replay
- ✅ Data is structured (objects, arrays, primitives)
- ✅ **This is the recommended default for 95% of applications**

**When NOT to use:**
- ❌ You're 100% sure you'll never need server sync → Use Lite variant (save 14 KB)
- ❌ Bundle size is absolutely critical → Use Lite variant

**Bundle size:** 48 KB (WASM) + 10 KB (JS) = **59 KB total gzipped**

---

### Lite Variant - 45 KB gzipped (Smallest)

**Import:**
```typescript
import { SyncKit } from '@synckit-js/sdk/lite'
```

**SDK v0.1.0 Features (Local-Only):**
- ✅ Document sync (Last-Write-Wins)
- ✅ Vector clocks (causality tracking)
- ✅ Conflict resolution (automatic)
- ✅ Offline-first (local storage only)
- ✅ IndexedDB & Memory storage
- ❌ **Network sync** *(not in WASM, not available)*
- ❌ **WebSocket client** *(not in WASM)*
- ❌ **Offline queue** *(not in WASM)*
- ❌ Text/Counter/Set CRDTs *(not in WASM)*

**WASM Binary Does NOT Include:**
- ❌ Network protocol (custom binary format)
- ❌ WebSocket client
- ❌ Offline queue management
- ❌ Delta computation
- ❌ DateTime serialization
- ❌ Text/Counter/Set CRDT implementations

**Note:** Lite variant is LOCAL-ONLY. It does NOT include network sync capabilities. Use Default variant (59KB) if you need network synchronization.

**Perfect for:**
- Local-only applications
- Offline-first apps without backend sync
- Browser extensions
- Electron apps with file-based storage
- Progressive Web Apps (PWAs) with local data
- Apps where bundle size is critical

**Real-world examples:**
- Todo apps with local storage only
- Note-taking apps (without real-time collaboration)
- Settings/preferences management
- Form data persistence (local draft)
- Shopping carts (local-only)

**Code example (v0.1.0):**
```typescript
import { SyncKit } from '@synckit-js/sdk/lite'

const sync = new SyncKit({
  storage: 'indexeddb',
  name: 'todo-app'
})

await sync.init()

// Create a document
const todo = sync.document<Todo>('todo-123')
await todo.update({
  text: 'Buy milk',
  completed: false,
  priority: 'high'
})

// ✅ Works: Local storage with IndexedDB
// ✅ Works: Offline-first, instant writes
// ❌ NO network sync (use Default for that)
// 💡 13 KB smaller than Default
```

**When to use:**
- ✅ You're 100% sure you'll never need server sync
- ✅ Local-only storage is all you need
- ✅ Want the absolute smallest bundle
- ✅ Building offline-first without backend

**When NOT to use:**
- ❌ You might need server sync → Use Default variant (has network in v0.1.0)
- ❌ Not sure about requirements → Use Default variant (only 14 KB larger)
- ❌ You need real-time collaboration → Use Default variant

**Bundle size:** 43 KB (WASM) + 1.5 KB (JS) = **45 KB total gzipped**

**Bundle size savings:** 14 KB smaller than Default (24% reduction)

---

## 🔄 Switching Between Variants

Switching between variants is seamless - just change the import:

```typescript
// Before (lite)
import { SyncKit } from '@synckit-js/sdk/lite'

// After (need server sync)
import { SyncKit } from '@synckit-js/sdk'

// All core APIs remain exactly the same!
// No breaking changes, just additional features available
```

**Important:** Don't mix imports from different variants in the same app:

```typescript
// ❌ BAD: Imports from multiple variants (duplicates WASM)
import { SyncKit } from '@synckit-js/sdk'
import { SyncDocument } from '@synckit-js/sdk/lite'  // Imports separate WASM!

// ✅ GOOD: Import everything from one variant
import { SyncKit, SyncDocument } from '@synckit-js/sdk'
```

**Migration is non-breaking:**
- Data format is the same across both variants
- A document created with Lite can be opened with Default
- You can upgrade anytime without data migration

---

## 📊 Bundle Size Impact

Understanding the size trade-offs:

| Variant | Total (gzipped) | WASM | JS | What You Get |
|---------|-----------------|------|-----|--------------|
| **Lite** | **45 KB** | 43 KB | 1.5 KB | Local-only sync |
| **Default** | **59 KB** | 48 KB | 10 KB | + Network sync (v0.1.0) |

**Key insights:**
1. Default variant JS includes WebSocket client, sync manager, and offline queue
2. Lite to Default: +14 KB for full network sync capabilities
3. For most apps, the 14 KB is worth it for real-time sync

**Comparison to alternatives (gzipped):**

| Library | Size | Type | Notes |
|---------|------|------|-------|
| **Yjs** | **~19 KB** | Pure JS | Text CRDT, lightest |
| **SyncKit Lite** | **~45 KB** | WASM + JS | Local-only |
| **SyncKit Default** | **~59 KB** | WASM + JS | With network sync |
| **Automerge** | **~60-78 KB** | WASM + JS | Full CRDT suite |
| **Firebase SDK** | **~150 KB** | Pure JS | Plus server dependency |

**SyncKit's Position:**
- 3x larger than Yjs (trade-off: WASM portability + network sync)
- Competitive with Automerge (similar size, simpler API for structured data)
- 2.6x smaller than Firebase

---

## 🎓 Common Scenarios

### Scenario 1: Todo Application with Network Sync

**Recommended:** Default variant

**Why:**
- Structured data (tasks, status, due dates)
- Real-time sync across devices
- Network sync available NOW in v0.1.0
- Team collaboration ready

**Bundle:** ~59 KB (SyncKit) + ~130 KB (React) = ~189 KB total

**Example:** [Todo App](../../examples/todo-app/) - With network sync capabilities

---

### Scenario 2: Local-Only Todo Application

**Recommended:** Lite variant (save 13 KB)

**Why:**
- No server sync needed
- Local storage only
- Smallest bundle size
- 14 KB smaller than Default

**Bundle:** ~45 KB (SyncKit) + ~130 KB (React) = ~175 KB total

---

### Scenario 3: Project Management (Kanban) with Team Sync

**Recommended:** Default variant

**Why:**
- Cards are structured data (title, description, status)
- Team collaboration with real-time server sync
- Network sync available NOW in v0.1.0
- Multi-user features ready

**Bundle:** ~59 KB (SyncKit) + ~130 KB (React) + ~28 KB (dnd-kit) = ~217 KB total

**Example:** [Project Management App](../../examples/project-management/) - With network sync

---

### Scenario 4: Collaborative Document Editing

**Recommended:** Default variant

**Why:**
- Document-level sync for editor content
- Real-time collaboration available NOW in v0.1.0
- Network sync with offline queue
- Multi-user editing ready

**Bundle:** ~59 KB (SyncKit) + ~130 KB (React) + ~124 KB (CodeMirror) = ~313 KB total

**Example:** [Collaborative Editor](../../examples/collaborative-editor/) - With network sync

**Note:** v0.1.0 uses document-level sync (LWW), not character-level Text CRDT. Character-level CRDTs coming in v0.2.0.

---

### Scenario 5: Offline-First Browser Extension

**Recommended:** Lite variant

**Why:**
- Bundle size is critical for extensions
- Local-only storage (chrome.storage)
- No server sync needed
- Fastest performance

**Bundle:** ~45 KB (smallest possible)

---

### Scenario 6: Cross-Platform Desktop App (Electron)

**Decision depends on sync needs:**

**Use Default (59KB) if:**
- Need cloud sync across devices (v0.1.0 ready)
- Multiple users collaborate
- Data backup to server required
- Real-time updates needed

**Use Lite (45KB) if:**
- Local files only (no cloud sync)
- Single user application
- Want smallest bundle

---

## 💡 Best Practices

### 1. Start with Default

Use the Default variant unless you have a specific reason not to. It's the recommended default for 95% of applications.

```typescript
import { SyncKit } from '@synckit-js/sdk'
```

You only need to consider Lite if:
- Bundle size is absolutely critical (saving 14 KB matters)
- You're 100% sure you'll never need server sync

### 2. Don't Over-Optimize

**Rule of thumb:**
- If you're unsure → Use Default variant
- 14 KB difference is small for most apps
- Server sync is available NOW in v0.1.0

**Example of premature optimization:**
```typescript
// ❌ BAD: Using Lite to save 14 KB, missing out on network sync
import { SyncKit } from '@synckit-js/sdk/lite'
// Later: "We need cross-device sync now..."
// Now you have to refactor

// ✅ GOOD: Use Default with network sync ready
import { SyncKit } from '@synckit-js/sdk'
// serverUrl enables network sync in v0.1.0
```

### 3. Profile Your App

Use browser dev tools to measure actual bundle impact:

```bash
# Chrome DevTools → Network tab → Filter: WASM
# Look for synckit_core_bg.wasm size (should match variant size)
```

### 4. Consider Your Use Case

| If your app is... | Use variant |
|-------------------|-------------|
| Like Trello | Default |
| Like Todoist | Default |
| Like Notion | Default |
| Like Airtable | Default |
| Like Obsidian (cloud sync) | Default |
| Like Obsidian (local-only) | Lite |
| Browser extension (local) | Lite |
| Offline-first PWA (no server) | Lite |

---

## ❓ FAQ

### Q: Which variant should most apps use?

**A:** Default variant. It's 14 KB larger than Lite but includes full network sync capabilities available NOW in v0.1.0. Default has real-time WebSocket sync, offline queue, and network status tracking ready to use.

### Q: What's missing from Lite?

**A:** Lite's WASM binary excludes network sync components:
- Custom binary protocol (network format): ~3 KB
- WebSocket client: ~5 KB
- Offline queue management: ~3 KB
- DateTime library (chrono): ~3 KB

**Important:** Lite is LOCAL-ONLY. Default has full network sync in v0.1.0.

### Q: Will my bundle really be ~45-58 KB?

**A:** Yes:
- Lite: **45 KB total** (43KB WASM + 1.5KB JS)
- Default: **59 KB total** (48KB WASM + 10KB JS)

This is just SyncKit. Your total bundle includes:
- SyncKit: ~45-59 KB
- React (if used): ~130 KB
- Other libraries: varies
- Your code: varies

### Q: Can I switch variants later?

**A:** Yes! Switching is seamless:
1. Change your import statement
2. Rebuild your app
3. No data migration needed
4. All existing data works with the new variant

### Q: Do variants affect data format?

**A:** No. Both variants use the same storage format. Data created with one variant can be opened with the other.

### Q: Can I use both variants in one app?

**A:** Not recommended. Each variant includes its own WASM binary, so using both duplicates code (~50 KB overhead). Choose one variant for your entire app.

### Q: What happened to Text/Counter/Set CRDTs?

**A:** These features are implemented in the Rust core but not yet exposed in the SDK. They're planned for v0.2.0. Currently, SyncKit focuses on document-level sync (LWW), which covers 95% of use cases.

### Q: Why is the Collaborative Editor example using Default?

**A:** The collaborative editor uses Default variant because it has full network sync available NOW in v0.1.0. Multiple users can edit documents in real-time using document-level sync (LWW). Character-level Text CRDT is coming in v0.2.0 for even finer-grained collaboration.

### Q: Is 14 KB really worth worrying about?

**A:** Usually no. For most web apps, 14 KB is small. Only use Lite if:
- You're building a browser extension (strict size limits)
- You're targeting low-end devices with slow networks
- You're 100% certain you'll never need server sync
- Your total bundle is already very large

Otherwise, use Default and get network sync capabilities (available NOW in v0.1.0).

---

## 🚀 Next Steps

Ready to build? Here's what to do next:

1. **Choose your variant** using the decision tree above
2. **Install SyncKit:** `npm install @synckit-js/sdk`
3. **Import your variant:**
   ```typescript
   // Most apps
   import { SyncKit } from '@synckit-js/sdk'

   // Local-only apps
   import { SyncKit } from '@synckit-js/sdk/lite'
   ```
4. **Build your app:** Follow our [Getting Started Guide](./getting-started.md)

**Recommended reading:**
- [Getting Started Guide](./getting-started.md) - Build your first app
- [API Reference](../api/SDK_API.md) - Complete API documentation
- [Performance Guide](./performance.md) - Optimization tips
- [Examples](../../examples/) - Real-world applications

---

## 📚 Further Reading

- [Todo App Example](../../examples/todo-app/) - Simple CRUD
- [Project Management Example](../../examples/project-management/) - Kanban board
- [Collaborative Editor Example](../../examples/collaborative-editor/) - Real-time editing
- [Performance Optimization Guide](./performance.md)
- [Offline-First Architecture](./offline-first.md)
- [Conflict Resolution](./conflict-resolution.md)

---

**Still have questions?**
- [GitHub Issues](https://github.com/Dancode-188/synckit/issues)
- [GitHub Discussions](https://github.com/Dancode-188/synckit/discussions)
- Email: danbitengo@gmail.com

---

## 📝 Summary

### Two Variants Available

**Default (Recommended):**
```typescript
import { SyncKit } from '@synckit-js/sdk'
```
- 59 KB gzipped total (48KB WASM + 10KB JS)
- Includes network sync (available NOW in v0.1.0)
- WebSocket client with auto-reconnection
- Offline queue with persistent storage
- Perfect for 95% of applications
- Use this unless you have a specific reason not to

**Lite (Size-Optimized):**
```typescript
import { SyncKit } from '@synckit-js/sdk/lite'
```
- 45 KB gzipped total (43KB WASM + 1.5KB JS)
- Local-only, no server sync
- 14 KB smaller than Default
- Use for offline-first apps without backend

### Decision Matrix

| Need server sync? | Use variant |
|-------------------|-------------|
| Yes or Maybe | Default |
| No, never | Lite |
| Unsure | Default |

**When in doubt, choose Default.** The 14 KB difference is worth it for network sync (available NOW in v0.1.0).
