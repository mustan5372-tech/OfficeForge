use serde::{Deserialize, Serialize};

/// Font specification used for text rendering.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FontSpec {
    pub family: String,
    pub size_pt: f64,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub strikethrough: bool,
}

impl FontSpec {
    pub fn new(family: impl Into<String>, size_pt: f64) -> Self {
        Self {
            family: family.into(),
            size_pt,
            bold: false,
            italic: false,
            underline: false,
            strikethrough: false,
        }
    }
}

impl Default for FontSpec {
    fn default() -> Self {
        Self::new("Calibri", 11.0)
    }
}
