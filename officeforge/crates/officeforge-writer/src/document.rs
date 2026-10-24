use officeforge_core::{Color, DocumentMetadata, FontSpec, Measurement};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::formatting::*;

/// A Writer document: the top-level container for word processing content.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriterDocument {
    pub metadata: DocumentMetadata,
    pub body: DocumentBody,
    pub page_settings: PageSettings,
}

impl WriterDocument {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            metadata: DocumentMetadata::new(title),
            body: DocumentBody::default(),
            page_settings: PageSettings::default(),
        }
    }

    /// Total number of paragraphs.
    pub fn paragraph_count(&self) -> usize {
        self.body.elements.iter().filter(|e| matches!(e, BlockElement::Paragraph(_))).count()
    }

    /// Approximate word count across all paragraphs.
    pub fn word_count(&self) -> usize {
        self.body.elements.iter().map(|e| match e {
            BlockElement::Paragraph(p) => {
                p.runs.iter().map(|r| {
                    r.text.split_whitespace().count()
                }).sum::<usize>()
            }
            BlockElement::Table(t) => {
                t.rows.iter().flat_map(|row| &row.cells).flat_map(|cell| &cell.paragraphs).map(|p| {
                    p.runs.iter().map(|r| r.text.split_whitespace().count()).sum::<usize>()
                }).sum()
            }
            _ => 0,
        }).sum()
    }

    /// Get plain text content of the document.
    pub fn to_plain_text(&self) -> String {
        let mut text = String::new();
        for element in &self.body.elements {
            match element {
                BlockElement::Paragraph(p) => {
                    for run in &p.runs {
                        text.push_str(&run.text);
                    }
                    text.push('\n');
                }
                BlockElement::Table(t) => {
                    for row in &t.rows {
                        for (i, cell) in row.cells.iter().enumerate() {
                            if i > 0 { text.push('\t'); }
                            for p in &cell.paragraphs {
                                for run in &p.runs {
                                    text.push_str(&run.text);
                                }
                            }
                        }
                        text.push('\n');
                    }
                }
                BlockElement::PageBreak => {
                    text.push('\n');
                }
            }
        }
        text
    }
}

/// The body content of a document.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DocumentBody {
    pub elements: Vec<BlockElement>,
}

/// Top-level block elements in a document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BlockElement {
    Paragraph(Paragraph),
    Table(Table),
    PageBreak,
}

/// A paragraph with formatting and inline runs.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Paragraph {
    pub id: Uuid,
    pub runs: Vec<TextRun>,
    pub properties: ParagraphProperties,
}

impl Paragraph {
    pub fn new() -> Self {
        Self {
            id: Uuid::new_v4(),
            runs: Vec::new(),
            properties: ParagraphProperties::default(),
        }
    }

    pub fn with_text(text: impl Into<String>) -> Self {
        let mut p = Self::new();
        p.runs.push(TextRun::new(text));
        p
    }

    pub fn plain_text(&self) -> String {
        self.runs.iter().map(|r| r.text.as_str()).collect()
    }
}

impl Default for Paragraph {
    fn default() -> Self {
        Self::new()
    }
}

/// A run of text with uniform formatting.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextRun {
    pub text: String,
    pub properties: RunProperties,
}

impl TextRun {
    pub fn new(text: impl Into<String>) -> Self {
        Self {
            text: text.into(),
            properties: RunProperties::default(),
        }
    }

    pub fn with_properties(text: impl Into<String>, properties: RunProperties) -> Self {
        Self {
            text: text.into(),
            properties,
        }
    }
}

/// Properties for a text run (character formatting).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RunProperties {
    pub font: FontSpec,
    pub color: Color,
    pub highlight: Option<Color>,
    pub superscript: bool,
    pub subscript: bool,
}

impl Default for RunProperties {
    fn default() -> Self {
        Self {
            font: FontSpec::default(),
            color: Color::BLACK,
            highlight: None,
            superscript: false,
            subscript: false,
        }
    }
}

/// A table in the document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Table {
    pub id: Uuid,
    pub rows: Vec<TableRow>,
    pub properties: TableProperties,
}

impl Table {
    pub fn new(rows: usize, cols: usize) -> Self {
        Self {
            id: Uuid::new_v4(),
            rows: (0..rows).map(|_| TableRow::new(cols)).collect(),
            properties: TableProperties::default(),
        }
    }
}

/// A row in a table.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableRow {
    pub cells: Vec<TableCell>,
    pub height: Option<Measurement>,
}

impl TableRow {
    pub fn new(cols: usize) -> Self {
        Self {
            cells: (0..cols).map(|_| TableCell::default()).collect(),
            height: None,
        }
    }
}

/// A cell in a table row.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableCell {
    pub paragraphs: Vec<Paragraph>,
    pub properties: TableCellProperties,
}

impl Default for TableCell {
    fn default() -> Self {
        Self {
            paragraphs: vec![Paragraph::new()],
            properties: TableCellProperties::default(),
        }
    }
}

/// Table properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableProperties {
    pub width: Option<Measurement>,
    pub alignment: Alignment,
}

impl Default for TableProperties {
    fn default() -> Self {
        Self {
            width: None,
            alignment: Alignment::Left,
        }
    }
}

/// Table cell properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableCellProperties {
    pub width: Option<Measurement>,
    pub vertical_alignment: VerticalAlignment,
    pub background: Option<Color>,
}

impl Default for TableCellProperties {
    fn default() -> Self {
        Self {
            width: None,
            vertical_alignment: VerticalAlignment::Top,
            background: None,
        }
    }
}

/// Page settings for the document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageSettings {
    pub width: Measurement,
    pub height: Measurement,
    pub margins: PageMargins,
    pub orientation: PageOrientation,
}

impl Default for PageSettings {
    fn default() -> Self {
        Self {
            width: Measurement::from_inches(8.5),   // US Letter
            height: Measurement::from_inches(11.0),
            margins: PageMargins::default(),
            orientation: PageOrientation::Portrait,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageMargins {
    pub top: Measurement,
    pub bottom: Measurement,
    pub left: Measurement,
    pub right: Measurement,
}

impl Default for PageMargins {
    fn default() -> Self {
        Self {
            top: Measurement::from_inches(1.0),
            bottom: Measurement::from_inches(1.0),
            left: Measurement::from_inches(1.0),
            right: Measurement::from_inches(1.0),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PageOrientation {
    Portrait,
    Landscape,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_document() {
        let doc = WriterDocument::new("Test");
        assert_eq!(doc.metadata.title, "Test");
        assert_eq!(doc.paragraph_count(), 0);
    }

    #[test]
    fn test_word_count() {
        let mut doc = WriterDocument::new("Test");
        doc.body.elements.push(BlockElement::Paragraph(
            Paragraph::with_text("Hello world, this is a test")
        ));
        assert_eq!(doc.word_count(), 6);
    }

    #[test]
    fn test_plain_text() {
        let mut doc = WriterDocument::new("Test");
        doc.body.elements.push(BlockElement::Paragraph(Paragraph::with_text("Line 1")));
        doc.body.elements.push(BlockElement::Paragraph(Paragraph::with_text("Line 2")));
        assert_eq!(doc.to_plain_text(), "Line 1\nLine 2\n");
    }

    #[test]
    fn test_table_creation() {
        let table = Table::new(3, 4);
        assert_eq!(table.rows.len(), 3);
        assert_eq!(table.rows[0].cells.len(), 4);
    }
}
