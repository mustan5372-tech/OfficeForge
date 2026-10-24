use serde::{Deserialize, Serialize};

/// RGBA color representation used throughout OfficeForge.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Color {
    pub const BLACK: Color = Color { r: 0, g: 0, b: 0, a: 255 };
    pub const WHITE: Color = Color { r: 255, g: 255, b: 255, a: 255 };
    pub const TRANSPARENT: Color = Color { r: 0, g: 0, b: 0, a: 0 };

    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b, a: 255 }
    }

    pub const fn with_alpha(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self { r, g, b, a }
    }

    /// Parse from hex string like "#FF0000" or "#FF000080".
    pub fn from_hex(hex: &str) -> Option<Self> {
        let hex = hex.strip_prefix('#').unwrap_or(hex);
        match hex.len() {
            6 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
                Some(Self::new(r, g, b))
            }
            8 => {
                let r = u8::from_str_radix(&hex[0..2], 16).ok()?;
                let g = u8::from_str_radix(&hex[2..4], 16).ok()?;
                let b = u8::from_str_radix(&hex[4..6], 16).ok()?;
                let a = u8::from_str_radix(&hex[6..8], 16).ok()?;
                Some(Self::with_alpha(r, g, b, a))
            }
            _ => None,
        }
    }

    /// Convert to hex string like "#FF0000".
    pub fn to_hex(&self) -> String {
        if self.a == 255 {
            format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b)
        } else {
            format!("#{:02X}{:02X}{:02X}{:02X}", self.r, self.g, self.b, self.a)
        }
    }
}

impl Default for Color {
    fn default() -> Self {
        Self::BLACK
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_round_trip() {
        let color = Color::new(255, 128, 0);
        assert_eq!(Color::from_hex(&color.to_hex()), Some(color));
    }

    #[test]
    fn test_hex_with_alpha() {
        let color = Color::with_alpha(255, 0, 0, 128);
        assert_eq!(color.to_hex(), "#FF000080");
        assert_eq!(Color::from_hex("#FF000080"), Some(color));
    }

    #[test]
    fn test_hex_with_hash() {
        assert_eq!(Color::from_hex("#000000"), Some(Color::BLACK));
        assert_eq!(Color::from_hex("000000"), Some(Color::BLACK));
    }
}
