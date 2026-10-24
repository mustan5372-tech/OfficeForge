import React, { useState } from "react";
import {
  FileText,
  Table,
  Presentation,
  FolderOpen,
  Pin,
  Clock,
  Search,
  FilePlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { RecentFile } from "../../types";

interface HomeScreenProps {
  onNewDocument: (type: "writer" | "sheets" | "slides", templateName?: string) => void;
  onOpenDocument: (file?: RecentFile) => void;
  recentFiles: RecentFile[];
  onTogglePin: (fileId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNewDocument,
  onOpenDocument,
  recentFiles,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "writer" | "sheets" | "slides">("all");

  const filteredFiles = recentFiles.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedFilter === "all" || file.doc_type.toLowerCase() === selectedFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-5">
            <img
              src="/logo.png"
              alt="OfficeForge Logo"
              className="w-16 h-16 object-contain drop-shadow-md rounded-2xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Unified Productivity Suite
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Welcome to Office<span className="text-indigo-600 dark:text-indigo-400">Forge</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Create, calculate, and present with native speed, local-first safety, and full Office Open XML compatibility.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenDocument()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all hover:border-slate-400"
          >
            <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Open Existing File...</span>
          </button>
        </div>

        {/* Primary Creation Cards */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Create New Document
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Writer Card */}
            <div
              onClick={() => onNewDocument("writer")}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
                <span>OfficeForge Writer</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Word processor with formatted runs, page layout, tables, lists, and full .docx compatibility.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                <FilePlus className="w-3.5 h-3.5" />
                <span>Blank Document (.docx)</span>
              </div>
            </div>

            {/* Sheets Card */}
            <div
              onClick={() => onNewDocument("sheets")}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Table className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
                <span>OfficeForge Sheets</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Spreadsheet application with AST calculation engine, 30+ Excel functions, and .xlsx/.csv support.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <FilePlus className="w-3.5 h-3.5" />
                <span>Blank Workbook (.xlsx)</span>
              </div>
            </div>

            {/* Slides Card */}
            <div
              onClick={() => onNewDocument("slides")}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-6 cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Presentation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
                <span>OfficeForge Slides</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Presentation editor with EMU coordinate canvas, shapes, text boxes, and .pptx export.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <FilePlus className="w-3.5 h-3.5" />
                <span>Blank Presentation (.pptx)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Curated Templates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => onNewDocument("writer", "Project Proposal")}
              className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
            >
              <div className="h-20 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center mb-2 border border-blue-100 dark:border-blue-900/30">
                <FileText className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Project Proposal</p>
              <p className="text-[10px] text-slate-500">Writer • Formatted report</p>
            </button>

            <button
              onClick={() => onNewDocument("sheets", "Monthly Budget")}
              className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
            >
              <div className="h-20 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center mb-2 border border-emerald-100 dark:border-emerald-900/30">
                <Table className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Monthly Budget</p>
              <p className="text-[10px] text-slate-500">Sheets • Income & Expenses</p>
            </button>

            <button
              onClick={() => onNewDocument("sheets", "Financial Forecast")}
              className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
            >
              <div className="h-20 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center mb-2 border border-emerald-100 dark:border-emerald-900/30">
                <Table className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Financial Forecast</p>
              <p className="text-[10px] text-slate-500">Sheets • Quarterly model</p>
            </button>

            <button
              onClick={() => onNewDocument("slides", "Pitch Deck")}
              className="p-3 text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 group"
            >
              <div className="h-20 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center mb-2 border border-amber-100 dark:border-amber-900/30">
                <Presentation className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Executive Pitch Deck</p>
              <p className="text-[10px] text-slate-500">Slides • 16:9 Widescreen</p>
            </button>
          </div>
        </div>

        {/* Recent Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Documents
            </h2>

            {/* Filter & Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    selectedFilter === "all"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter("writer")}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    selectedFilter === "writer"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                      : "text-slate-500"
                  }`}
                >
                  Writer
                </button>
                <button
                  onClick={() => setSelectedFilter("sheets")}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    selectedFilter === "sheets"
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                      : "text-slate-500"
                  }`}
                >
                  Sheets
                </button>
                <button
                  onClick={() => setSelectedFilter("slides")}
                  className={`px-2.5 py-1 rounded-md font-medium ${
                    selectedFilter === "slides"
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      : "text-slate-500"
                  }`}
                >
                  Slides
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recent files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-52"
                />
              </div>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No recent documents found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Create a new document or open a file from your computer to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 font-semibold">
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Last Opened</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredFiles.map((file) => {
                    const isWriter = file.doc_type === "Writer";
                    const isSheets = file.doc_type === "Sheets";

                    return (
                      <tr
                        key={file.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        onClick={() => onOpenDocument(file)}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                          {isWriter && <FileText className="w-4 h-4 text-blue-600" />}
                          {isSheets && <Table className="w-4 h-4 text-emerald-600" />}
                          {!isWriter && !isSheets && (
                            <Presentation className="w-4 h-4 text-amber-600" />
                          )}
                          <span>{file.title}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isWriter
                                ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                                : isSheets
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {file.doc_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                          {file.path}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{file.last_opened}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(file.id);
                            }}
                            className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                              file.is_pinned
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                            }`}
                            title={file.is_pinned ? "Unpin document" : "Pin document"}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
