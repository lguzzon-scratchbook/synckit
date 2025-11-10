# SyncKit Project Structure

This document explains the organization and purpose of each directory in the SyncKit monorepo.

---

## 📂 Top-Level Structure

```
synckit/
├── core/           # Rust core engine (performance-critical code)
├── sdk/            # TypeScript SDK (developer-facing API)
├── server/         # Multi-language server implementations
├── protocol/       # Protocol definitions and formal specs
├── examples/       # Example applications and demos
├── docs/           # Documentation (guides, API, architecture)
├── tests/          # Cross-cutting tests (integration, chaos, perf)
└── scripts/        # Build, deployment, and utility scripts
```

---

## 🦀 `core/` - Rust Core Engine

The heart of SyncKit. Written in Rust for performance, compiled to WASM for web and native for desktop/mobile.

```
core/
├── src/
│   ├── lib.rs                  # Main library entry point
│   ├── sync/                   # Synchronization algorithms
│   │   ├── mod.rs              # Sync module exports
│   │   ├── vector_clock.rs     # Vector clock implementation
│   │   ├── lww.rs              # Last-Write-Wins merge algorithm
│   │   ├── delta.rs            # Delta computation
│   │   └── conflict.rs         # Conflict resolution strategies
│   ├── crdt/                   # CRDT data structures
│   │   ├── mod.rs              # CRDT module exports
│   │   ├── or_set.rs           # Observed-Remove Set
│   │   ├── pn_counter.rs       # Positive-Negative Counter
│   │   ├── fractional_index.rs # Fractional indexing for lists
│   │   └── text/               # Text CRDT (YATA-based)
│   │       ├── mod.rs          # Text CRDT exports
│   │       ├── block.rs        # Block structure
│   │       ├── operations.rs   # Text operations
│   │       └── peritext.rs     # Rich text formatting (Peritext)
│   ├── protocol/               # Wire protocol implementation
│   │   ├── mod.rs              # Protocol module exports
│   │   ├── encoder.rs          # Binary encoding (Protobuf)
│   │   ├── decoder.rs          # Binary decoding
│   │   ├── websocket.rs        # WebSocket protocol handler
│   │   └── compression.rs      # Compression (gzip/Brotli)
│   ├── storage/                # Storage abstraction
│   │   ├── mod.rs              # Storage module exports
│   │   ├── traits.rs           # Storage trait definitions
│   │   └── memory.rs           # In-memory storage (testing)
│   ├── wasm/                   # WASM bindings
│   │   ├── mod.rs              # WASM module entry
│   │   └── bindings.rs         # JavaScript bindings (wasm-bindgen)
│   └── document.rs             # Document structure and operations
├── tests/                      # Rust unit and integration tests
│   ├── lww_tests.rs            # LWW algorithm tests
│   ├── crdt_tests.rs           # CRDT convergence tests
│   └── protocol_tests.rs       # Protocol encoding/decoding tests
├── benches/                    # Performance benchmarks
│   ├── lww_bench.rs            # LWW performance benchmarks
│   ├── crdt_bench.rs           # CRDT operation benchmarks
│   └── protocol_bench.rs       # Serialization benchmarks
└── Cargo.toml                  # Rust workspace configuration
```

**Key Responsibilities:**
- ✅ Sync algorithms (LWW, vector clocks, delta computation)
- ✅ CRDT implementations (OR-Set, PN-Counter, Text)
- ✅ Binary protocol (Protobuf encoding/decoding)
- ✅ Performance-critical operations (<1ms local, <100ms sync)
- ✅ WASM compilation for web browsers

---

## 📦 `sdk/` - TypeScript SDK

Developer-facing API. Wraps the Rust core and provides framework integrations.

```
sdk/
├── src/
│   ├── index.ts                # Main SDK entry point
│   ├── synckit.ts              # Core SyncKit class
│   ├── document.ts             # Document API (Tier 1: LWW)
│   ├── text.ts                 # Text API (Tier 2: CRDT text)
│   ├── counter.ts              # Counter API (Tier 3: PN-Counter)
│   ├── set.ts                  # Set API (Tier 3: OR-Set)
│   ├── offline-queue.ts        # Offline operation queue
│   ├── adapters/               # Framework-specific adapters
│   │   ├── react.ts            # React hooks (useSyncDocument, etc.)
│   │   ├── vue.ts              # Vue 3 composables
│   │   └── svelte.ts           # Svelte stores
│   ├── hooks/                  # Shared hook logic
│   │   ├── useSubscription.ts  # Generic subscription hook
│   │   └── useOffline.ts       # Offline state management
│   ├── storage/                # Storage adapters
│   │   ├── adapter.ts          # Storage adapter interface
│   │   ├── indexeddb.ts        # IndexedDB implementation
│   │   ├── opfs.ts             # OPFS implementation (web performance)
│   │   ├── sqlite.ts           # SQLite implementation (Node/Tauri)
│   │   └── localstorage.ts     # LocalStorage fallback
│   └── utils/                  # Utility functions
│       ├── wasm-loader.ts      # WASM module loading
│       ├── retry.ts            # Exponential backoff retry
│       └── validation.ts       # Input validation
├── tests/                      # TypeScript tests
│   ├── sdk.test.ts             # SDK integration tests
│   ├── offline.test.ts         # Offline queue tests
│   └── storage.test.ts         # Storage adapter tests
└── package.json                # NPM package configuration
```

