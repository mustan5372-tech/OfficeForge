# OfficeForge Architecture

## Overview

OfficeForge is a desktop productivity suite containing three integrated applications:

1. **OfficeForge Writer** — Word processor
2. **OfficeForge Sheets** — Spreadsheet application
3. **OfficeForge Slides** — Presentation editor

The suite runs as a single Tauri 2 desktop application with a Rust backend and a React/TypeScript frontend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Tauri Shell                        │
│  (Native window, menus, file dialogs, system tray)  │
├─────────────────────────────────────────────────────┤
│              React / TypeScript Frontend             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Writer   │  │  Sheets  │  │  Slides  │          │
│  │   UI      │  │   UI     │  │   UI     │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │              │              │                │
│  ┌────┴──────────────┴──────────────┴────┐          │
│  │         Shared UI Components           │          │
│  │  (Ribbon, Panels, Dialogs, Themes)     │          │
│  └────────────────┬──────────────────────┘          │
├───────────────────┼─────────────────────────────────┤
│          Tauri IPC Bridge (Commands)                 │
├───────────────────┼─────────────────────────────────┤
│              Rust Backend                            │
│  ┌────────────────┴──────────────────────┐          │
│  │         Command / Service Layer        │          │
│  │   (Tauri commands, state management)   │          │
│  └────┬───────────┬───────────┬──────────┘          │
│       │           │           │                      │
│  ┌────▼─────┐ ┌───▼────┐ ┌───▼─────┐               │
│  │  Writer  │ │ Sheets │ │ Slides  │               │
│  │  Engine  │ │ Engine │ │ Engine  │               │
│  └────┬─────┘ └───┬────┘ └───┬─────┘               │
│       │           │           │                      │
│  ┌────▼───────────▼───────────▼──────────┐          │
│  │            Core / Shared               │          │
│  │  (Document abstractions, Undo/Redo,    │          │
│  │   Clipboard, Search, Error handling)   │          │
│  └────────────────┬──────────────────────┘          │
│                   │                                  │
│  ┌────────────────▼──────────────────────┐          │
│  │          OOXML Engine                  │          │
│  │  (ZIP, XML, Package, Relationships)   │          │
│  └────────────────┬──────────────────────┘          │
│                   │                                  │
│  ┌────────────────▼──────────────────────┐          │
│  │           Storage Layer                │          │
│  │  (File I/O, Autosave, Recovery,       │          │
│  │   Recent Files, Temp management)      │          │
│  └───────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation / UI Layer (React + TypeScript)

- Renders the home screen, editor workspaces, dialogs, and menus
- Manages UI state (panel visibility, zoom level, selection highlights)
- Dispatches user actions to the Rust backend via Tauri IPC commands
- Receives document state updates from backend via events/responses
- Does NOT contain business logic, document models, or calculation engines

### 2. Tauri IPC Bridge

- Typed command interface between frontend and backend
- Serialization via serde (Rust) ↔ JSON ↔ TypeScript types
- Commands are thin wrappers that delegate to the service layer
- Events for backend-to-frontend notifications (autosave, errors, progress)

### 3. Command / Service Layer (Rust)

- Orchestrates operations across engines
- Manages application-wide state (open documents, preferences, recent files)
- Translates IPC commands into engine operations
- Handles file open/save workflows
- Coordinates undo/redo at the document level

### 4. Document Engines (Rust)

Each application has its own engine with an independent document model:

- **Writer Engine**: Paragraph/run-based rich text model, page layout
- **Sheets Engine**: Sparse cell storage, formula parser, dependency graph, recalculation
- **Slides Engine**: Slide/object tree, coordinate system, shape rendering data

Engines are pure Rust libraries with no UI dependencies.

### 5. Core / Shared (Rust)

- `DocumentId`, `UndoStack`, `Clipboard`, `SearchEngine`
- Common types: `Color`, `FontSpec`, `Measurement`, `Border`
- Error types and result wrappers
- Logging and tracing setup

### 6. OOXML Engine (Rust)

- ZIP package read/write with security validation
- Content types and relationships parsing
- Format-specific adapters: `DocxAdapter`, `XlsxAdapter`, `PptxAdapter`
- Round-trip preservation of unknown elements
- Import warning collection

### 7. Storage Layer (Rust)

- Atomic file saves (write to temp, then rename)
- Autosave timer and recovery file management
- Recent file history (JSON-based local store)
- Dirty-state tracking
- Temp file cleanup on startup

## Data Flow: Edit Operation

```
User types "Hello" in Writer
        │
        ▼
[Frontend] Captures keystroke → calls Tauri command `writer_insert_text`
        │
        ▼
[IPC Bridge] Deserializes command payload
        │
        ▼
[Service Layer] Looks up active WriterDocument by ID
        │
        ▼
[Writer Engine] Creates InsertText operation → pushes to UndoStack
                → Mutates document model → Returns updated state
        │
        ▼
[Service Layer] Serializes relevant document state changes
        │
        ▼
[IPC Bridge] Returns response to frontend
        │
        ▼
[Frontend] Updates React state → Re-renders affected components
```

## Data Flow: File Open

```
User clicks "Open File" → selects .docx
        │
        ▼
[Tauri Shell] Native file dialog → returns file path
        │
        ▼
[Service Layer] Reads file bytes from Storage Layer
        │
        ▼
[OOXML Engine] Validates ZIP → Parses package → Resolves relationships
        │
        ▼
[DocxAdapter] Maps OOXML elements → Writer document model
        │ (collects import warnings)
        ▼
[Service Layer] Stores document in application state
        │ Returns document summary + any warnings
        ▼
[Frontend] Renders document in Writer workspace
```

## Key Design Decisions

1. **Tauri 2 over Electron**: Smaller binary, native performance, Rust-native backend
2. **Separate document models**: Writer, Sheets, Slides each have purpose-built data structures
3. **Command pattern for edits**: All mutations go through typed command objects for undo/redo
4. **Sparse storage for Sheets**: Only occupied cells are stored; blank cells cost nothing
5. **Frontend renders, backend owns data**: The frontend is a view layer; the Rust backend is the source of truth
6. **Round-trip preservation**: Unknown OOXML elements are preserved as opaque XML fragments

## Module Dependency Graph

```
officeforge-app
  ├── officeforge-core
  ├── officeforge-writer
  │     └── officeforge-core
  ├── officeforge-sheets
  │     └── officeforge-core
  ├── officeforge-slides
  │     └── officeforge-core
  ├── officeforge-ooxml
  │     ├── officeforge-core
  │     ├── officeforge-writer (types only)
  │     ├── officeforge-sheets (types only)
  │     └── officeforge-slides (types only)
  ├── officeforge-storage
  │     └── officeforge-core
  └── officeforge-clipboard
        └── officeforge-core
```
