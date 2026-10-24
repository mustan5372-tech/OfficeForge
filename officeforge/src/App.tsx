import { useState, useEffect } from "react";
import { OfficeForgeHeader } from "./components/Shell/OfficeForgeHeader";
import { OfficeForgeStatusBar } from "./components/Shell/OfficeForgeStatusBar";
import { HomeScreen } from "./components/Home/HomeScreen";
import { WriterWorkspace } from "./components/Writer/WriterWorkspace";
import { SheetsWorkspace } from "./components/Sheets/SheetsWorkspace";
import { SlidesWorkspace } from "./components/Slides/SlidesWorkspace";
import { SettingsModal } from "./components/Settings/SettingsModal";
import {
  WorkspaceType,
  RecentFile,
  WriterDocumentModel,
  WorkbookModel,
  PresentationModel,
  SuiteSettings,
} from "./types";

// Initial Starter Documents
const initialWriterDoc: WriterDocumentModel = {
  id: "doc-init",
  title: "Annual Product Roadmap.docx",
  pageSettings: {
    paperSize: "letter",
    orientation: "portrait",
    margins: { top: 1, right: 1, bottom: 1, left: 1 },
  },
  paragraphs: [
    {
      id: "p-1",
      runs: [{ id: "r-1", text: "OfficeForge 2026 Strategy & Roadmap", bold: true, fontSize: 24 }],
      alignment: "left",
      style: "h1",
    },
    {
      id: "p-2",
      runs: [
        {
          id: "r-2",
          text: "This document outlines the core architecture and development milestones for OfficeForge, an independent native desktop productivity suite built with high-performance Rust and modern web technologies.",
        },
      ],
      alignment: "justify",
      style: "normal",
    },
    {
      id: "p-3",
      runs: [{ id: "r-3", text: "Key Objectives", bold: true, fontSize: 16 }],
      alignment: "left",
      style: "h2",
    },
    {
      id: "p-4",
      runs: [{ id: "r-4", text: "Complete independence from Microsoft Office installations." }],
      alignment: "left",
      style: "bullet",
    },
    {
      id: "p-5",
      runs: [{ id: "r-5", text: "100% local-first data processing with zero unauthorized telemetry." }],
      alignment: "left",
      style: "bullet",
    },
    {
      id: "p-6",
      runs: [{ id: "r-6", text: "Strict ECMA-376 (OOXML) package validation and format interoperability." }],
      alignment: "left",
      style: "bullet",
    },
  ],
  tables: [],
};

const initialSheetsWb: WorkbookModel = {
  id: "wb-init",
  title: "Q4 Financial Model.xlsx",
  activeSheetIndex: 0,
  sheets: [
    {
      id: "s-1",
      name: "Summary",
      rowCount: 30,
      colCount: 12,
      cells: {
        A1: { raw: "Department", computed: "Department", type: "string", bold: true },
        B1: { raw: "Q1 Budget", computed: "Q1 Budget", type: "string", bold: true, align: "right" },
        C1: { raw: "Q2 Budget", computed: "Q2 Budget", type: "string", bold: true, align: "right" },
        D1: { raw: "Total", computed: "Total", type: "string", bold: true, align: "right" },
        A2: { raw: "Engineering", computed: "Engineering", type: "string" },
        B2: { raw: "125000", computed: "125000", type: "number", format: "currency" },
        C2: { raw: "140000", computed: "140000", type: "number", format: "currency" },
        D2: { raw: "=B2+C2", computed: "265000", type: "formula", format: "currency" },
        A3: { raw: "Design & UX", computed: "Design & UX", type: "string" },
        B3: { raw: "45000", computed: "45000", type: "number", format: "currency" },
        C3: { raw: "52000", computed: "52000", type: "number", format: "currency" },
        D3: { raw: "=B3+C3", computed: "97000", type: "formula", format: "currency" },
        A4: { raw: "Operations", computed: "Operations", type: "string" },
        B4: { raw: "30000", computed: "30000", type: "number", format: "currency" },
        C4: { raw: "35000", computed: "35000", type: "number", format: "currency" },
        D4: { raw: "=B4+C4", computed: "65000", type: "formula", format: "currency" },
        A5: { raw: "Total Expenses", computed: "Total Expenses", type: "string", bold: true },
        B5: { raw: "=SUM(B2:B4)", computed: "200000", type: "formula", bold: true, format: "currency" },
        C5: { raw: "=SUM(C2:C4)", computed: "227000", type: "formula", bold: true, format: "currency" },
        D5: { raw: "=SUM(D2:D4)", computed: "427000", type: "formula", bold: true, format: "currency" },
      },
    },
    {
      id: "s-2",
      name: "Breakdown",
      rowCount: 30,
      colCount: 10,
      cells: {},
    },
  ],
};