**Key Responsibilities:**
- ✅ Simple, intuitive API (`sync.document()`, `sync.text()`)
- ✅ Framework integrations (React, Vue, Svelte)
- ✅ Offline queue and retry logic
- ✅ Storage adapter auto-detection
- ✅ WASM module loading and management

---

## 🖥️ `server/` - Multi-Language Servers

Reference server implementations in multiple languages. All implement the same Protobuf protocol.

```
server/
├── typescript/                 # TypeScript reference (v0.1.0 primary)
│   ├── src/
│   │   ├── index.ts            # Server entry point
│   │   ├── websocket.ts        # WebSocket connection handler
│   │   ├── routes/             # HTTP endpoints
│   │   │   ├── sync.ts         # Sync endpoints
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   └── health.ts       # Health check
│   │   ├── middleware/         # Express/Hono middleware
│   │   │   ├── auth.ts         # JWT authentication
│   │   │   ├── cors.ts         # CORS configuration
│   │   │   └── error.ts        # Error handling
│   │   ├── services/           # Business logic
│   │   │   ├── sync-coordinator.ts  # Sync orchestration
│   │   │   ├── storage.ts      # Database abstraction
│   │   │   └── auth.ts         # Auth service
│   │   └── config.ts           # Configuration management
│   ├── Dockerfile              # Docker container
│   ├── fly.toml                # Fly.io deployment config
│   └── package.json            # Dependencies
├── python/                     # Python reference (v0.2.0+)
│   ├── src/
│   │   ├── main.py             # FastAPI app entry
│   │   ├── websocket.py        # WebSocket handler
│   │   ├── sync.py             # Sync coordinator
│   │   └── storage.py          # Database layer
│   └── requirements.txt        # Python dependencies
├── go/                         # Go reference (v0.2.0+)
│   ├── src/
│   │   ├── main.go             # Server entry
│   │   ├── websocket.go        # WebSocket handler
│   │   └── sync.go             # Sync coordinator
│   └── go.mod                  # Go module
└── rust/                       # Rust reference (v0.3.0+)
    ├── src/
    │   ├── main.rs             # Server entry
    │   ├── websocket.rs        # WebSocket handler
    │   └── sync.rs             # Sync coordinator
    └── Cargo.toml              # Rust dependencies
```

**Key Responsibilities:**
- ✅ WebSocket connection management
- ✅ Delta distribution to connected clients
- ✅ Authentication and authorization (JWT + RBAC)
- ✅ Database persistence (PostgreSQL, MongoDB)
- ✅ Redis pub/sub for multi-server coordination

---

## 📡 `protocol/` - Protocol Definitions

Protocol specifications and formal verification.

```
protocol/
├── specs/                      # Protobuf specifications
│   ├── sync.proto              # Core sync protocol
│   ├── messages.proto          # Message formats
│   ├── auth.proto              # Authentication messages
│   └── types.proto             # Shared types (VectorClock, etc.)
└── tla/                        # TLA+ formal specifications
    ├── lww_merge.tla           # LWW merge algorithm
    ├── vector_clock.tla        # Vector clock properties
    ├── convergence.tla         # Convergence proof
    └── README.md               # How to run TLA+ model checking
```

**Key Responsibilities:**
- ✅ Language-agnostic protocol definition
- ✅ Formal verification of algorithms
- ✅ Binary message format specification
- ✅ Contract between client and server

---

## 📚 `examples/` - Example Applications

Real-world examples demonstrating different tiers of SyncKit.

```
examples/
├── todo-app/                   # Tier 1: Simple LWW sync
│   ├── src/
│   │   ├── App.tsx             # React app
│   │   ├── useTodos.ts         # Custom hook using SyncKit
│   │   └── components/         # UI components
│   ├── README.md               # Setup and usage
│   └── package.json
├── collaborative-editor/       # Tier 2: Text CRDT
│   ├── src/
│   │   ├── App.tsx             # React app
│   │   ├── Editor.tsx          # Text editor component
│   │   └── useCollabText.ts    # Collaborative text hook
│   ├── README.md
│   └── package.json
└── real-world/                 # Tier 1+2+3: Production example
    ├── src/
    │   ├── App.tsx             # Main application
    │   ├── features/           # Feature modules
    │   └── sync/               # SyncKit integration layer
    ├── README.md
    └── package.json
```

**Key Responsibilities:**
- ✅ Demonstrate best practices
- ✅ Onboarding new developers (copy-paste ready)
- ✅ Showcase different use cases
- ✅ Serve as integration tests

---

## 📖 `docs/` - Documentation

Comprehensive documentation for developers and users.

