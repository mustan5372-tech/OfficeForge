use serde::{Deserialize, Serialize};

use crate::document::*;
use crate::formatting::*;

/// Operations that can be applied to a WriterDocument.
/// Each operation is reversible for undo/redo support.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WriterOperation {
    InsertText {
        paragraph_index: usize,
        run_index: usize,
        offset: usize,
        text: String,
    },
    DeleteText {
        paragraph_index: usize,
        run_index: usize,
        offset: usize,
        length: usize,
        deleted_text: String,
    },
    InsertParagraph {
        index: usize,
        paragraph: Paragraph,
    },
    DeleteParagraph {
        index: usize,
        paragraph: Paragraph,
    },
    SetRunFormatting {
        paragraph_index: usize,
        run_index: usize,
        old_properties: RunProperties,
        new_properties: RunProperties,
    },
    SetParagraphAlignment {
        paragraph_index: usize,
        old_alignment: Alignment,
        new_alignment: Alignment,
    },
    SetParagraphList {
        paragraph_index: usize,
        old_list: Option<ListType>,
        new_list: Option<ListType>,
    },
    InsertTable {
        index: usize,
        table: Table,
    },
    DeleteTable {
        index: usize,
        table: Table,
    },
}

impl WriterOperation {
    /// Create the inverse operation for undo.
    pub fn inverse(&self) -> Self {
        match self {
            WriterOperation::InsertText { paragraph_index, run_index, offset, text } => {
                WriterOperation::DeleteText {
                    paragraph_index: *paragraph_index,
                    run_index: *run_index,
                    offset: *offset,
                    length: text.len(),
                    deleted_text: text.clone(),
                }
            }
            WriterOperation::DeleteText { paragraph_index, run_index, offset, deleted_text, .. } => {
                WriterOperation::InsertText {
                    paragraph_index: *paragraph_index,
                    run_index: *run_index,
                    offset: *offset,
                    text: deleted_text.clone(),
                }
            }
            WriterOperation::InsertParagraph { index, paragraph } => {
                WriterOperation::DeleteParagraph { index: *index, paragraph: paragraph.clone() }
            }
            WriterOperation::DeleteParagraph { index, paragraph } => {
                WriterOperation::InsertParagraph { index: *index, paragraph: paragraph.clone() }
            }
            WriterOperation::SetRunFormatting { paragraph_index, run_index, old_properties, new_properties } => {
                WriterOperation::SetRunFormatting {
                    paragraph_index: *paragraph_index,
                    run_index: *run_index,
                    old_properties: new_properties.clone(),
                    new_properties: old_properties.clone(),
                }
            }
            WriterOperation::SetParagraphAlignment { paragraph_index, old_alignment, new_alignment } => {
                WriterOperation::SetParagraphAlignment {
                    paragraph_index: *paragraph_index,
                    old_alignment: *new_alignment,
                    new_alignment: *old_alignment,
                }
            }
            WriterOperation::SetParagraphList { paragraph_index, old_list, new_list } => {
                WriterOperation::SetParagraphList {
                    paragraph_index: *paragraph_index,
                    old_list: new_list.clone(),
                    new_list: old_list.clone(),
                }
            }
            WriterOperation::InsertTable { index, table } => {
                WriterOperation::DeleteTable { index: *index, table: table.clone() }
            }
            WriterOperation::DeleteTable { index, table } => {
                WriterOperation::InsertTable { index: *index, table: table.clone() }
            }
        }
    }
}
