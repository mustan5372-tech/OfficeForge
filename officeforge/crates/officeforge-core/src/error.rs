use thiserror::Error;

/// Central error type for OfficeForge operations.
#[derive(Error, Debug)]
pub enum OfficeForgeError {
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Invalid file format: {0}")]
    InvalidFormat(String),

    #[error("Unsupported feature: {0}")]
    UnsupportedFeature(String),

    #[error("Document not found: {0}")]
    DocumentNotFound(String),

    #[error("Invalid operation: {0}")]
    InvalidOperation(String),

    #[error("ZIP error: {0}")]
    Zip(String),

    #[error("XML error: {0}")]
    Xml(String),

    #[error("Formula error: {0}")]
    Formula(String),

    #[error("Storage error: {0}")]
    Storage(String),

    #[error("{0}")]
    Other(String),
}

/// Standard Result type for OfficeForge operations.
pub type Result<T> = std::result::Result<T, OfficeForgeError>;

impl serde::Serialize for OfficeForgeError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
