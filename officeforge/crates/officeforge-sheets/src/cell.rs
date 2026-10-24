use officeforge_core::Color;
use serde::{Deserialize, Serialize};
use std::fmt;

/// Address of a cell in a worksheet (0-indexed internally).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CellAddress {
    pub row: u32,
    pub col: u32,
}

impl CellAddress {
    pub fn new(row: u32, col: u32) -> Self {
        Self { row, col }
    }

    /// Parse from A1-style reference like "A1", "Z26", "AA1".
    pub fn from_a1(reference: &str) -> Option<Self> {
        let reference = reference.trim();
        let col_end = reference.find(|c: char| c.is_ascii_digit())?;
        if col_end == 0 {
            return None;
        }
        let col_str = &reference[..col_end];
        let row_str = &reference[col_end..];

        let col = col_from_letters(col_str)?;
        let row: u32 = row_str.parse().ok()?;
        if row == 0 {
            return None;
        }
        Some(Self { row: row - 1, col })
    }

    /// Convert to A1-style reference.
    pub fn to_a1(&self) -> String {
        format!("{}{}", col_to_letters(self.col), self.row + 1)
    }
}

impl fmt::Display for CellAddress {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_a1())
    }
}

/// Convert column index (0-based) to letter(s): 0→A, 25→Z, 26→AA.
pub fn col_to_letters(col: u32) -> String {
    let mut result = String::new();
    let mut n = col;
    loop {
        result.insert(0, (b'A' + (n % 26) as u8) as char);
        if n < 26 {
            break;
        }
        n = n / 26 - 1;
    }
    result
}

/// Convert column letters to 0-based index: A→0, Z→25, AA→26.
pub fn col_from_letters(letters: &str) -> Option<u32> {
    let mut result: u32 = 0;
    for c in letters.chars() {
        if !c.is_ascii_alphabetic() {
            return None;
        }
        result = result * 26 + (c.to_ascii_uppercase() as u32 - 'A' as u32 + 1);
    }
    if result == 0 { None } else { Some(result - 1) }
}

/// The value stored in a spreadsheet cell.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum CellValue {
    Empty,
    Text(String),
    Number(f64),
    Boolean(bool),
    Error(CellError),
    Formula {
        expression: String,
        cached_value: Box<CellValue>,
    },
}

impl CellValue {
    /// Get the display string for this value.
    pub fn display_string(&self) -> String {
        match self {
            CellValue::Empty => String::new(),
            CellValue::Text(s) => s.clone(),
            CellValue::Number(n) => {
                if *n == (*n as i64) as f64 && n.abs() < 1e15 {
                    format!("{}", *n as i64)
                } else {
                    format!("{n}")
                }
            }
            CellValue::Boolean(b) => if *b { "TRUE" } else { "FALSE" }.to_string(),
            CellValue::Error(e) => e.to_string(),
            CellValue::Formula { cached_value, .. } => cached_value.display_string(),
        }
    }

    /// Try to interpret this value as a number.
    pub fn as_number(&self) -> Option<f64> {
        match self {
            CellValue::Number(n) => Some(*n),
            CellValue::Boolean(b) => Some(if *b { 1.0 } else { 0.0 }),
            CellValue::Text(s) => s.trim().parse().ok(),
            CellValue::Formula { cached_value, .. } => cached_value.as_number(),
            _ => None,
        }
    }
}

impl Default for CellValue {
    fn default() -> Self {
        Self::Empty
    }
}

/// Spreadsheet error values matching Excel conventions.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CellError {
    DivZero,
    Value,
    Ref,
    Name,
    Null,
    Na,
    Num,
}

impl fmt::Display for CellError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CellError::DivZero => write!(f, "#DIV/0!"),
            CellError::Value => write!(f, "#VALUE!"),
            CellError::Ref => write!(f, "#REF!"),
            CellError::Name => write!(f, "#NAME?"),
            CellError::Null => write!(f, "#NULL!"),
            CellError::Na => write!(f, "#N/A"),
            CellError::Num => write!(f, "#NUM!"),
        }
    }
}

/// A cell with its value and formatting.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cell {
    pub value: CellValue,
    pub style: CellStyle,
}

impl Cell {
    pub fn new(value: CellValue) -> Self {
        Self {
            value,
            style: CellStyle::default(),
        }
    }
}

impl Default for Cell {
    fn default() -> Self {
        Self::new(CellValue::Empty)
    }
}

/// Cell formatting.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CellStyle {
    pub font_family: String,
    pub font_size: f64,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    pub text_color: Color,
    pub background_color: Option<Color>,
    pub horizontal_alignment: HorizontalAlignment,
    pub vertical_alignment: CellVerticalAlignment,
    pub number_format: Option<String>,
    pub word_wrap: bool,
}

impl Default for CellStyle {
    fn default() -> Self {
        Self {
            font_family: "Calibri".to_string(),
            font_size: 11.0,
            bold: false,
            italic: false,
            underline: false,
            text_color: Color::BLACK,
            background_color: None,
            horizontal_alignment: HorizontalAlignment::General,
            vertical_alignment: CellVerticalAlignment::Bottom,
            number_format: None,
            word_wrap: false,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HorizontalAlignment {
    General,
    Left,
    Center,
    Right,
}

impl Default for HorizontalAlignment {
    fn default() -> Self {
        Self::General
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CellVerticalAlignment {
    Top,
    Center,
    Bottom,
}

impl Default for CellVerticalAlignment {
    fn default() -> Self {
        Self::Bottom
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_a1_parse() {
        assert_eq!(CellAddress::from_a1("A1"), Some(CellAddress::new(0, 0)));
        assert_eq!(CellAddress::from_a1("B2"), Some(CellAddress::new(1, 1)));
        assert_eq!(CellAddress::from_a1("Z1"), Some(CellAddress::new(0, 25)));
        assert_eq!(CellAddress::from_a1("AA1"), Some(CellAddress::new(0, 26)));
        assert_eq!(CellAddress::from_a1("AZ1"), Some(CellAddress::new(0, 51)));
    }

    #[test]
    fn test_a1_round_trip() {
        for col in 0..100 {
            for row in 0..10 {
                let addr = CellAddress::new(row, col);
                let a1 = addr.to_a1();
                assert_eq!(CellAddress::from_a1(&a1), Some(addr), "Failed for {a1}");
            }
        }
    }

    #[test]
    fn test_col_letters() {
        assert_eq!(col_to_letters(0), "A");
        assert_eq!(col_to_letters(25), "Z");
        assert_eq!(col_to_letters(26), "AA");
        assert_eq!(col_to_letters(701), "ZZ");
    }

    #[test]
    fn test_cell_value_display() {
        assert_eq!(CellValue::Number(42.0).display_string(), "42");
        assert_eq!(CellValue::Number(3.14).display_string(), "3.14");
        assert_eq!(CellValue::Boolean(true).display_string(), "TRUE");
        assert_eq!(CellValue::Text("hello".into()).display_string(), "hello");
        assert_eq!(CellValue::Error(CellError::DivZero).display_string(), "#DIV/0!");
    }
}
