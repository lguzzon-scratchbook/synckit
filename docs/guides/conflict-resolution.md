# Conflict Resolution in SyncKit

**⚠️ IMPORTANT - v0.1.0 STATUS:**

This guide describes SyncKit's conflict resolution architecture. However, **most conflict resolution features are not yet fully implemented in v0.1.0**.

**What works now in v0.1.0:**
- ✅ LWW (Last-Write-Wins) CRDT conflict resolution (automatic, built into documents)
- ✅ Local-first data storage
- ✅ Manual document merging via `doc.merge(otherDoc)`
- ✅ Field-level granularity for updates

**Not yet implemented (coming in future version):**
- ❌ WebSocket connectivity (`connect`, `disconnect`, `reconnect` methods)
- ❌ Conflict detection callbacks (`onConflict` method)
- ❌ Custom conflict handlers (`conflictHandlers` option)
- ❌ Conflict interface and conflict event objects
- ❌ Text CRDT (`sync.text()` method)
- ❌ Automatic real-time sync across devices
- ❌ Network-related config options

**How to use this guide:**
- Sections marked with **"❌ NOT IN v0.1.0"** describe future APIs
- Focus on understanding LWW concepts and the `doc.merge()` capability available now
- Examples showing `onConflict`, `conflictHandlers`, `sync.text()`, and network features are for reference/planning only

---

Learn how SyncKit handles conflicts automatically, and when to implement custom resolution logic.

---

## Table of Contents

