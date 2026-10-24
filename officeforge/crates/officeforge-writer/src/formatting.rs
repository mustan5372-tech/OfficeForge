use serde::{Deserialize, Serialize};

/// Horizontal text alignment.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Alignment {
    Left,
    Center,
    Right,
    Justify,
}

impl Default for Alignment {
    fn default() -> Self {
        Self::Left
    }
}

/// Vertical alignment within a cell.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerticalAlignment {
    Top,
    Center,
    Bottom,
}

impl Default for VerticalAlignment {
    fn default() -> Self {
        Self::Top
    }
}

/// Line spacing specification.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum LineSpacing {
    Single,
    OnePointFive,
    Double,
    /// Exact spacing in points.
    Exact(f64),
    /// Multiple of single spacing.
    Multiple(f64),
}

impl Default for LineSpacing {
    fn default() -> Self {
        Self::Single
    }
}

/// List type for paragraphs.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ListType {
    Bullet { level: u8 },
    Numbered { level: u8, start: u32 },
}

/// Paragraph-level formatting properties.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParagraphProperties {
    pub alignment: Alignment,
    pub line_spacing: LineSpacing,
    pub space_before_pt: f64,
    pub space_after_pt: f64,
    pub indent_left_pt: f64,
    pub indent_right_pt: f64,
    pub first_line_indent_pt: f64,
    pub list: Option<ListType>,
    pub keep_together: bool,
    pub keep_with_next: bool,
}

impl Default for ParagraphProperties {
    fn default() -> Self {
        Self {
            alignment: Alignment::Left,
            line_spacing: LineSpacing::Single,
            space_before_pt: 0.0,
            space_after_pt: 8.0,
            indent_left_pt: 0.0,
            indent_right_pt: 0.0,
            first_line_indent_pt: 0.0,
            list: None,
            keep_together: false,
            keep_with_next: false,
        }
    }
}
