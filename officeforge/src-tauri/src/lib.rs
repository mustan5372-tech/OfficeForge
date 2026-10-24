use officeforge_sheets::Workbook;
use officeforge_slides::Presentation;
use officeforge_storage::RecentFilesStore;
use officeforge_writer::WriterDocument;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tracing::info;

/// Application state managed by Tauri.
pub struct AppState {
    pub writer_documents: Mutex<HashMap<String, WriterDocument>>,
    pub sheet_workbooks: Mutex<HashMap<String, Workbook>>,
    pub slide_presentations: Mutex<HashMap<String, Presentation>>,
    pub recent_files: Mutex<RecentFilesStore>,
}

/// Summary of an open document sent to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentSummary {
    pub id: String,
    pub title: String,
    pub doc_type: String,
    pub is_dirty: bool,
    pub file_path: Option<String>,
}

// --- Tauri Commands ---

#[tauri::command]
fn create_writer_document(state: tauri::State<'_, AppState>, title: String) -> Result<DocumentSummary, String> {
    let doc = WriterDocument::new(&title);
    let id = doc.metadata.id.to_string();
    let summary = DocumentSummary {
        id: id.clone(),
        title: doc.metadata.title.clone(),
        doc_type: "Writer".to_string(),
        is_dirty: false,
        file_path: None,
    };
    state.writer_documents.lock().map_err(|e| e.to_string())?
        .insert(id, doc);
    info!("Created Writer document: {}", summary.title);
    Ok(summary)
}

#[tauri::command]
fn create_sheets_workbook(state: tauri::State<'_, AppState>, title: String) -> Result<DocumentSummary, String> {
    let wb = Workbook::new(&title);
    let id = wb.metadata.id.to_string();
    let summary = DocumentSummary {
        id: id.clone(),
        title: wb.metadata.title.clone(),
        doc_type: "Sheets".to_string(),
        is_dirty: false,
        file_path: None,
    };
    state.sheet_workbooks.lock().map_err(|e| e.to_string())?
        .insert(id, wb);
    info!("Created Sheets workbook: {}", summary.title);
    Ok(summary)
}

#[tauri::command]
fn create_slides_presentation(state: tauri::State<'_, AppState>, title: String) -> Result<DocumentSummary, String> {
    let pres = Presentation::new(&title);
    let id = pres.metadata.id.to_string();
    let summary = DocumentSummary {
        id: id.clone(),
        title: pres.metadata.title.clone(),
        doc_type: "Slides".to_string(),
        is_dirty: false,
        file_path: None,
    };
    state.slide_presentations.lock().map_err(|e| e.to_string())?
        .insert(id, pres);
    info!("Created Slides presentation: {}", summary.title);
    Ok(summary)
}

#[tauri::command]
fn get_open_documents(state: tauri::State<'_, AppState>) -> Result<Vec<DocumentSummary>, String> {
    let mut docs = Vec::new();

    if let Ok(writers) = state.writer_documents.lock() {
        for (id, doc) in writers.iter() {
            docs.push(DocumentSummary {
                id: id.clone(),
                title: doc.metadata.title.clone(),
                doc_type: "Writer".to_string(),
                is_dirty: doc.metadata.is_dirty,
                file_path: doc.metadata.file_path.clone(),
            });
        }
    }
    if let Ok(sheets) = state.sheet_workbooks.lock() {
        for (id, wb) in sheets.iter() {
            docs.push(DocumentSummary {
                id: id.clone(),
                title: wb.metadata.title.clone(),
                doc_type: "Sheets".to_string(),
                is_dirty: wb.metadata.is_dirty,
                file_path: wb.metadata.file_path.clone(),
            });
        }
    }
    if let Ok(slides) = state.slide_presentations.lock() {
        for (id, pres) in slides.iter() {
            docs.push(DocumentSummary {
                id: id.clone(),
                title: pres.metadata.title.clone(),
                doc_type: "Slides".to_string(),
                is_dirty: pres.metadata.is_dirty,
                file_path: pres.metadata.file_path.clone(),
            });
        }
    }

    Ok(docs)
}

#[tauri::command]
fn get_recent_files(state: tauri::State<'_, AppState>) -> Result<Vec<officeforge_storage::recent_files::RecentFileEntry>, String> {
    let store = state.recent_files.lock().map_err(|e| e.to_string())?;
    Ok(store.entries.clone())
}

#[tauri::command]
fn get_writer_document(state: tauri::State<'_, AppState>, id: String) -> Result<WriterDocument, String> {
    let docs = state.writer_documents.lock().map_err(|e| e.to_string())?;
    docs.get(&id).cloned().ok_or_else(|| format!("Document not found: {id}"))
}

#[tauri::command]
fn get_sheets_workbook(state: tauri::State<'_, AppState>, id: String) -> Result<Workbook, String> {
    let wbs = state.sheet_workbooks.lock().map_err(|e| e.to_string())?;
    wbs.get(&id).cloned().ok_or_else(|| format!("Workbook not found: {id}"))
}

#[tauri::command]
fn get_slides_presentation(state: tauri::State<'_, AppState>, id: String) -> Result<Presentation, String> {
    let preses = state.slide_presentations.lock().map_err(|e| e.to_string())?;
    preses.get(&id).cloned().ok_or_else(|| format!("Presentation not found: {id}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info"))
        )
        .init();

    info!("Starting OfficeForge v{}", env!("CARGO_PKG_VERSION"));

    let app_data = dirs_path();
    let recent_files_path = app_data.join("recent_files.json");
    let recent_files = RecentFilesStore::load(recent_files_path);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(AppState {
            writer_documents: Mutex::new(HashMap::new()),
            sheet_workbooks: Mutex::new(HashMap::new()),
            slide_presentations: Mutex::new(HashMap::new()),
            recent_files: Mutex::new(recent_files),
        })
        .invoke_handler(tauri::generate_handler![
            create_writer_document,
            create_sheets_workbook,
            create_slides_presentation,
            get_open_documents,
            get_recent_files,
            get_writer_document,
            get_sheets_workbook,
            get_slides_presentation,
        ])
        .setup(|_app| {
            info!("OfficeForge application setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running OfficeForge");
}

fn dirs_path() -> std::path::PathBuf {
    let mut path = dirs_next().unwrap_or_else(|| std::path::PathBuf::from("."));
    path.push("OfficeForge");
    std::fs::create_dir_all(&path).ok();
    path
}

fn dirs_next() -> Option<std::path::PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA").ok().map(std::path::PathBuf::from)
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME").ok().map(|h| std::path::PathBuf::from(h).join(".config"))
    }
}
