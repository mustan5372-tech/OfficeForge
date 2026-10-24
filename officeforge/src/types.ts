export type WorkspaceType = "home" | "writer" | "sheets" | "slides";

export interface DocumentSummary {
  id: string;
  title: string;
  doc_type: "Writer" | "Sheets" | "Slides";
  is_dirty: boolean;
  file_path?: string;
  last_modified?: string;
}

export interface RecentFile {
  id: string;
  path: string;
  title: string;
  doc_type: "Writer" | "Sheets" | "Slides";
  last_opened: string;
  is_pinned: boolean;
  size_bytes?: number;
}

export interface SuiteSettings {
  authorName: string;
  theme: "light" | "dark" | "system";
  autosaveMinutes: number;
  measurementUnit: "inches" | "points" | "millimeters";
  defaultFont: string;
}

// --- Writer Document Types ---

export interface WriterRun {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  highlight?: string;
}

export interface WriterParagraph {
  id: string;
  runs: WriterRun[];
  alignment: "left" | "center" | "right" | "justify";
  style?: "normal" | "h1" | "h2" | "h3" | "quote" | "bullet" | "number";
  lineSpacing?: number;
  indent?: number;
}

export interface WriterTable {
  id: string;
  rows: number;
  cols: number;
  data: string[][];
}

export interface WriterDocumentModel {
  id: string;
  title: string;
  paragraphs: WriterParagraph[];
  tables: WriterTable[];
  pageSettings: {
    paperSize: "letter" | "a4" | "legal";
    orientation: "portrait" | "landscape";
    margins: { top: number; right: number; bottom: number; left: number }; // inches
  };
}

// --- Sheets Document Types ---

export type CellValueType = "string" | "number" | "boolean" | "error" | "formula";

export interface SheetCell {
  raw: string; // The formula or raw text
  computed: string; // Displayed result
  type: CellValueType;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  format?: "general" | "currency" | "percent" | "number" | "date";
}

export interface WorksheetModel {
  id: string;
  name: string;
  cells: Record<string, SheetCell>; // e.g. "A1": SheetCell
  rowCount: number;
  colCount: number;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
}

export interface WorkbookModel {
  id: string;
  title: string;
  sheets: WorksheetModel[];
  activeSheetIndex: number;
}

// --- Slides Document Types ---

export type ShapeKind = "rectangle" | "rounded-rect" | "ellipse" | "arrow" | "star" | "textbox" | "image";

export interface SlideObject {
  id: string;
  kind: ShapeKind;
  x: number; // percentage of slide width (0 to 100)
  y: number; // percentage of slide height (0 to 100)
  width: number;
  height: number;
  rotation?: number;
  fillColor?: string;
  borderColor?: string;
  borderWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  imageUrl?: string;
}

export interface SlideModel {
  id: string;
  objects: SlideObject[];
  bgColor: string;
  title?: string;
}

export interface PresentationModel {
  id: string;
  title: string;
  slides: SlideModel[];
  activeSlideIndex: number;
  aspectRatio: "16:9" | "4:3";
}
