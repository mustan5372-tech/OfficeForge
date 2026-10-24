# OfficeForge Implementation Plan

## Phase 0 — Repository Reconnaissance ✅

- [x] Inspect workspace (empty directory)
- [x] Check toolchain (Node.js 24.13.1 available, Rust needs installation)
- [x] Create architecture documents
- [x] Create dependency assessment
- [x] Create compatibility matrix
- [x] Create decision records
- [x] Create this implementation plan

## Phase 1 — Desktop Foundation

### 1.1 Project Scaffolding
- [ ] Install Rust toolchain
- [ ] Initialize Cargo workspace with core crates
- [ ] Initialize Tauri 2 application
- [ ] Set up React + TypeScript + Vite frontend
- [ ] Configure Tailwind CSS
- [ ] Verify build and launch

### 1.2 Shared Core
- [ ] Define core types: `DocumentId`, `Color`, `FontSpec`, `Measurement`
- [ ] Implement `UndoStack<T>` generic undo/redo
- [ ] Implement error types with `thiserror`
- [ ] Set up `tracing` logging
- [ ] Implement recent file history (JSON store)

### 1.3 Application Shell UI
- [ ] Home screen with app selector
- [ ] Navigation between Writer, Sheets, Slides workspaces
- [ ] Ribbon-style toolbar component
- [ ] File menu (New, Open, Save, Save As, Close)
- [ ] Native file dialogs via Tauri
- [ ] Theme system (light/dark)
- [ ] Status bar component
- [ ] Keyboard shortcut infrastructure

### 1.4 Storage Infrastructure
- [ ] Atomic file save (write temp + rename)
- [ ] Dirty-state tracking
- [ ] Autosave timer with recovery files
- [ ] Recovery detection on startup
- [ ] Temp file cleanup

### 1.5 Smoke Tests
- [ ] Application launches without errors
- [ ] Each workspace view renders
- [ ] File create/save/open round-trip works
- [ ] Rust unit tests pass
- [ ] Frontend builds without errors

## Phase 2 — Writer MVP

### 2.1 Document Model
- [ ] Paragraph and text-run data structures
- [ ] Character formatting (bold, italic, underline, font, size, color)
- [ ] Paragraph formatting (alignment, spacing, indentation)
- [ ] Lists (bulleted, numbered)
- [ ] Tables
- [ ] Images (inline)
- [ ] Hyperlinks
- [ ] Page settings (margins, orientation, paper size)

### 2.2 Editing Engine
- [ ] Text insertion/deletion
- [ ] Cursor and selection model
- [ ] Formatting application to ranges
- [ ] Paragraph splitting/merging
- [ ] Undo/redo integration
- [ ] Copy/cut/paste
- [ ] Find and replace
- [ ] Word count

### 2.3 Writer UI
- [ ] Rich text editor canvas
- [ ] Formatting toolbar (font, size, bold, italic, etc.)
- [ ] Paragraph controls (alignment, spacing, lists)
- [ ] Table insertion and editing
- [ ] Image insertion
- [ ] Page setup dialog
- [ ] Zoom control

### 2.4 Writer File Support
- [ ] OOXML package infrastructure (shared)
- [ ] .docx import (paragraphs, runs, formatting, tables, images)
- [ ] .docx export
- [ ] .txt import/export
- [ ] Round-trip preservation of unsupported elements

### 2.5 Writer Tests
- [ ] Text insertion/deletion unit tests
- [ ] Formatting range tests
- [ ] Paragraph operations tests
- [ ] Undo/redo tests
- [ ] .docx import/export round-trip tests
- [ ] Save and reopen verification

## Phase 3 — Sheets MVP

### 3.1 Workbook Model
- [ ] Sparse cell storage (HashMap-based)
- [ ] Cell value types (String, Number, Boolean, Error, Formula)
- [ ] Cell formatting
- [ ] Multiple worksheets
- [ ] Merged cells
- [ ] Column widths / row heights
- [ ] Frozen panes