const initialSlidesPres: PresentationModel = {
  id: "pres-init",
  title: "OfficeForge Architecture Pitch.pptx",
  activeSlideIndex: 0,
  aspectRatio: "16:9",
  slides: [
    {
      id: "slide-1",
      title: "Title Slide",
      bgColor: "#0f172a",
      objects: [
        {
          id: "t-1",
          kind: "textbox",
          x: 10,
          y: 30,
          width: 80,
          height: 18,
          text: "OfficeForge Productivity Suite",
          fontSize: 32,
          bold: true,
          textColor: "#f8fafc",
          align: "center",
        },
        {
          id: "t-2",
          kind: "textbox",
          x: 15,
          y: 50,
          width: 70,
          height: 12,
          text: "High-Performance Rust Core • Modern Desktop Integration",
          fontSize: 16,
          textColor: "#94a3b8",
          align: "center",
        },
      ],
    },
    {
      id: "slide-2",
      title: "Three Integrated Workspaces",
      bgColor: "#ffffff",
      objects: [
        {
          id: "t-3",
          kind: "textbox",
          x: 8,
          y: 10,
          width: 84,
          height: 14,
          text: "Unified Desktop Experience",
          fontSize: 26,
          bold: true,
          textColor: "#0f172a",
        },
        {
          id: "box-1",
          kind: "rounded-rect",
          x: 8,
          y: 30,
          width: 25,
          height: 45,
          fillColor: "#eff6ff",
          borderColor: "#3b82f6",
          borderWidth: 2,
          text: "OfficeForge Writer\n\n• Rich-text editing\n• Document models\n• .docx import/export",
          fontSize: 13,
          textColor: "#1e3a8a",
        },
        {
          id: "box-2",
          kind: "rounded-rect",
          x: 37,
          y: 30,
          width: 25,
          height: 45,
          fillColor: "#ecfdf5",
          borderColor: "#10b981",
          borderWidth: 2,
          text: "OfficeForge Sheets\n\n• AST calculation\n• 30+ Functions\n• .xlsx/.csv support",
          fontSize: 13,
          textColor: "#064e3b",
        },
        {
          id: "box-3",
          kind: "rounded-rect",
          x: 66,
          y: 30,
          width: 25,
          height: 45,
          fillColor: "#fffbeb",
          borderColor: "#f59e0b",
          borderWidth: 2,
          text: "OfficeForge Slides\n\n• EMU coordinates\n• Shapes & layouts\n• .pptx export",
          fontSize: 13,
          textColor: "#78350f",
        },
      ],
    },
  ],
};

const initialRecentFiles: RecentFile[] = [
  {
    id: "rf-1",
    path: "C:\\Users\\sanaw\\Documents\\Annual Product Roadmap.docx",
    title: "Annual Product Roadmap.docx",
    doc_type: "Writer",
    last_opened: "Just now",
    is_pinned: true,
  },
  {
    id: "rf-2",
    path: "C:\\Users\\sanaw\\Documents\\Q4 Financial Model.xlsx",
    title: "Q4 Financial Model.xlsx",
    doc_type: "Sheets",
    last_opened: "Today, 10:15 AM",
    is_pinned: true,
  },
  {
    id: "rf-3",
    path: "C:\\Users\\sanaw\\Documents\\OfficeForge Architecture Pitch.pptx",
    title: "OfficeForge Architecture Pitch.pptx",
    doc_type: "Slides",
    last_opened: "Yesterday",
    is_pinned: false,
  },
];

