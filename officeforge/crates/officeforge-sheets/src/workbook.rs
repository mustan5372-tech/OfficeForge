use std::collections::HashMap;

use officeforge_core::DocumentMetadata;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::cell::*;

/// A spreadsheet workbook containing multiple worksheets.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workbook {
    pub metadata: DocumentMetadata,
    pub sheets: Vec<Worksheet>,
    pub active_sheet: usize,
}

impl Workbook {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            metadata: DocumentMetadata::new(title),
            sheets: vec![Worksheet::new("Sheet1")],
            active_sheet: 0,
        }
    }

    pub fn add_sheet(&mut self, name: impl Into<String>) -> usize {
        let idx = self.sheets.len();
        self.sheets.push(Worksheet::new(name));
        idx
    }

    pub fn active_worksheet(&self) -> &Worksheet {
        &self.sheets[self.active_sheet]
    }

    pub fn active_worksheet_mut(&mut self) -> &mut Worksheet {
        &mut self.sheets[self.active_sheet]
    }

    /// Set a cell value and mark the document as dirty.
    pub fn set_cell(&mut self, sheet: usize, addr: CellAddress, value: CellValue) {
        if let Some(ws) = self.sheets.get_mut(sheet) {
            ws.set_cell(addr, value);
            self.metadata.mark_dirty();
        }
    }

    /// Get a cell value.
    pub fn get_cell(&self, sheet: usize, addr: CellAddress) -> Option<&Cell> {
        self.sheets.get(sheet).and_then(|ws| ws.get_cell(addr))
    }
}

/// A single worksheet (sparse cell storage).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Worksheet {
    pub id: Uuid,
    pub name: String,
    pub cells: HashMap<(u32, u32), Cell>,
    pub column_widths: HashMap<u32, f64>,
    pub row_heights: HashMap<u32, f64>,
    pub frozen_rows: u32,
    pub frozen_cols: u32,
    pub visible: bool,
    pub default_column_width: f64,
    pub default_row_height: f64,
}

impl Worksheet {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            name: name.into(),
            cells: HashMap::new(),
            column_widths: HashMap::new(),
            row_heights: HashMap::new(),
            frozen_rows: 0,
            frozen_cols: 0,
            visible: true,
            default_column_width: 64.0,
            default_row_height: 20.0,
        }
    }

    pub fn set_cell(&mut self, addr: CellAddress, value: CellValue) {
        let key = (addr.row, addr.col);
        match &value {
            CellValue::Empty => {
                self.cells.remove(&key);
            }
            _ => {
                let cell = self.cells.entry(key).or_default();
                cell.value = value;
            }
        }
    }

    pub fn get_cell(&self, addr: CellAddress) -> Option<&Cell> {
        self.cells.get(&(addr.row, addr.col))
    }

    pub fn get_cell_value(&self, addr: CellAddress) -> &CellValue {
        self.cells
            .get(&(addr.row, addr.col))
            .map(|c| &c.value)
            .unwrap_or(&CellValue::Empty)
    }

    /// Get the used range bounds (min_row, min_col, max_row, max_col).
    /// Returns None if the sheet is empty.
    pub fn used_range(&self) -> Option<(u32, u32, u32, u32)> {
        if self.cells.is_empty() {
            return None;
        }
        let mut min_row = u32::MAX;
        let mut min_col = u32::MAX;
        let mut max_row = 0u32;
        let mut max_col = 0u32;
        for &(row, col) in self.cells.keys() {
            min_row = min_row.min(row);
            min_col = min_col.min(col);
            max_row = max_row.max(row);
            max_col = max_col.max(col);
        }
        Some((min_row, min_col, max_row, max_col))
    }

    /// Number of non-empty cells.
    pub fn cell_count(&self) -> usize {
        self.cells.len()
    }

    pub fn column_width(&self, col: u32) -> f64 {
        self.column_widths.get(&col).copied().unwrap_or(self.default_column_width)
    }

    pub fn row_height(&self, row: u32) -> f64 {
        self.row_heights.get(&row).copied().unwrap_or(self.default_row_height)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_workbook() {
        let wb = Workbook::new("Test");
        assert_eq!(wb.sheets.len(), 1);
        assert_eq!(wb.sheets[0].name, "Sheet1");
    }

    #[test]
    fn test_sparse_storage() {
        let mut ws = Worksheet::new("Sheet1");
        assert_eq!(ws.cell_count(), 0);

        ws.set_cell(CellAddress::new(0, 0), CellValue::Number(42.0));
        assert_eq!(ws.cell_count(), 1);

        ws.set_cell(CellAddress::new(999999, 999), CellValue::Text("far away".into()));
        assert_eq!(ws.cell_count(), 2);

        // Setting empty removes the cell
        ws.set_cell(CellAddress::new(0, 0), CellValue::Empty);
        assert_eq!(ws.cell_count(), 1);
    }

    #[test]
    fn test_used_range() {
        let mut ws = Worksheet::new("Sheet1");
        assert!(ws.used_range().is_none());

        ws.set_cell(CellAddress::new(1, 2), CellValue::Number(1.0));
        ws.set_cell(CellAddress::new(5, 10), CellValue::Number(2.0));
        assert_eq!(ws.used_range(), Some((1, 2, 5, 10)));
    }

    #[test]
    fn test_add_sheet() {
        let mut wb = Workbook::new("Test");
        let idx = wb.add_sheet("Sheet2");
        assert_eq!(idx, 1);
        assert_eq!(wb.sheets.len(), 2);
    }
}
