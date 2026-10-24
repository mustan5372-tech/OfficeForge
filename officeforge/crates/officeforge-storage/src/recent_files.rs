use chrono::{DateTime, Utc};
use officeforge_core::document::DocumentType;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tracing::{debug, warn};

const MAX_RECENT_FILES: usize = 25;

/// A recently opened file entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentFileEntry {
    pub path: String,
    pub title: String,
    pub doc_type: DocumentType,
    pub last_opened: DateTime<Utc>,
    pub pinned: bool,
}

/// Manages the recent files list, persisted as JSON.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecentFilesStore {
    pub entries: Vec<RecentFileEntry>,
    #[serde(skip)]
    store_path: PathBuf,
}

impl RecentFilesStore {
    pub fn new(store_path: PathBuf) -> Self {
        Self {
            entries: Vec::new(),
            store_path,
        }
    }

    /// Load from disk, or return empty if not found.
    pub fn load(store_path: PathBuf) -> Self {
        if store_path.exists() {
            match std::fs::read_to_string(&store_path) {
                Ok(content) => {
                    match serde_json::from_str::<RecentFilesStore>(&content) {
                        Ok(mut store) => {
                            store.store_path = store_path;
                            debug!("Loaded {} recent files", store.entries.len());
                            return store;
                        }
                        Err(e) => warn!("Failed to parse recent files: {e}"),
                    }
                }
                Err(e) => warn!("Failed to read recent files: {e}"),
            }
        }
        Self::new(store_path)
    }

    /// Save to disk.
    pub fn save(&self) -> std::io::Result<()> {
        if let Some(parent) = self.store_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
        std::fs::write(&self.store_path, json)?;
        debug!("Saved {} recent files", self.entries.len());
        Ok(())
    }

    /// Add or update a file in the recent list.
    pub fn add(&mut self, path: &str, title: &str, doc_type: DocumentType) {
        // Remove existing entry for this path
        self.entries.retain(|e| e.path != path);

        // Add to front
        self.entries.insert(0, RecentFileEntry {
            path: path.to_string(),
            title: title.to_string(),
            doc_type,
            last_opened: Utc::now(),
            pinned: false,
        });

        // Trim to max size (keep pinned entries)
        while self.entries.len() > MAX_RECENT_FILES {
            if let Some(pos) = self.entries.iter().rposition(|e| !e.pinned) {
                self.entries.remove(pos);
            } else {
                break;
            }
        }
    }

    /// Toggle pin status.
    pub fn toggle_pin(&mut self, path: &str) -> bool {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.path == path) {
            entry.pinned = !entry.pinned;
            entry.pinned
        } else {
            false
        }
    }

    /// Remove a file from the list.
    pub fn remove(&mut self, path: &str) {
        self.entries.retain(|e| e.path != path);
    }

    /// Search recent files by title or path.
    pub fn search(&self, query: &str) -> Vec<&RecentFileEntry> {
        let query_lower = query.to_lowercase();
        self.entries.iter().filter(|e| {
            e.title.to_lowercase().contains(&query_lower)
                || e.path.to_lowercase().contains(&query_lower)
        }).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_recent() {
        let mut store = RecentFilesStore::new(PathBuf::from("/tmp/test.json"));
        store.add("/path/doc.docx", "My Document", DocumentType::Writer);
        assert_eq!(store.entries.len(), 1);
        assert_eq!(store.entries[0].title, "My Document");
    }

    #[test]
    fn test_dedup() {
        let mut store = RecentFilesStore::new(PathBuf::from("/tmp/test.json"));
        store.add("/path/doc.docx", "Version 1", DocumentType::Writer);
        store.add("/path/other.xlsx", "Spreadsheet", DocumentType::Sheets);
        store.add("/path/doc.docx", "Version 2", DocumentType::Writer);

        assert_eq!(store.entries.len(), 2);
        assert_eq!(store.entries[0].title, "Version 2"); // Most recent first
    }

    #[test]
    fn test_search() {
        let mut store = RecentFilesStore::new(PathBuf::from("/tmp/test.json"));
        store.add("/docs/report.docx", "Annual Report", DocumentType::Writer);
        store.add("/docs/budget.xlsx", "Budget 2024", DocumentType::Sheets);

        let results = store.search("report");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Annual Report");
    }

    #[test]
    fn test_pin() {
        let mut store = RecentFilesStore::new(PathBuf::from("/tmp/test.json"));
        store.add("/path/doc.docx", "Doc", DocumentType::Writer);
        assert!(!store.entries[0].pinned);

        store.toggle_pin("/path/doc.docx");
        assert!(store.entries[0].pinned);
    }
}
