# OfficeForge Compatibility

## Supported File Formats

| Format | Import | Export | Status |
|--------|--------|--------|--------|
| `.docx` (Word) | ✅ Phase 2 | ✅ Phase 2 | Planned |
| `.xlsx` (Excel) | ✅ Phase 3 | ✅ Phase 3 | Planned |
| `.pptx` (PowerPoint) | ✅ Phase 4 | ✅ Phase 4 | Planned |
| `.txt` (Plain Text) | ✅ Phase 2 | ✅ Phase 2 | Planned |
| `.csv` (CSV) | ✅ Phase 3 | ✅ Phase 3 | Planned |
| `.rtf` (Rich Text) | ⏳ Future | ⏳ Future | Not started |
| `.pdf` (Export only) | ❌ | ⏳ Phase 5 | Not started |

## Writer Feature Compatibility (Phase 2 Target)

| Feature | Supported | Notes |
|---------|-----------|-------|
| Paragraphs | ✅ | Basic paragraph properties |
| Text runs with formatting | ✅ | Bold, italic, underline, strikethrough |
| Font family and size | ✅ | |
| Font color | ✅ | |
| Alignment | ✅ | Left, center, right, justify |
| Line spacing | ✅ | |
| Bulleted lists | ✅ | Basic bullets |
| Numbered lists | ✅ | Basic numbering |
| Tables | ✅ | Basic tables, no nested tables |
| Images | ✅ | Inline images |
| Hyperlinks | ✅ | |
| Page setup | ✅ | Margins, orientation, paper size |
| Headers/Footers | ⏳ Phase 5 | |
| Footnotes/Endnotes | ⏳ Phase 5 | |
| Comments | ⏳ Phase 5 | |
| Track Changes | ⏳ Phase 5 | |
| Macros | ❌ | Will not execute |
| SmartArt | ❌ | Preserved as opaque data |

## Sheets Feature Compatibility (Phase 3 Target)

| Feature | Supported | Notes |
|---------|-----------|-------|
| Cell values | ✅ | String, number, boolean, error |
| Formulas | ✅ | See formula function list |
| Cell formatting | ✅ | Font, color, borders, fill |
| Number formats | ✅ | Basic formats |
| Multiple worksheets | ✅ | |
| Merged cells | ✅ | |
| Column widths / Row heights | ✅ | |
| Frozen panes | ✅ | |
| Named ranges | ⏳ Phase 5 | |
| Charts | ⏳ Phase 5 | |
| Conditional formatting | ⏳ Phase 5 | |
| Pivot tables | ❌ | Future milestone |
| Macros | ❌ | Will not execute |

## Slides Feature Compatibility (Phase 4 Target)

| Feature | Supported | Notes |
|---------|-----------|-------|
| Text boxes | ✅ | |
| Basic shapes | ✅ | Rectangles, ellipses, lines |
| Images | ✅ | |
| Slide ordering | ✅ | |
| Slide duplication | ✅ | |
| Object positioning | ✅ | |
| Fills and borders | ✅ | Solid fills |
| Slide backgrounds | ✅ | |
| Themes | ⏳ Phase 5 | |
| Slide layouts | ⏳ Phase 5 | |
| Animations | ❌ | Future |
| Transitions | ⏳ Phase 5 | Basic |
| Speaker notes | ⏳ Phase 5 | |
| Embedded video | ❌ | Future |

## Known Limitations

1. **No macro execution**: VBA macros are never executed. Macro-enabled formats (.docm, .xlsm, .pptm) are not supported in initial versions.
2. **Complex layouts**: Advanced Writer layouts (floating objects, text wrapping around shapes, multi-column sections) are not supported initially.
3. **Advanced typography**: Complex scripts (Arabic, CJK vertical text) may not render correctly initially.
4. **Embedded OLE objects**: Not supported; preserved as opaque data.
5. **DDE links**: Not supported for security reasons.
6. **External data connections**: Not supported.
