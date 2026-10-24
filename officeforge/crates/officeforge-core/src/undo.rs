use serde::{Deserialize, Serialize};
use std::fmt;

/// A generic undo/redo stack that works with any operation type.
///
/// Operations must implement `UndoableOperation` to define how they
/// are applied and reversed. The stack maintains a linear history
/// with a cursor; redo history is discarded when a new operation is pushed.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UndoStack<Op> {
    operations: Vec<Op>,
    /// Points to the next operation index. Operations before this index have
    /// been applied; operations at or after this index are available for redo.
    cursor: usize,
    /// Maximum number of operations to retain.
    max_size: usize,
}

impl<Op> UndoStack<Op> {
    pub fn new(max_size: usize) -> Self {
        Self {
            operations: Vec::new(),
            cursor: 0,
            max_size,
        }
    }

    /// Push a new operation onto the stack. Discards any redo history.
    pub fn push(&mut self, op: Op) {
        // Discard redo history
        self.operations.truncate(self.cursor);
        self.operations.push(op);
        self.cursor += 1;

        // Enforce max size by removing oldest operations
        if self.operations.len() > self.max_size {
            let excess = self.operations.len() - self.max_size;
            self.operations.drain(0..excess);
            self.cursor = self.cursor.saturating_sub(excess);
        }
    }

    /// Returns the operation to undo (the most recently applied operation),
    /// and moves the cursor back. Returns `None` if nothing to undo.
    pub fn undo(&mut self) -> Option<&Op> {
        if self.cursor == 0 {
            return None;
        }
        self.cursor -= 1;
        Some(&self.operations[self.cursor])
    }

    /// Returns the operation to redo (the next unapplied operation),
    /// and moves the cursor forward. Returns `None` if nothing to redo.
    pub fn redo(&mut self) -> Option<&Op> {
        if self.cursor >= self.operations.len() {
            return None;
        }
        let op = &self.operations[self.cursor];
        self.cursor += 1;
        Some(op)
    }

    /// Whether there are operations available to undo.
    pub fn can_undo(&self) -> bool {
        self.cursor > 0
    }

    /// Whether there are operations available to redo.
    pub fn can_redo(&self) -> bool {
        self.cursor < self.operations.len()
    }

    /// Clear all history.
    pub fn clear(&mut self) {
        self.operations.clear();
        self.cursor = 0;
    }

    /// Number of operations that can be undone.
    pub fn undo_count(&self) -> usize {
        self.cursor
    }

    /// Number of operations that can be redone.
    pub fn redo_count(&self) -> usize {
        self.operations.len() - self.cursor
    }
}

impl<Op> Default for UndoStack<Op> {
    fn default() -> Self {
        Self::new(500)
    }
}

impl<Op: fmt::Display> fmt::Display for UndoStack<Op> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "UndoStack({} undo, {} redo)",
            self.undo_count(),
            self.redo_count()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    struct TestOp(String);

    #[test]
    fn test_push_and_undo() {
        let mut stack: UndoStack<TestOp> = UndoStack::new(100);
        stack.push(TestOp("A".into()));
        stack.push(TestOp("B".into()));

        assert!(stack.can_undo());
        assert!(!stack.can_redo());

        let op = stack.undo().unwrap();
        assert_eq!(op.0, "B");
        assert!(stack.can_redo());
    }

    #[test]
    fn test_undo_redo_cycle() {
        let mut stack: UndoStack<TestOp> = UndoStack::new(100);
        stack.push(TestOp("A".into()));
        stack.push(TestOp("B".into()));

        stack.undo(); // undo B
        let op = stack.redo().unwrap(); // redo B
        assert_eq!(op.0, "B");
    }

    #[test]
    fn test_push_clears_redo() {
        let mut stack: UndoStack<TestOp> = UndoStack::new(100);
        stack.push(TestOp("A".into()));
        stack.push(TestOp("B".into()));
        stack.undo(); // undo B, redo available

        stack.push(TestOp("C".into())); // should discard B
        assert!(!stack.can_redo());
        assert_eq!(stack.undo_count(), 2); // A, C
    }

    #[test]
    fn test_max_size() {
        let mut stack: UndoStack<TestOp> = UndoStack::new(3);
        for i in 0..5 {
            stack.push(TestOp(format!("{i}")));
        }
        assert_eq!(stack.undo_count(), 3);
    }

    #[test]
    fn test_empty_stack() {
        let mut stack: UndoStack<TestOp> = UndoStack::new(100);
        assert!(!stack.can_undo());
        assert!(!stack.can_redo());
        assert!(stack.undo().is_none());
        assert!(stack.redo().is_none());
    }
}
