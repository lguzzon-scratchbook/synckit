# Contributing to SyncKit

First off, thank you for considering contributing to SyncKit! 🎉

SyncKit is an open source project and we love to receive contributions from the community. There are many ways to contribute, from writing code to improving documentation, reporting bugs, or suggesting new features.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, versions)
- **Additional context** or logs

### Suggesting Features

Feature requests are welcome! Please:

- **Check existing issues** for similar requests
- **Describe the use case** clearly
- **Explain why** this feature would be useful
- **Provide examples** if possible

### Contributing Code

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for any new functionality
4. **Ensure all tests pass**
5. **Update documentation** as needed
6. **Submit a pull request**

### Improving Documentation

Documentation improvements are always appreciated:

- Fix typos or clarify existing docs
- Add missing examples or use cases
- Improve API documentation
- Write tutorials or guides

---

## 🛠️ Development Setup

### Prerequisites

- **Rust** 1.70+ and Cargo
- **Node.js** 18+ or **Bun** 1.0+
- **Git** for version control
- **PostgreSQL** (optional, for server development)

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/synckit.git
cd synckit

# Install dependencies
# (Will be automated with setup script in Phase 1)

# Build Rust core
cd core
cargo build

# Build TypeScript SDK
cd ../sdk
npm install
npm run build

# Run tests
cargo test          # Rust tests
npm test            # TypeScript tests
```

---

## 🏗️ Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed information about the codebase organization.

**Key directories:**
- `core/` - Rust sync engine (WASM + native)
- `sdk/` - TypeScript SDK
- `server/` - Multi-language server implementations
- `protocol/` - Protocol specifications
- `docs/` - Documentation
- `examples/` - Example applications
- `tests/` - Integration and performance tests

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** for any changed functionality
2. **Add tests** to cover your changes
3. **Run the full test suite** and ensure all tests pass
4. **Update ROADMAP.md** if adding major features
5. **Follow the coding standards** below

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No merge conflicts

### Review Process

- Maintainers will review your PR within 48-72 hours
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR

---

## 💻 Coding Standards

### Rust (core/)

- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `rustfmt` for formatting: `cargo fmt`
- Use `clippy` for linting: `cargo clippy`
- Add doc comments (`///`) for public APIs
- Write unit tests alongside code

```rust
/// Merges two documents using Last-Write-Wins strategy.
///
/// # Arguments
/// * `local` - The local document state
/// * `remote` - The remote document state
///
/// # Returns
/// The merged document state
pub fn merge(local: &Document, remote: &Document) -> Document {
    // Implementation
}
```

### TypeScript (sdk/)

- Follow [TypeScript best practices](https://www.typescriptlang.org/)
- Use Prettier for formatting (config in `.prettierrc`)
- Use ESLint for linting (config in `.eslintrc`)
- Use JSDoc comments for exported functions
- Prefer functional programming patterns

```typescript
/**
 * Creates a new synchronized document.
 *
 * @param id - Unique document identifier
 * @param options - Configuration options
 * @returns SyncDocument instance
 *
 * @example
 * ```ts
 * const doc = sync.document<Todo>('todo-123')
 * await doc.update({ completed: true })
 * ```
 */
export function document<T>(id: string, options?: DocumentOptions): SyncDocument<T> {
  // Implementation
}
```

### Testing Standards

- **Unit tests** for individual functions/modules
- **Integration tests** for cross-component functionality
- **Property-based tests** for CRDT operations
- **Performance benchmarks** for critical paths

Aim for >80% code coverage.

---

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear git history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Examples

```
feat(core): implement LWW merge algorithm

- Add vector clock implementation
- Add field-level conflict resolution
- Add delta computation

Closes #42
```

```
fix(sdk): resolve offline queue race condition

The offline queue was not properly handling concurrent
operations during network transitions.

Fixes #128
```

```
docs(api): add examples for sync.text() API

Added comprehensive examples showing:
- Basic text insertion
- Collaborative editing
- Rich text formatting
```

---

## 🎯 Development Phases

We're following a 10-phase development roadmap (see [ROADMAP.md](ROADMAP.md)):

- **Phase 1-3**: Core engine and protocol (in progress)
- **Phase 4-6**: SDK and WASM compilation
- **Phase 7**: Server implementation
- **Phase 8-10**: Testing, documentation, launch

Check the roadmap to see what's currently in development and where help is needed.

---

## ❓ Questions?

- **Technical questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Feature requests**: Open a GitHub Issue with `[Feature]` prefix
- **Security issues**: Email security@synckit.dev (DO NOT open public issues)

---

## 🙏 Thank You!

Your contributions make SyncKit better for everyone. We appreciate your time and effort! ❤️
