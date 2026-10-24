import React from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { WorkspaceType } from "../../types";

interface OfficeForgeStatusBarProps {
  currentWorkspace: WorkspaceType;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  wordCount?: number;
  pageCount?: number;
  cellSummary?: { count: number; sum?: number; avg?: number };
  activeSlide?: number;
  totalSlides?: number;
}

export const OfficeForgeStatusBar: React.FC<OfficeForgeStatusBarProps> = ({
  currentWorkspace,
  zoom,
  onZoomChange,
  wordCount = 0,
  pageCount = 1,
  cellSummary,
  activeSlide = 1,
  totalSlides = 1,
}) => {
  return (
    <footer className="h-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 text-[11px] text-slate-600 dark:text-slate-400 select-none z-20">
      {/* Left: Workspace-specific metadata */}
      <div className="flex items-center gap-4">
        {currentWorkspace === "writer" && (
          <>
            <span>Page {pageCount} of {pageCount}</span>
            <span>{wordCount} words</span>
            <span>English (US)</span>
          </>
        )}

        {currentWorkspace === "sheets" && (
          <>
            <span>Ready</span>
            {cellSummary && cellSummary.count > 1 && (
              <>
                <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
                <span>Count: {cellSummary.count}</span>
                {cellSummary.sum !== undefined && (
                  <span>Sum: {cellSummary.sum.toLocaleString()}</span>
                )}
                {cellSummary.avg !== undefined && (
                  <span>Average: {cellSummary.avg.toFixed(2)}</span>
                )}
              </>
            )}
          </>
        )}

        {currentWorkspace === "slides" && (
          <>
            <span>Slide {activeSlide} of {totalSlides}</span>
            <span>16:9 Widescreen</span>
          </>
        )}

        {currentWorkspace === "home" && (
          <span>OfficeForge Productivity Suite v0.1.0 • Ready</span>
        )}
      </div>

      {/* Right: Zoom controls */}
      {currentWorkspace !== "home" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="hover:text-slate-900 dark:hover:text-slate-100 p-0.5 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <button
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="hover:text-slate-900 dark:hover:text-slate-100 p-0.5 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="w-8 text-right font-mono">{zoom}%</span>
        </div>
      )}
    </footer>
  );
};
