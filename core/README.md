# synckit-core

High-performance sync engine for local-first applications. Powers the [SyncKit](https://github.com/Dancode-188/synckit) collaboration SDK.

## What is this?

`synckit-core` is the Rust/WASM core that implements SyncKit's CRDTs:
- **Fugue CRDT** - Collaborative text editing with minimal interleaving
- **Peritext** - Rich text formatting with conflict resolution
- **LWW** - Last-write-wins for document metadata
- **PN-Counter** - Increment/decrement counter
- **OR-Set** - Add/remove set operations

Built for JavaScript consumption via WASM, but usable as a native Rust library.

## Installation

```toml
[dependencies]
synckit-core = "0.2.0"
```

## Usage

### Document Operations

```rust
use synckit_core::{Document, Operation};

// Create a document
let mut doc = Document::new("client-1");

// Insert text
doc.insert(0, "Hello");
doc.insert(5, " World");

// Get text
assert_eq!(doc.text(), "Hello World");

// Generate operations for sync
let ops = doc.pending_operations();
```

### Text CRDT (Fugue)

```rust
use synckit_core::text::FugueReplica;

let mut replica = FugueReplica::new("client-1");

// Insert text
replica.insert(0, "Hello");

// Apply remote operations
replica.apply_operation(remote_op);

// Convert to string
let text = replica.to_string();
```

## Features

- `default` - Core CRDTs with minimal dependencies
- `text-crdt` - Fugue text CRDT with rope data structure
- `full` - All CRDTs, rich text (Peritext), and binary protocol
- `wasm` - WASM bindings for JavaScript

See [Cargo.toml](https://github.com/Dancode-188/synckit/blob/main/core/Cargo.toml) for all available features.

## Architecture

This crate is designed for:
- **WASM compilation** - Small bundle size with aggressive optimization
- **Zero unsafe code** - Pure safe Rust
- **Deterministic behavior** - Same operations produce same results

Optimized profiles:
- `release` - Standard optimization
- `wasm-release` - Size-optimized for WASM (`opt-level = "z"`)

## Documentation

- [Main Repository](https://github.com/Dancode-188/synckit)
- [JavaScript SDK](https://www.npmjs.com/package/@synckit-js/sdk)
- [API Documentation](https://docs.rs/synckit-core)

## Research

Based on published CRDT research:
- **Fugue** - Weidner, Gentle & Kleppmann (2023)
- **Peritext** - Litt, Lim, Kleppmann & van Hardenberg (2021)

## License

MIT - see [LICENSE](https://github.com/Dancode-188/synckit/blob/main/LICENSE)
