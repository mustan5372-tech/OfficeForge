# OfficeForge Architecture Decisions

## ADR-001: Desktop Framework — Tauri 2

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Need a cross-platform desktop framework for a productivity suite with complex UI and Rust backend.

**Decision**: Use Tauri 2 with React/TypeScript frontend.

**Rationale**:
- Native Rust backend integration without FFI overhead
- Smaller binary size than Electron (~10-30 MB vs ~150+ MB)
- System webview reduces memory footprint
- Native file dialogs, menus, and window management built-in
- Active maintenance and growing ecosystem
- TypeScript IPC type generation available

**Trade-offs**:
- WebView rendering varies slightly across platforms (acceptable for Windows-first)
- Less mature ecosystem than Electron
- Complex canvas rendering (e.g., page layout) requires custom implementation

---

## ADR-002: Frontend Stack — React + TypeScript + Vite + Tailwind

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Need a productive frontend framework for complex editor UIs.

**Decision**: React 19, TypeScript 5, Vite, Tailwind CSS v4.

**Rationale**:
- React's component model suits complex, stateful editor UIs
- TypeScript provides type safety matching the Rust backend
- Vite provides fast dev server and HMR
- Tailwind provides utility-first styling with consistent design tokens
- Large ecosystem of accessible component libraries

---

## ADR-003: Document Model Separation

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Three applications need document models. Could share a common model or use independent ones.

**Decision**: Each application has its own purpose-built document model. Shared abstractions live in `officeforge-core`.

**Rationale**:
- Writer needs paragraph/run trees, Sheets needs sparse grids, Slides needs positioned objects
- A single unified model would either be too generic or leak domain concerns
- Shared concerns (colors, fonts, metadata) belong in core
- Independent models allow each engine to evolve without constraining the others

---

## ADR-004: Undo/Redo via Command Pattern

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: All three editors need undo/redo. Need a consistent, predictable mechanism.

**Decision**: Use a command/operation pattern where each edit is a reversible operation pushed to an undo stack.

**Rationale**:
- Explicit operations are testable and debuggable
- Natural mapping to user-visible actions
- Undo stack can be bounded to limit memory
- Operations can be serialized for collaborative editing in the future
- Each engine defines its own operation types; the undo stack is generic

---

## ADR-005: OOXML Strategy — Adapter Pattern with Preservation

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Must import/export .docx, .xlsx, .pptx files. OOXML is complex with many optional features.

**Decision**: Build format-specific adapters that map between OOXML and internal models. Preserve unknown elements as opaque data.

**Rationale**:
- No existing Rust crate fully handles OOXML for all three formats
- Custom adapters allow incremental feature support
- Preserving unknown elements prevents data loss during round-trips
- Adapters can be tested independently with sample documents
- Clear separation between parsing (XML/ZIP) and semantic mapping

---

## ADR-006: Sparse Cell Storage for Sheets

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Spreadsheets can have millions of addressable cells but typically only thousands are occupied.

**Decision**: Use `HashMap<CellAddress, Cell>` (or BTreeMap for ordered iteration) rather than a 2D array.

**Rationale**:
- Memory proportional to actual data, not grid dimensions
- Supports arbitrarily large address spaces
- Efficient iteration over populated cells
- Matches how .xlsx files store data (only non-empty cells)

---

## ADR-007: Formula Engine — AST-Based with Dependency Graph

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: Need a formula engine for Sheets that handles cell references, functions, and recalculation.

**Decision**: Parse formulas into an AST, build a dependency graph, and recalculate in topological order.

**Rationale**:
- AST representation allows optimization, display, and evaluation
- Dependency graph enables incremental recalculation
- Cycle detection is straightforward with graph analysis
- Matches how modern spreadsheet engines work
- Extensible for adding new functions

---

## ADR-008: Atomic File Saves

**Status**: Accepted  
**Date**: 2026-10-24

**Context**: File saves must not corrupt data if the process crashes mid-write.

**Decision**: Write to a temporary file in the same directory, then atomically rename to the target path.

**Rationale**:
- Rename is atomic on most filesystems (NTFS, ext4, APFS)
- If the write fails, the original file is untouched
- Standard pattern used by most professional editors
- Autosave uses a separate recovery file path