1. [What Are Conflicts?](#what-are-conflicts)
2. [Understanding SyncKit's Strategy](#understanding-synckits-strategy)
3. [Common Conflict Scenarios](#common-conflict-scenarios)
4. [Working with Conflicts](#working-with-conflicts)
5. [Text Editing with CRDTs](#text-editing-with-crdts)
6. [Best Practices](#best-practices)
7. [Advanced Topics](#advanced-topics)
8. [Troubleshooting](#troubleshooting)

---

## What Are Conflicts?

A **conflict** occurs when two or more clients make different changes to the same data while disconnected, then sync.

**Note:** In v0.1.0, network sync is not yet available. The conflict scenarios below demonstrate the LWW concept that will apply when network sync is implemented. Currently, you can test conflict resolution manually using `doc.merge()`.

### Visual Example

```
Time →

Client A (Offline):  Task: "Buy milk" → "Buy organic milk"
                                          ↓ (writes locally)

Client B (Offline):  Task: "Buy milk" → "Buy almond milk"
                                          ↓ (writes locally)

Both clients come online and sync...

❓ Which value wins: "Buy organic milk" or "Buy almond milk"?
```

This is a **conflict**—two clients editing the same field with different values.

---

## Understanding SyncKit's Strategy

### Last-Write-Wins (LWW)

SyncKit uses **Last-Write-Wins (LWW)** as the default conflict resolution strategy.

**How it works:**
1. Every update includes a **timestamp** (milliseconds since epoch)
2. When syncing conflicting changes, the **most recent timestamp wins**
3. All clients converge to the same state automatically

```typescript
// Client A updates at 10:00:01.500
await task.update({
  title: 'Buy organic milk'
})  // Timestamp: 1732147201500

// Client B updates at 10:00:02.000 (500ms later)
await task.update({
  title: 'Buy almond milk'
})  // Timestamp: 1732147202000

// After sync: "Buy almond milk" wins (more recent timestamp)
```

### Why LWW?

**Advantages:**
- ✅ **Simple** - Easy to understand and predict
- ✅ **Automatic** - No manual intervention needed
- ✅ **Fast** - O(1) merge complexity
- ✅ **Convergent** - All clients reach same state
- ✅ **No user interruption** - Silent resolution

**Disadvantages:**
- ⚠️ **Data loss possible** - Earlier writes discarded
- ⚠️ **Clock dependency** - Requires synchronized clocks
- ⚠️ **Semantic unaware** - Doesn't understand intent

**When LWW works well:**
- User profile updates
- Task status changes
- Settings and preferences
- UI state (filters, sorting)
- **~95% of real-world conflicts**

**When LWW doesn't work:**
- Text editing (Text CRDT needed - not in v0.1.0)
- Counters (PN-Counter needed - not in v0.1.0)
- Financial calculations
- Cumulative data (logs, analytics)

---

## Common Conflict Scenarios

### Scenario 1: Simple Field Update

**Most common** - Two users update different fields.

```typescript
interface Task {
  id: string
  title: string
  assignee: string
  dueDate: string
}

// Client A (offline)
await task.update({ title: 'New title' })

// Client B (offline)
await task.update({ assignee: 'Bob' })

// After sync: No conflict! Different fields merge automatically
// Result: { title: 'New title', assignee: 'Bob', ... }
```

**Outcome:** ✅ No conflict - Different fields don't conflict

### Scenario 2: Same Field Update

**Conflict** - Two users update the same field.

```typescript
// Client A at 10:00:00
await task.update({ title: 'Buy milk' })

// Client B at 10:00:01
await task.update({ title: 'Buy eggs' })

// After sync: Client B wins (LWW)
// Result: { title: 'Buy eggs', ... }
```

**Outcome:** ⚠️ Conflict resolved by LWW - Client B's value wins

### Scenario 3: Field-Level Granularity

SyncKit resolves conflicts at **field level**, not document level.

```typescript
// Client A (offline)
await task.update({
  title: 'Buy milk',      // gets clock value N
  priority: 'high'        // gets clock value N+1
})
// Note: Each field in update() gets its own incrementing clock value

// Client B (offline, later)
await task.update({
  title: 'Buy eggs',      // gets clock value M (where M > N+1)
  assignee: 'Bob'         // gets clock value M+1
})

// After sync (field-level merge):
// Result: {
//   title: 'Buy eggs',        // Client B wins (M > N)
//   priority: 'high',         // Client A (no conflict with title)
//   assignee: 'Bob'           // Client B (no conflict)
// }
```

**Outcome:** ✅ Only `title` conflicts - other fields merge independently

**Note:** When calling `update()` with multiple fields, each field receives a separate incrementing timestamp internally.

### Scenario 4: Delete vs Update

```typescript
// Client A deletes field
await task.update({ dueDate: null })  // timestamp: 10:00:00

// Client B updates field
await task.update({ dueDate: '2025-12-01' })  // timestamp: 10:00:01

// After sync: Client B wins
// Result: { dueDate: '2025-12-01', ... }
```

**Outcome:** ⚠️ Update wins over delete (LWW)

### Scenario 5: Document Delete vs Update

```typescript
// Client A deletes document (must use sync.deleteDocument())
await sync.deleteDocument('task-123')  // timestamp: 10:00:00

// Client B updates document
const task = sync.document<Task>('task-123')
await task.update({ title: 'Updated' })  // timestamp: 10:00:01

// Note: In v0.1.0 (local-only), this scenario requires network sync
// The example shows the conceptual behavior for when network sync is implemented
```

**Outcome:** ⚠️ This scenario requires network sync (not in v0.1.0). When implemented, update would win over delete (LWW).

**Note:** `doc.delete(field)` deletes a **field**, not the document. Use `sync.deleteDocument(id)` to delete entire documents.

---

## Working with Conflicts

### Default Behavior (Automatic)

By default, SyncKit handles conflicts automatically with LWW:

```typescript
const sync = new SyncKit({
  storage: 'indexeddb',
  name: 'my-app'
})
await sync.init()  // Required!

const task = sync.document<Task>('task-123')

// All conflicts resolve automatically with LWW - no configuration needed
await task.update({ title: 'New title' })
```

**When to use:** 95% of applications - simple data, clear ownership

**Note:** LWW is built-in and automatic. There is no `conflictResolution` config option in v0.1.0.

### Detecting Conflicts ❌ NOT IN v0.1.0

**⚠️ This feature is not yet implemented in v0.1.0. Coming in a future version.**

Proposed API for getting notified when conflicts occur:

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
const task = sync.document<Task>('task-123')

// Subscribe to conflict events (NOT YET AVAILABLE)
task.onConflict((conflict) => {  // ❌ onConflict() doesn't exist
  console.log('Conflict detected!')
  console.log('Local value:', conflict.local)
  console.log('Remote value:', conflict.remote)
  console.log('Resolved to:', conflict.resolved)
})
```

**Proposed Conflict object (for future version):**
```typescript
// ❌ NOT IMPLEMENTED - Planned interface
interface Conflict<T> {
  field: keyof T           // Field that conflicted
  local: any               // Your local value
  remote: any              // Remote value from another client
  resolved: any            // Final value after resolution
  localTimestamp: number   // Your timestamp
  remoteTimestamp: number  // Remote timestamp
}
```

### Logging Conflicts ❌ NOT IN v0.1.0

**⚠️ This feature is not yet implemented in v0.1.0. Coming in a future version.**

Proposed API for tracking conflicts for debugging or analytics:

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
const conflicts: Conflict[] = []

task.onConflict((conflict) => {  // ❌ onConflict() doesn't exist
  conflicts.push(conflict)

  // Log to analytics
  analytics.track('conflict_occurred', {
    field: conflict.field,
    documentId: task.getId(),  // Use getId() method
    resolution: 'lww'
  })
})

// Review conflicts
console.log(`${conflicts.length} conflicts in last hour`)
```

### Custom Conflict Handlers ❌ NOT IN v0.1.0

**⚠️ This feature is not yet implemented in v0.1.0. Coming in a future version.**

Proposed API for implementing custom resolution logic for specific fields:

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
const task = sync.document<Task>('task-123', {  // ❌ document() only takes id parameter
  conflictHandlers: {  // ❌ conflictHandlers option doesn't exist
    // Custom handler for priority field
    priority: (local, remote, localTime, remoteTime) => {
      // Always prefer 'critical' priority
      if (local === 'critical' || remote === 'critical') {
        return 'critical'
      }

      // Otherwise use LWW
      return localTime > remoteTime ? local : remote
    },

    // Custom handler for assignee field
    assignee: (local, remote, localTime, remoteTime) => {
      // Never allow unassigning (null)
      if (local === null) return remote
      if (remote === null) return local

      // Otherwise LWW
      return localTime > remoteTime ? local : remote
    }
  }
})
```

**Current v0.1.0 workaround:** Conflicts resolve automatically with LWW. For custom logic, implement it in your application code before calling `update()`.

### Manual Conflict Resolution ❌ NOT IN v0.1.0

**⚠️ This feature is not yet implemented in v0.1.0. Coming in a future version.**

Proposed API for resolving conflicts manually in complex scenarios:

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
task.onConflict(async (conflict) => {  // ❌ onConflict() doesn't exist
  if (conflict.field === 'description') {
    // Show UI for user to choose
    const userChoice = await showConflictDialog({
      local: conflict.local,
      remote: conflict.remote
    })

    // Apply user's choice
    await task.update({
      [conflict.field]: userChoice
    })
  }
})
```

**Current v0.1.0 capability:** You can manually merge documents using `doc.merge(otherDoc)`:

```typescript
// ✅ WORKS IN v0.1.0 - Manual document merging
// Need two separate SyncKit instances to simulate different clients
const syncA = new SyncKit({ storage: 'memory', name: 'client-a' })
const syncB = new SyncKit({ storage: 'memory', name: 'client-b' })
await syncA.init()
await syncB.init()

const docA = syncA.document<Task>('task-123')
const docB = syncB.document<Task>('task-123')

// Make changes to both documents
await docA.update({ title: 'Version A' })
await docB.update({ priority: 'high' })

// Merge docB into docA (LWW resolution applied automatically)
await docA.merge(docB)

console.log(docA.get())  // Has both changes merged
```

---

## Text Editing with CRDTs ❌ NOT IN v0.1.0

**⚠️ Text CRDT is not yet implemented in v0.1.0. Coming in a future version.**

For **collaborative text editing**, LWW doesn't work—you need a **Text CRDT**.

### Why LWW Fails for Text

```typescript
// Document: "Hello World"

// Client A inserts at position 6
"Hello World" → "Hello Brave World"

// Client B inserts at position 6
"Hello World" → "Hello Beautiful World"

// LWW result: One insertion lost! ❌
```

### Proposed SyncKit Text CRDT API (Future)

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
// Use Text CRDT for collaborative editing
const doc = sync.text('document-123')  // ❌ text() method doesn't exist

// Subscribe to changes
doc.subscribe((content) => {
  editor.setValue(content)
})

// Insert text at position
await doc.insert(6, 'Brave ')

// Both inserts preserved: "Hello Brave Beautiful World" ✅
```

**Text CRDT guarantees (when implemented):**
- ✅ **All edits preserved** - No character loss
- ✅ **Conflict-free** - Automatic merge
- ✅ **Convergence** - All clients reach same state
- ✅ **Intention preserved** - Character positions maintained

**Current v0.1.0 workaround:** For simple text fields, use LWW documents and accept that last-write-wins. For collaborative editing, consider using a third-party library like Yjs or Automerge until Text CRDT is implemented.

**See:** [Collaborative Editor Example](../../examples/collaborative-editor/) (uses document-level sync, not character-level)

---

## Best Practices

### 1. Design to Avoid Conflicts

**Minimize conflict surface area:**

```typescript
// ❌ Bad: Single shared description field
interface Task {
  id: string
  description: string  // Multiple users editing = conflicts
}

// ✅ Good: Separate comment thread
interface Task {
  id: string
  description: string  // Owner only
  comments: Comment[]  // Multiple users can add without conflict
}

interface Comment {
  id: string
  author: string
  text: string
  timestamp: number
}
```

### 2. Use Field-Level Ownership

Assign **ownership** to reduce conflicts:

```typescript
interface Task {
  id: string
  title: string        // Creator only
  assignee: string     // Manager only
  status: string       // Assignee only
  notes: string        // Anyone (expect conflicts)
}
```

### 3. Use Timestamps for Ordering

Track when changes happened:

```typescript
interface Task {
  id: string
  title: string
  lastEditedBy: string
  lastEditedAt: number  // Helps users understand why value changed
}

await task.update({
  title: 'New title',
  lastEditedBy: currentUser.id,
  lastEditedAt: Date.now()
})
```

### 4. Test Offline Scenarios ❌ NOT IN v0.1.0

**⚠️ Network connectivity APIs are not yet implemented in v0.1.0.**

Most conflicts occur when users work offline. Proposed testing approach (for when network sync is available):

```typescript
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
// Simulate offline conflict
async function testConflict() {
  const taskA = syncA.document<Task>('task-1')
  const taskB = syncB.document<Task>('task-1')

  // Disconnect both clients
  await syncA.disconnect()  // ❌ disconnect() doesn't exist
  await syncB.disconnect()  // ❌ disconnect() doesn't exist

  // Make conflicting changes
  await taskA.update({ title: 'Version A' })
  await taskB.update({ title: 'Version B' })

  // Reconnect and observe resolution
  await syncA.reconnect()  // ❌ reconnect() doesn't exist
  await syncB.reconnect()  // ❌ reconnect() doesn't exist

  // Both should converge to same value (LWW)
  const finalA = taskA.get()
  const finalB = taskB.get()

  console.assert(finalA.title === finalB.title, 'Conflict resolution failed')
}
```

**Current v0.1.0 testing approach:** Test manual merging with `doc.merge()`:

```typescript
// ✅ WORKS IN v0.1.0 - Test manual document merging
async function testMerge() {
  // Create two separate SyncKit instances to simulate different clients
  const syncA = new SyncKit({ storage: 'memory', name: 'client-a' })
  const syncB = new SyncKit({ storage: 'memory', name: 'client-b' })
  await syncA.init()
  await syncB.init()

  const taskA = syncA.document<Task>('task-1')
  const taskB = syncB.document<Task>('task-1')

  // Make conflicting changes
  await taskA.update({ title: 'Version A' })
  await taskB.update({ title: 'Version B' })

  // Manually merge B into A
  await taskA.merge(taskB)

  // Check LWW resolution (later timestamp wins)
  const result = taskA.get()
  console.log('Merged title:', result.title)  // Will be 'Version B' (later timestamp)
}
```

### 5. Show Conflict Indicators ❌ NOT IN v0.1.0

**⚠️ Conflict detection callbacks are not yet implemented in v0.1.0.**

Proposed approach for letting users know when conflicts occurred:

```tsx
// ❌ NOT IMPLEMENTED - This code will NOT work in v0.1.0
function TaskItem({ taskId }: { taskId: string }) {
  const sync = useSyncKit()  // Get SyncKit from context
  const [task, { update }] = useSyncDocument<Task>(taskId)
  const [conflicted, setConflicted] = useState(false)

  useEffect(() => {
    const doc = sync.document<Task>(taskId)
    const unsubscribe = doc.onConflict(() => {  // ❌ onConflict() doesn't exist
      setConflicted(true)
      setTimeout(() => setConflicted(false), 3000)
    })
    return unsubscribe
  }, [taskId, sync])

  return (
    <div className={conflicted ? 'conflicted' : ''}>
      {conflicted && <span>⚠️ Merged with changes from another user</span>}
      <input
        value={task.title || ''}
        onChange={(e) => update({ title: e.target.value })}
      />
    </div>
  )
}
```

**Current v0.1.0 approach:** Conflicts resolve silently with LWW. To show updates, use the `subscribe()` callback:

```tsx
// ✅ WORKS IN v0.1.0 - Show when document updates
function TaskItem({ taskId }: { taskId: string }) {
  const [task, { update }] = useSyncDocument<Task>(taskId)
  const [justUpdated, setJustUpdated] = useState(false)
  const [updateCount, setUpdateCount] = useState(0)

  useEffect(() => {
    // useSyncDocument internally uses subscribe(), so task changes trigger this effect
    // Increment counter on each task change to show update indicator
    if (updateCount > 0) {  // Skip first render
      setJustUpdated(true)
      const timer = setTimeout(() => setJustUpdated(false), 2000)
      return () => clearTimeout(timer)
    }
    setUpdateCount(prev => prev + 1)
  }, [task.title, task.completed, task.assignee])  // Track specific fields that matter

  return (
    <div className={justUpdated ? 'updated' : ''}>
      {justUpdated && <span>✓ Updated</span>}
      <input
        value={task.title || ''}
        onChange={(e) => update({ title: e.target.value })}
      />
    </div>
  )
}
```

---

## Advanced Topics

### Clock Skew Handling ❌ NOT IN v0.1.0

**⚠️ Server-based clock skew handling requires network sync (not in v0.1.0).**

LWW depends on accurate timestamps. When network sync is implemented, SyncKit will handle clock skew automatically:

```typescript
// ❌ NOT IMPLEMENTED - Requires network sync (future version)
// Server timestamps used for conflict resolution
// Client timestamps adjusted based on server offset

// Client A: Local time 10:00:00, Server time 10:00:05 (5s ahead)
await task.update({ title: 'A' })  // Will be adjusted to 10:00:05

// Client B: Local time 10:00:01, Server time 10:00:01 (in sync)
await task.update({ title: 'B' })  // Timestamp: 10:00:01

// Result: Client A wins (adjusted timestamp is later)
```

**Current v0.1.0 behavior:** Uses local client timestamps via `Date.now()`. For manual merging with `doc.merge()`, the later timestamp wins based on local clocks.

### Vector Clocks (Future)

For more precise conflict detection, SyncKit will support **vector clocks** in v0.2.0:

```typescript
// ❌ NOT IMPLEMENTED - Future API (v0.2.0)
const sync = new SyncKit({
  serverUrl: 'ws://localhost:8080',
  conflictResolution: 'vector-clock'  // ❌ This option doesn't exist yet
})

// Will detect causality violations
// Can identify concurrent edits vs sequential edits
```

### Custom CRDT Types

Implement custom CRDTs for specific use cases:

```typescript
// Example: Sum counter (additions never conflict)
class SumCounter {
  private deltas: Map<string, number> = new Map()

  add(clientId: string, amount: number) {
    const current = this.deltas.get(clientId) || 0
    this.deltas.set(clientId, current + amount)
  }

  get value(): number {
    return Array.from(this.deltas.values()).reduce((a, b) => a + b, 0)
  }

  merge(other: SumCounter) {
    // Merge is commutative and associative
    for (const [clientId, delta] of other.deltas) {
      const current = this.deltas.get(clientId) || 0
      this.deltas.set(clientId, Math.max(current, delta))
    }
  }
}
```

---

## Troubleshooting

### Issue: "My changes keep getting overwritten"

**Cause:** Another client editing same field with later timestamp

**Solutions:**
1. **Use field-level ownership** - Assign specific fields to specific users
2. **Implement custom handler** - Preserve important data (not in v0.1.0 - coming in future version)
3. **Use optimistic locking** - Warn users about concurrent edits (example below)

```typescript
// ✅ WORKS IN v0.1.0 - Optimistic locking pattern
interface Task {
  id: string
  title: string
  version: number  // Increment on every update
}

async function updateTask(sync: SyncKit, task: Task, updates: Partial<Task>) {
  const current = sync.document<Task>(task.id).get()

  if (current.version !== task.version) {
    throw new Error('Task was modified by another user. Please refresh.')
  }

  await sync.document<Task>(task.id).update({
    ...updates,
    version: task.version + 1
  })
}
```

### Issue: "Conflicts not detected" ❌ NOT IN v0.1.0

**⚠️ Conflict detection callbacks are not yet implemented in v0.1.0.**

**Proposed solution (for future version):**
```typescript
// ❌ NOT IMPLEMENTED - onConflict() doesn't exist in v0.1.0
// Subscribe before making changes
const task = sync.document<Task>('task-123')
task.onConflict((conflict) => {  // ❌ onConflict() doesn't exist
  console.log('Conflict:', conflict)
})

// Now make changes
await task.update({ title: 'New' })
```

**Current v0.1.0:** Conflicts resolve automatically with LWW. Use `doc.subscribe()` to monitor all changes (not just conflicts):
```typescript
// ✅ WORKS IN v0.1.0 - Monitor all document changes
const task = sync.document<Task>('task-123')
task.subscribe((data) => {
  console.log('Document updated:', data)
})
```

### Issue: "Text editing loses characters" ❌ NOT IN v0.1.0

**Cause:** Using LWW for text fields instead of Text CRDT

**⚠️ Text CRDT is not yet implemented in v0.1.0.**

**Proposed solution (for future version):**
```typescript
// ❌ Don't use document.update() for collaborative text
await task.update({ description: newText })

// ✅ Use Text CRDT for collaborative editing (NOT YET AVAILABLE)
const description = sync.text('task-123-description')  // ❌ text() doesn't exist
await description.insert(position, newText)
```

**Current v0.1.0 limitations:**
- LWW documents will lose concurrent text edits (last write wins)
- For single-user text editing, LWW is fine
- For collaborative text editing, consider using Yjs or Automerge alongside SyncKit until Text CRDT is implemented

---

## Summary

**Key Takeaways for v0.1.0:**

1. **LWW is automatic** - Conflicts resolve automatically with Last-Write-Wins (built-in, no configuration needed)
2. **Field-level granularity** - Different fields can be updated independently without conflicts
3. **Manual merging available** - Use `doc.merge(otherDoc)` to manually merge documents with LWW resolution
4. **Design to avoid conflicts** - Field-level ownership, separate comment threads
5. **Future features coming** - Conflict callbacks, custom handlers, Text CRDT in later versions

**Key Takeaways for Future Versions:**

3. **Test offline scenarios** - Most conflicts occur when users work offline (requires network sync)
4. **Text is special** - Use Text CRDT for collaborative editing (coming in v0.2.0)
5. **Know when to intervene** - Custom handlers for business logic (coming soon)
6. **Show users what happened** - Conflict indicators build trust (requires onConflict callbacks)

**v0.1.0 Conflict Resolution Decision Tree:**

```
Is it collaborative text editing?
  → YES: Wait for Text CRDT (v0.2.0) or use Yjs/Automerge
  → NO: Continue

Is data additive (logs, comments)?
  → YES: No conflicts possible (append-only)
  → NO: Continue

Do different users own different fields?
  → YES: No conflicts likely (separate ownership)
  → NO: Continue

Are conflicts acceptable (last write wins)?
  → YES: Use default LWW (automatic in v0.1.0)
  → NO: Wait for custom handlers (future version) or implement logic in app code
```

**Next Steps:**

- Learn about [Performance Optimization](./performance.md)
- Explore [Testing Conflict Scenarios](./testing.md)
- See [Collaborative Editor Example](../../examples/collaborative-editor/)

---

**Conflicts resolved! 🎉**
