# OfficeForge — High-Performance Rust Productivity Suite

<p align="center">
  <img src="./OfficeForge Logo.png" alt="OfficeForge Logo" width="160" />
</p>

<p align="center">
  <b>One Unified Desktop Suite with Integrated Word Processing, Spreadsheets, and Presentations</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Windows%20x64-blue.svg" alt="Platform: Windows x64" />
  <img src="https://img.shields.io/badge/Backend-Rust%202024-orange.svg" alt="Backend: Rust" />
  <img src="https://img.shields.io/badge/Framework-Tauri%20v2-24C8D8.svg" alt="Framework: Tauri v2" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2F%20Vite%20%2F%20Tailwind%20v4-61DAFB.svg" alt="Frontend: React 19" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License: MIT" />
</p>

---

## Overview

**OfficeForge** is an independent, native desktop productivity suite built from the ground up in Rust and Tauri. It offers a local-first, privacy-respecting alternative to cloud-tethered office suites, providing one unified application shell with three integrated workspaces:

1. **OfficeForge Writer** — Full-featured word processor with paragraph formatting, character styling, physical paper canvas (Letter/A4), table editing, and word count statistics.
2. **OfficeForge Sheets** — High-performance spreadsheet application with an AST formula parser and calculation engine (`=SUM`, `=AVERAGE`, `=COUNT`, cell references), virtualized calculation grid, and multi-sheet workbooks.
3. **OfficeForge Slides** — Dynamic presentation editor with 16:9 widescreen canvas, slide thumbnails, interactive vector shapes, text frames, and fullscreen presentation preview mode.

All three workspaces share navigation, themes, recent file persistence, and error handling while retaining their own specialized document models.

---

## Architecture

The project is structured as a modular Cargo workspace and modern React presentation layer:

```text
OfficeForge/
├── docs/                     # Architectural, format, and status documentation
│   ├── ARCHITECTURE.md
│   ├── COMPATIBILITY.md
│   ├── DECISIONS.md
│   ├── DEPENDENCIES.md
│   ├── FEATURE_MATRIX.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── KNOWN_ISSUES.md
│   └── PROJECT_STATUS.md
├── officeforge/              # Core application codebase
│   ├── crates/               # Modular Rust backend crates
│   │   ├── officeforge-core     # Units, Color, generic UndoStack<T>, errors
│   │   ├── officeforge-writer   # Rich-text document model & operations
│   │   ├── officeforge-sheets   # Sparse grid model & AST formula engine
│   │   ├── officeforge-slides   # Presentation model, EMU coordinates & shapes
│   │   ├── officeforge-ooxml    # OOXML ZIP package & relationship parser
│   │   └── officeforge-storage  # Recent file history & atomic persistence
│   ├── src/                  # React 19 / TypeScript presentation layer
│   │   ├── components/
│   │   │   ├── Home/            # OfficeForge Central Home Screen
│   │   │   ├── Shell/           # App Header, Workspace Switcher, Status Bar
│   │   │   ├── Writer/          # Word processor ribbon & canvas
│   │   │   ├── Sheets/          # Formula bar, virtualized grid, sheet tabs
│   │   │   ├── Slides/          # Slide previews, 16:9 canvas, shape tools
│   │   │   └── Settings/        # Suite preferences & privacy pledge
│   │   ├── App.tsx              # Unified root application component
│   │   └── index.css            # Tailwind CSS v4 design tokens
│   ├── src-tauri/            # Tauri 2 native desktop container
│   │   ├── src/                 # Rust main entry point & IPC handlers
│   │   ├── icons/               # Multi-resolution Windows ICO & PNG assets
│   │   └── tauri.conf.json      # Window, security, and packaging configuration
│   └── package.json
└── OfficeForge Logo.png      # Official application branding
```

---

## Building from Source

### Prerequisites
- **Node.js** (v20+ recommended)
- **Rust Toolchain** (`stable-x86_64-pc-windows-gnu` or `stable-x86_64-pc-windows-msvc`)
- **Tauri CLI v2**

### Steps
1. Navigate to the application directory:
   ```bash
   cd officeforge
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run unit tests across all Rust crates:
   ```bash
   cargo test --workspace
   ```
4. Build frontend bundle:
   ```bash
   npm run build
   ```
5. Build the Windows release executable and NSIS installer:
   ```bash
   npx tauri build -b nsis
   ```

---

## Windows Installation & Running

- **Installer**: Run `OfficeForge_0.1.0_x64-setup.exe` to install OfficeForge to your system with Start Menu and Desktop shortcuts.
- **Portable**: Place `OfficeForge.exe` and `WebView2Loader.dll` in any folder and run `OfficeForge.exe` directly.

---

## License

Licensed under the [MIT License](./LICENSE).
