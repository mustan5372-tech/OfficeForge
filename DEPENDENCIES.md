# OfficeForge Dependencies

## Rust Dependencies

| Crate | Version | Purpose | License |
|-------|---------|---------|---------|
| `tauri` | 2.x | Desktop framework, window management, IPC | MIT/Apache-2.0 |
| `tauri-build` | 2.x | Build-time Tauri configuration | MIT/Apache-2.0 |
| `serde` | 1.x | Serialization/deserialization | MIT/Apache-2.0 |
| `serde_json` | 1.x | JSON serialization for IPC | MIT/Apache-2.0 |
| `zip` | 2.x | ZIP archive read/write (OOXML packages) | MIT |
| `quick-xml` | 0.37+ | Fast XML parsing and writing | MIT |
| `uuid` | 1.x | Stable document/object identifiers | MIT/Apache-2.0 |
| `chrono` | 0.4.x | Date and time handling | MIT/Apache-2.0 |
| `thiserror` | 2.x | Ergonomic error type definitions | MIT/Apache-2.0 |
| `anyhow` | 1.x | Error context in application code | MIT/Apache-2.0 |
| `tracing` | 0.1.x | Structured logging | MIT |
| `tracing-subscriber` | 0.3.x | Log output formatting | MIT |
| `image` | 0.25+ | Image decoding (PNG, JPEG, etc.) | MIT/Apache-2.0 |
| `regex` | 1.x | Pattern matching for search/replace | MIT/Apache-2.0 |
| `indexmap` | 2.x | Insertion-ordered maps | MIT/Apache-2.0 |

## Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `typescript` | Type safety |
| `vite` | Build tool and dev server |
| `@tauri-apps/api` | Tauri IPC and window APIs |
| `@tauri-apps/plugin-dialog` | Native file dialogs |
| `@tauri-apps/plugin-fs` | File system access |
| `tailwindcss` | Utility-first CSS framework |
| `lucide-react` | Icon library |
| `@radix-ui/react-*` | Accessible UI primitives |

## Dependency Selection Criteria

1. **Maintenance**: Must have activity within the last 6 months
2. **License**: MIT or Apache-2.0 strongly preferred; no GPL for core dependencies
3. **Platform**: Must support Windows; ideally also macOS and Linux
4. **Correctness**: Prefer crates with good test coverage and fuzzing
5. **Size**: Prefer smaller dependency trees; avoid pulling in the kitchen sink

## Crates Evaluated and Rejected

| Crate | Reason for Rejection |
|-------|---------------------|
| `calamine` | Read-only .xlsx; no write support |
| `docx-rs` | Incomplete OOXML coverage; would need heavy forking |
| `xlsxwriter` | Write-only; no import capability |
| `lopdf` | PDF is a later milestone; defer dependency |

## Notes

- No single Rust crate provides full read/write OOXML support for all three formats. We build custom adapters using `zip` + `quick-xml` + `serde`.
- The `zip` crate must be configured with path traversal protection and decompression limits.
- `quick-xml` is preferred over `xml-rs` for performance with large OOXML files.