```
docs/
├── api/                        # API reference documentation
│   ├── sync-document.md        # Document API (Tier 1)
│   ├── sync-text.md            # Text API (Tier 2)
│   ├── sync-counter.md         # Counter API
│   ├── sync-set.md             # Set API
│   └── react-hooks.md          # React hooks reference
├── architecture/               # System design documentation
│   ├── SYSTEM_DESIGN.md        # High-level architecture
│   ├── PROTOCOL.md             # Wire protocol details
│   ├── CRDTS.md                # CRDT algorithms explained
│   ├── PERFORMANCE.md          # Performance characteristics
│   └── SECURITY.md             # Security model
└── guides/                     # User guides
    ├── getting-started.md      # 5-minute quick start
    ├── installation.md         # Installation instructions
    ├── offline-first.md        # Offline-first patterns
    ├── conflict-resolution.md  # Handling conflicts
    ├── deployment.md           # Server deployment
    ├── migration-from-firebase.md     # Firebase migration
    ├── migration-from-supabase.md     # Supabase migration
    └── migration-from-yjs.md          # Yjs migration
```

**Key Responsibilities:**
- ✅ Complete API documentation
- ✅ Architecture explanations
- ✅ User guides and tutorials
- ✅ Migration guides from competitors

---

## 🧪 `tests/` - Cross-Cutting Tests

Tests that span multiple components (client + server).

```
tests/
├── integration/                # End-to-end integration tests
│   ├── sync.test.ts            # Basic sync flow
│   ├── offline.test.ts         # Offline → online transitions
│   ├── multi-client.test.ts    # Multiple clients syncing
│   └── conflict.test.ts        # Conflict resolution
├── chaos/                      # Chaos engineering tests
│   ├── network-partition.test.ts    # Split-brain scenarios
│   ├── packet-loss.test.ts          # Packet loss simulation
│   ├── latency.test.ts              # High latency simulation
│   └── disconnect.test.ts           # Random disconnections
└── performance/                # Performance benchmarks
    ├── sync-latency.bench.ts   # Sync latency measurements
    ├── memory.bench.ts         # Memory usage profiling
    ├── throughput.bench.ts     # Operations per second
    └── bundle-size.bench.ts    # Bundle size verification
```

**Key Responsibilities:**
- ✅ Verify end-to-end functionality
- ✅ Test under adverse network conditions
- ✅ Ensure performance targets met
- ✅ Catch integration issues early

---

## 🛠️ `scripts/` - Build and Utility Scripts

Automation scripts for building, testing, and deploying.

```
scripts/
├── build-wasm.sh               # Build Rust → WASM
├── build-sdk.sh                # Build TypeScript SDK
├── build-server.sh             # Build server (all languages)
├── run-tests.sh                # Run all tests
├── run-chaos-tests.sh          # Run chaos engineering tests
├── run-benchmarks.sh           # Run performance benchmarks
├── publish.sh                  # Publish packages to NPM/Crates.io
├── deploy-server.sh            # Deploy server to Fly.io/Railway
└── setup-dev.sh                # Setup development environment
```

**Key Responsibilities:**
- ✅ Automate repetitive tasks
- ✅ Ensure consistent builds
- ✅ Simplify deployment
- ✅ Developer onboarding automation

---

## 🔗 Dependency Flow

```
┌─────────────────┐
│   Examples      │ (use SDK + Server)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      SDK        │ (wraps Rust Core)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Rust Core     │ (implements Protocol)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Protocol      │ (defines contract)
└─────────────────┘
         ▲
         │
┌────────┴────────┐
│    Server(s)    │ (implements Protocol)
└─────────────────┘
```

**Key Insight:** Protocol is the source of truth. Both client and server implement it independently.

---

## 📦 Build Artifacts

After building, you'll have:

```
synckit/
├── core/pkg/                   # WASM build output
│   ├── synckit_core_bg.wasm    # WASM binary (<15KB)
│   ├── synckit_core.js         # JS bindings
│   └── synckit_core.d.ts       # TypeScript types
├── sdk/dist/                   # SDK build output
│   ├── index.js                # Main entry
│   ├── index.d.ts              # TypeScript types
│   └── adapters/               # Framework adapters
└── server/*/dist/              # Server build outputs
```

---

## 🚀 Getting Started

To start developing:

```bash
# Setup development environment
./scripts/setup-dev.sh

# Build Rust core to WASM
./scripts/build-wasm.sh

# Build TypeScript SDK
./scripts/build-sdk.sh

# Run tests
./scripts/run-tests.sh

# Start development server
cd server/typescript && bun run dev
```

---

## 📝 Notes

**Monorepo Management:**
- We use a monorepo for easier cross-component development
- Rust workspace for core + WASM
- NPM workspaces for TypeScript packages
- Independent versioning per package

**Why This Structure?**
- ✅ Clear separation of concerns
- ✅ Easy to navigate and understand
- ✅ Supports multi-language development
- ✅ Independent testing per component
- ✅ Scalable as project grows

---

**Questions about the structure?** See [ROADMAP.md](ROADMAP.md) for implementation timeline or reach out in discussions!