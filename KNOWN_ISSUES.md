# OfficeForge Known Issues and Mitigations

**Last Updated**: 2026-10-24  
**Applies To**: OfficeForge v0.1.0 (Desktop Suite)  

This document logs identified technical challenges, platform nuances, edge cases, and their architectural mitigations.

---

## 1. Toolchain & Platform Issues

### ISSUE-001: Missing MSVC `link.exe` on Base Windows Environment
- **Symptom**: When using default `x86_64-pc-windows-msvc`, cargo check fails with `linker link.exe not found`.
- **Cause**: Visual Studio Build Tools 2022 was installed on the host machine without the C++ desktop workload (`Microsoft.VisualStudio.Workload.VCTools`), and the current process lacks administrative elevation to run system-wide MSI modifications.
- **Mitigation**: Configured Rust to use the MinGW / GNU toolchain (`stable-x86_64-pc-windows-gnu`) paired with user-scoped portable LLVM-MinGW (`MartinStorsjo.LLVM-MinGW.UCRT`), which provides `dlltool.exe`, `gcc.exe`, `lld.exe`, and binutils without requiring administrative UAC elevation.

---

## 2. Document & Layout Issues

### ISSUE-002: Browser Text Measurement vs. Word Pagination Fidelity
- **Symptom**: Standard HTML text rendering does not calculate exact page boundaries or break points identically to Microsoft Word's pagination engine.
- **Cause**: Word uses typographic metrics, specific line spacing algorithms (e.g. multiple vs. exact points), widow/orphan control, and kerning pairs that differ from default browser layout.
- **Mitigation**: Separated the logical document model (`Paragraph`, `TextRun`, `Measurement`) from visual rendering. Writer formats content in discrete physical page containers with standard margin units (`In`, `Pt`, `Mm`) and computes word/page counts from the logical document tree.

### ISSUE-003: Spreadsheet Large Grid Memory Usage
- **Symptom**: Allocating an $N \times M$ matrix for a standard spreadsheet (1,048,576 rows $\times$ 16,384 columns) causes out-of-memory errors.
- **Cause**: Dense 2D arrays scale with addressable bounds rather than populated cells.
- **Mitigation**: `officeforge-sheets` uses a sparse storage representation (`HashMap<CellAddress, Cell>`). Only non-empty cells consume memory, aligning with the OpenXML spreadsheet storage model.

---

## 3. Calculation & Formula Issues

### ISSUE-004: Circular References in Sheet Formulas
- **Symptom**: Evaluating a cell that depends on itself (e.g., `A1 = A1 + 1` or `A1 -> B1 -> A1`) causes infinite recursion or stack overflow.
- **Cause**: Unchecked recursive evaluation of formula ASTs.
- **Mitigation**: Implemented cycle detection using a visited-address set in the formula evaluator. When a dependency cycle is detected, evaluation halts immediately and assigns the standard Excel `#REF!` or circular error state to the affected cells.

---

## 4. OOXML Security & Interoperability Issues

### ISSUE-005: Zip Bomb and Directory Traversal Attacks in `.docx` / `.xlsx` / `.pptx`
- **Symptom**: Maliciously crafted OOXML packages could attempt path traversal (`../../evil.bat`) or exhaust disk/RAM via nested compression bombs.
- **Cause**: OOXML containers are standard ZIP archives with arbitrary file paths and high compression ratios.
- **Mitigation**: `officeforge-ooxml` enforces strict security constraints:
  - Caps maximum uncompressed package size to 256MB.
  - Caps maximum entry count to 1,000 files.
  - Rejects any zip entry containing `..` path segments, absolute drive paths, or suspicious control characters.
  - Quarantines and ignores VBA macros / embedded executable scripts (`vbaProject.bin`).

---

## 5. UI Integration Issues

### ISSUE-006: Unified Suite vs. Independent Applications
- **Symptom**: Productivity suites often get fragmented into distinct disconnected executables that require multiple launchers and separate state.
- **Cause**: Independent development of word processors, spreadsheets, and presentation software.
- **Mitigation**: Built OfficeForge as **one unified desktop application**:
  - Unified Tauri 2 shell hosting all three workspaces.
  - Central Home screen with unified recent documents, templates, and new document launchers.
  - Instant workspace switcher in the header for smooth transitions between Writer, Sheets, and Slides.
  - Shared undo/redo, file dialogs, and persistence services.
