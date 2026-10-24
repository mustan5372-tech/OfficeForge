use serde::{Deserialize, Serialize};

/// Unit-aware measurement type for document layout.
/// Internally stores values in English Metric Units (EMUs) for OOXML compatibility.
/// 1 inch = 914400 EMUs, 1 cm = 360000 EMUs, 1 pt = 12700 EMUs.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Measurement {
    /// Value in EMUs (English Metric Units).
    pub emu: i64,
}

impl Measurement {
    pub const ZERO: Measurement = Measurement { emu: 0 };

    pub const EMUS_PER_INCH: i64 = 914_400;
    pub const EMUS_PER_CM: i64 = 360_000;
    pub const EMUS_PER_PT: i64 = 12_700;
    pub const EMUS_PER_HALF_PT: i64 = 6_350;
    pub const EMUS_PER_TWIP: i64 = 635;

    pub const fn from_emu(emu: i64) -> Self {
        Self { emu }
    }

    pub fn from_inches(inches: f64) -> Self {
        Self { emu: (inches * Self::EMUS_PER_INCH as f64) as i64 }
    }

    pub fn from_cm(cm: f64) -> Self {
        Self { emu: (cm * Self::EMUS_PER_CM as f64) as i64 }
    }

    pub fn from_pt(pt: f64) -> Self {
        Self { emu: (pt * Self::EMUS_PER_PT as f64) as i64 }
    }

    pub fn from_twips(twips: i64) -> Self {
        Self { emu: twips * Self::EMUS_PER_TWIP }
    }

    pub fn to_inches(self) -> f64 {
        self.emu as f64 / Self::EMUS_PER_INCH as f64
    }

    pub fn to_cm(self) -> f64 {
        self.emu as f64 / Self::EMUS_PER_CM as f64
    }

    pub fn to_pt(self) -> f64 {
        self.emu as f64 / Self::EMUS_PER_PT as f64
    }

    pub fn to_twips(self) -> i64 {
        self.emu / Self::EMUS_PER_TWIP
    }

    pub fn to_px(self, dpi: f64) -> f64 {
        self.to_inches() * dpi
    }
}

impl Default for Measurement {
    fn default() -> Self {
        Self::ZERO
    }
}

impl std::ops::Add for Measurement {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Self { emu: self.emu + rhs.emu }
    }
}

impl std::ops::Sub for Measurement {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self {
        Self { emu: self.emu - rhs.emu }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_inch_round_trip() {
        let m = Measurement::from_inches(1.0);
        assert!((m.to_inches() - 1.0).abs() < 1e-10);
        assert_eq!(m.emu, 914_400);
    }

    #[test]
    fn test_pt_conversion() {
        let m = Measurement::from_pt(72.0);
        assert!((m.to_inches() - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_twips() {
        let m = Measurement::from_twips(1440);
        assert!((m.to_inches() - 1.0).abs() < 0.001);
    }
}
