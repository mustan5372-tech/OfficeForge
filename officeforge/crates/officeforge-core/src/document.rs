use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Unique identifier for an open document within the application.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DocumentId(pub Uuid);

impl DocumentId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl Default for DocumentId {
    fn default() -> Self {
        Self::new()
    }
}

impl std::fmt::Display for DocumentId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Common metadata shared by all document types.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    /// Unique identifier for this document instance.
    pub id: DocumentId,
    /// Document title (may differ from filename).
    pub title: String,
    /// Original file path if opened from disk.
    pub file_path: Option<String>,
    /// When the document was created.
    pub created_at: DateTime<Utc>,
    /// When the document was last modified in memory.
    pub modified_at: DateTime<Utc>,
    /// When the document was last saved to disk.
    pub saved_at: Option<DateTime<Utc>>,
    /// Whether the document has unsaved changes.
    pub is_dirty: bool,
    /// Document author.
    pub author: Option<String>,
    /// Document description.
    pub description: Option<String>,
}

impl DocumentMetadata {
    pub fn new(title: impl Into<String>) -> Self {
        let now = Utc::now();
        Self {
            id: DocumentId::new(),
            title: title.into(),
            file_path: None,
            created_at: now,
            modified_at: now,
            saved_at: None,
            is_dirty: false,
            author: None,
            description: None,
        }
    }

    pub fn mark_dirty(&mut self) {
        self.is_dirty = true;
        self.modified_at = Utc::now();
    }

    pub fn mark_saved(&mut self, path: String) {
        self.is_dirty = false;
        self.saved_at = Some(Utc::now());
        self.file_path = Some(path);
    }
}

/// The type of document for routing to the correct editor.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DocumentType {
    Writer,
    Sheets,
    Slides,
}

impl DocumentType {
    /// Detect document type from file extension.
    pub fn from_extension(ext: &str) -> Option<Self> {
        match ext.to_lowercase().as_str() {
            "docx" | "doc" | "txt" | "rtf" => Some(Self::Writer),
            "xlsx" | "xls" | "csv" => Some(Self::Sheets),
            "pptx" | "ppt" => Some(Self::Slides),
            _ => None,
        }
    }

    pub fn default_extension(&self) -> &'static str {
        match self {
            Self::Writer => "docx",
            Self::Sheets => "xlsx",
            Self::Slides => "pptx",
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Writer => "Document",
            Self::Sheets => "Spreadsheet",
            Self::Slides => "Presentation",
        }
    }
}