export function App() {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>("home");
  const [writerDoc, setWriterDoc] = useState<WriterDocumentModel>(initialWriterDoc);
  const [sheetsWb, setSheetsWb] = useState<WorkbookModel>(initialSheetsWb);
  const [slidesPres, setSlidesPres] = useState<PresentationModel>(initialSlidesPres);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(initialRecentFiles);
  const [isDirty, setIsDirty] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDark, setIsDark] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SuiteSettings>({
    authorName: "OfficeForge User",
    theme: "light",
    autosaveMinutes: 2,
    measurementUnit: "inches",
    defaultFont: "Inter",
  });

  // Apply dark theme class to <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Compute Word Count for Writer
  const wordCount = writerDoc.paragraphs.reduce((total, p) => {
    const text = p.runs.map((r) => r.text).join(" ").trim();
    if (!text) return total;
    return total + text.split(/\s+/).length;
  }, 0);

  // Active document title
  let currentTitle = "OfficeForge Suite";
  if (currentWorkspace === "writer") currentTitle = writerDoc.title;
  if (currentWorkspace === "sheets") currentTitle = sheetsWb.title;
  if (currentWorkspace === "slides") currentTitle = slidesPres.title;

  const handleNewDocument = (type: "writer" | "sheets" | "slides", templateName?: string) => {
    if (type === "writer") {
      setWriterDoc({
        id: "doc-" + Date.now(),
        title: templateName ? `${templateName}.docx` : "Untitled Document.docx",
        pageSettings: {
          paperSize: "letter",
          orientation: "portrait",
          margins: { top: 1, right: 1, bottom: 1, left: 1 },
        },
        paragraphs: [
          {
            id: "p-new-1",
            runs: [{ id: "r-new-1", text: templateName || "Untitled Document", bold: true, fontSize: 24 }],
            alignment: "left",
            style: "h1",
          },
          {
            id: "p-new-2",
            runs: [{ id: "r-new-2", text: "Start writing here..." }],
            alignment: "left",
            style: "normal",
          },
        ],
        tables: [],
      });
      setCurrentWorkspace("writer");
    } else if (type === "sheets") {
      setSheetsWb({
        id: "wb-" + Date.now(),
        title: templateName ? `${templateName}.xlsx` : "Untitled Spreadsheet.xlsx",
        activeSheetIndex: 0,
        sheets: [
          {
            id: "sheet-1",
            name: "Sheet1",
            rowCount: 30,
            colCount: 15,
            cells: templateName === "Monthly Budget"
              ? {
                  A1: { raw: "Item", computed: "Item", type: "string", bold: true },
                  B1: { raw: "Cost", computed: "Cost", type: "string", bold: true, align: "right" },
                  A2: { raw: "Rent", computed: "Rent", type: "string" },
                  B2: { raw: "1500", computed: "1500", type: "number", format: "currency" },
                  A3: { raw: "Groceries", computed: "Groceries", type: "string" },
                  B3: { raw: "450", computed: "450", type: "number", format: "currency" },
                  A4: { raw: "Total", computed: "Total", type: "string", bold: true },
                  B4: { raw: "=SUM(B2:B3)", computed: "1950", type: "formula", bold: true, format: "currency" },
                }
              : {},
          },
        ],
      });
      setCurrentWorkspace("sheets");
    } else if (type === "slides") {
      setSlidesPres({
        id: "pres-" + Date.now(),
        title: templateName ? `${templateName}.pptx` : "Untitled Presentation.pptx",
        activeSlideIndex: 0,
        aspectRatio: "16:9",
        slides: [
          {
            id: "s-1",
            title: "Slide 1",
            bgColor: "#ffffff",
            objects: [
              {
                id: "obj-title",
                kind: "textbox",
                x: 10,
                y: 35,
                width: 80,
                height: 20,
                text: templateName || "Double-click to add title",
                fontSize: 30,
                bold: true,
                align: "center",
                textColor: "#0f172a",
              },
            ],
          },
        ],
      });
      setCurrentWorkspace("slides");
    }
    setIsDirty(false);
  };

  const handleOpenDocument = (file?: RecentFile) => {
    if (file) {
      if (file.doc_type === "Writer") setCurrentWorkspace("writer");
      if (file.doc_type === "Sheets") setCurrentWorkspace("sheets");
      if (file.doc_type === "Slides") setCurrentWorkspace("slides");
    } else {
      // Prompt user or open active workspace
      setCurrentWorkspace("writer");
    }
  };

  const handleSave = () => {
    setIsDirty(false);
    // Add to recent files if not already present
    const existing = recentFiles.find((f) => f.title === currentTitle);
    if (!existing) {
      setRecentFiles([
        {
          id: "rf-" + Date.now(),
          title: currentTitle,
          path: `C:\\Users\\sanaw\\Documents\\${currentTitle}`,
          doc_type: currentWorkspace === "writer" ? "Writer" : currentWorkspace === "sheets" ? "Sheets" : "Slides",
          last_opened: "Just now",
          is_pinned: false,
        },
        ...recentFiles,
      ]);
    }
  };

  const handleTogglePin = (fileId: string) => {
    setRecentFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, is_pinned: !f.is_pinned } : f))
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. Unified Application Header */}
      <OfficeForgeHeader
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={setCurrentWorkspace}
        documentTitle={currentTitle}
        isDirty={isDirty}
        onSave={handleSave}
        onOpen={() => handleOpenDocument()}
        onNew={handleNewDocument}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* 2. Main Workspace Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentWorkspace === "home" && (
          <HomeScreen
            onNewDocument={handleNewDocument}
            onOpenDocument={handleOpenDocument}
            recentFiles={recentFiles}
            onTogglePin={handleTogglePin}
          />
        )}

        {currentWorkspace === "writer" && (
          <WriterWorkspace
            document={writerDoc}
            onChange={(doc) => {
              setWriterDoc(doc);
              setIsDirty(true);
            }}
            zoom={zoom}
          />
        )}

        {currentWorkspace === "sheets" && (
          <SheetsWorkspace
            workbook={sheetsWb}
            onChange={(wb) => {
              setSheetsWb(wb);
              setIsDirty(true);
            }}
            zoom={zoom}
          />
        )}

        {currentWorkspace === "slides" && (
          <SlidesWorkspace
            presentation={slidesPres}
            onChange={(pres) => {
              setSlidesPres(pres);
              setIsDirty(true);
            }}
            zoom={zoom}
          />
        )}
      </main>

      {/* 3. Unified Status Bar */}
      <OfficeForgeStatusBar
        currentWorkspace={currentWorkspace}
        zoom={zoom}
        onZoomChange={setZoom}
        wordCount={wordCount}
        pageCount={1}
        activeSlide={slidesPres.activeSlideIndex + 1}
        totalSlides={slidesPres.slides.length}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />
    </div>
  );
}

export default App;