### 3.2 Formula Engine
- [ ] Formula tokenizer
- [ ] Formula parser (recursive descent → AST)
- [ ] Cell reference resolution (A1, $A$1, mixed)
- [ ] Range references (A1:B10)
- [ ] Arithmetic operators
- [ ] Dependency graph construction
- [ ] Topological recalculation
- [ ] Circular reference detection
- [ ] Error propagation (#DIV/0!, #VALUE!, #REF!, #NAME?, #N/A)
- [ ] Built-in functions: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA
- [ ] Built-in functions: IF, AND, OR, NOT, IFERROR
- [ ] Built-in functions: SUMIF, COUNTIF
- [ ] Built-in functions: CONCAT, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER
- [ ] Built-in functions: TODAY, DATE, YEAR, MONTH, DAY
- [ ] Built-in functions: INDEX, MATCH

### 3.3 Sheets UI
- [ ] Virtualized grid component
- [ ] Row/column headers
- [ ] Active cell and selection
- [ ] Formula bar
- [ ] Name box
- [ ] Cell editing (inline + formula bar)
- [ ] Worksheet tabs
- [ ] Formatting controls (font, color, borders, fill, alignment)
- [ ] Number format selector
- [ ] Column/row resize
- [ ] Insert/delete rows and columns
- [ ] Merge/unmerge cells
- [ ] Sorting and filtering
- [ ] Find and replace

### 3.4 Sheets File Support
- [ ] .xlsx import (cells, formulas, formatting, worksheets)
- [ ] .xlsx export (preserving formulas, shared strings, styles)
- [ ] .csv import/export
- [ ] Round-trip tests

### 3.5 Sheets Tests
- [ ] Formula parsing unit tests (operator precedence, references)
- [ ] Function evaluation tests (each function)
- [ ] Dependency graph tests
- [ ] Circular reference tests
- [ ] Error propagation tests
- [ ] .xlsx round-trip tests

## Phase 4 — Slides MVP

### 4.1 Presentation Model
- [ ] Slide container with ordering
- [ ] Text boxes with rich text
- [ ] Shapes (rectangle, ellipse, line, arrow)
- [ ] Images
- [ ] Object positioning (x, y, width, height)
- [ ] Object rotation
- [ ] Z-order (stacking)
- [ ] Fills (solid, gradient)
- [ ] Borders
- [ ] Slide backgrounds
- [ ] Slide dimensions

### 4.2 Slides UI
- [ ] Slide thumbnail sidebar
- [ ] Main slide canvas (interactive)
- [ ] Object selection and manipulation (drag, resize, rotate)
- [ ] Shape insertion toolbar
- [ ] Text editing within shapes
- [ ] Object alignment tools
- [ ] Slide add/delete/duplicate/reorder
- [ ] Formatting panel (fills, borders, text)
- [ ] Presenter preview mode
- [ ] Zoom controls

### 4.3 Slides File Support
- [ ] .pptx import (slides, shapes, text, images, layouts)
- [ ] .pptx export
- [ ] Theme and layout preservation
- [ ] Round-trip tests

### 4.4 Slides Tests
- [ ] Object positioning unit tests
- [ ] Slide ordering tests
- [ ] Coordinate conversion tests
- [ ] .pptx round-trip tests

## Phase 5+ — Advanced Features (Future)

- Charts (Sheets and Slides)
- Headers/footers (Writer)
- Comments and tracked changes
- Advanced conditional formatting
- Slide transitions and animations
- PDF export
- Print support
- Accessibility improvements
- Localization
- VLOOKUP and more functions
- Named ranges
- Pivot table exploration

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| OOXML complexity | High | Incremental support; preserve unknown elements |
| Page layout accuracy | Medium | Start simple; iterate on text measurement |
| Formula compatibility | Medium | Test against Excel behavior; document differences |
| Tauri 2 maturity | Low | Active project; fallback to webview-specific workarounds |
| WebView rendering differences | Low | Windows-first; test on Edge WebView2 |
| Performance with large documents | Medium | Virtual rendering; lazy loading; profiling |
