import React from "react";
import {
  FileText,
  Table,
  Presentation,
  Home,
  Save,
  FolderOpen,
  Settings,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { WorkspaceType } from "../../types";

interface OfficeForgeHeaderProps {
  currentWorkspace: WorkspaceType;
  onSelectWorkspace: (ws: WorkspaceType) => void;
  documentTitle: string;
  isDirty: boolean;
  onSave: () => void;
  onOpen: () => void;
  onNew: (type: "writer" | "sheets" | "slides") => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const OfficeForgeHeader: React.FC<OfficeForgeHeaderProps> = ({
  currentWorkspace,
  onSelectWorkspace,
  documentTitle,
  isDirty,
  onSave,
  onOpen,
  onNew,
  onOpenSettings,
  isDark,
  onToggleTheme,
}) => {
  const [newMenuOpen, setNewMenuOpen] = React.useState(false);

  return (
    <header className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 select-none z-30 transition-colors">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectWorkspace("home")}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          title="OfficeForge Home"
        >
          <img
            src="/logo.png"
            alt="OfficeForge Logo"
            className="w-7 h-7 object-contain drop-shadow-sm"
          />
          <span className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight text-sm">
            Office<span className="text-indigo-600 dark:text-indigo-400">Forge</span>
          </span>
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Current Document Name & Dirty Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
            {documentTitle || "Untitled"}
          </span>
          {isDirty && (
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
              title="Unsaved changes"
            >
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Center Integrated Workspace Navigation Tabs */}
      <nav className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
        <button
          onClick={() => onSelectWorkspace("home")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentWorkspace === "home"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectWorkspace("writer")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentWorkspace === "writer"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Writer</span>
        </button>

        <button
          onClick={() => onSelectWorkspace("sheets")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentWorkspace === "sheets"
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Sheets</span>
        </button>

        <button
          onClick={() => onSelectWorkspace("slides")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            currentWorkspace === "slides"
              ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>Slides</span>
        </button>
      </nav>

      {/* Global Quick Actions */}
      <div className="flex items-center gap-1">
        {/* New Document Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNewMenuOpen(!newMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            title="Create New Document"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {newMenuOpen && (
            <div
              className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 text-xs"
              onClick={() => setNewMenuOpen(false)}
            >
              <button
                onClick={() => onNew("writer")}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Writer Document</span>
              </button>
              <button
                onClick={() => onNew("sheets")}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-600"
              >
                <Table className="w-4 h-4 text-emerald-600" />
                <span>Sheets Workbook</span>
              </button>
              <button
                onClick={() => onNew("slides")}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-600"
              >
                <Presentation className="w-4 h-4 text-amber-600" />
                <span>Slides Presentation</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onOpen}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          title="Open Local File (Ctrl+O)"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        <button
          onClick={onSave}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          title="Save Document (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Suite Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
