import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Sigma,
  Plus,
  Undo2,
  Redo2,
} from "lucide-react";
import { WorkbookModel, SheetCell, WorksheetModel, CellValueType } from "../../types";

interface SheetsWorkspaceProps {
  workbook: WorkbookModel;
  onChange: (wb: WorkbookModel) => void;
  zoom: number;
}

// Convert column index (0-based) to Excel letters ("A", "B", ... "Z", "AA")
function colIndexToLetters(idx: number): string {
  let temp = idx;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// Parse cell coordinate "B4" into col 1, row 3
function parseCoord(coord: string): { col: number; row: number } | null {
  const match = coord.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  const letters = match[1];
  const rowNum = parseInt(match[2], 10) - 1;

  let colNum = 0;
  for (let i = 0; i < letters.length; i++) {
    colNum = colNum * 26 + (letters.charCodeAt(i) - 64);
  }
  return { col: colNum - 1, row: rowNum };
}

// Simple client-side evaluator matching the Rust formula engine
function evaluateFormula(
  formula: string,
  cells: Record<string, SheetCell>
): string {
  if (!formula.startsWith("=")) {
    return formula;
  }

  const expr = formula.substring(1).trim();

  // Handle SUM(A1:A5)
  const sumMatch = expr.match(/^SUM\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/i);
  if (sumMatch) {
    const start = parseCoord(sumMatch[1].toUpperCase());
    const end = parseCoord(sumMatch[2].toUpperCase());
    if (start && end) {
      let total = 0;
      for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
        for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
          const key = `${colIndexToLetters(c)}${r + 1}`;
          const val = parseFloat(cells[key]?.computed || cells[key]?.raw || "0");
          if (!isNaN(val)) total += val;
        }
      }
      return total.toString();
    }
  }

  // Handle AVERAGE(A1:A5)
  const avgMatch = expr.match(/^AVERAGE\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/i);
  if (avgMatch) {
    const start = parseCoord(avgMatch[1].toUpperCase());
    const end = parseCoord(avgMatch[2].toUpperCase());
    if (start && end) {
      let total = 0;
      let count = 0;
      for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
        for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
          const key = `${colIndexToLetters(c)}${r + 1}`;
          const val = parseFloat(cells[key]?.computed || cells[key]?.raw || "0");
          if (!isNaN(val)) {
            total += val;
            count++;
          }
        }
      }
      return count > 0 ? (total / count).toFixed(2) : "0";
    }
  }

  // Handle COUNT(A1:A5)
  const countMatch = expr.match(/^COUNT\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/i);
  if (countMatch) {
    const start = parseCoord(countMatch[1].toUpperCase());
    const end = parseCoord(countMatch[2].toUpperCase());
    if (start && end) {
      let count = 0;
      for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
        for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
          const key = `${colIndexToLetters(c)}${r + 1}`;
          const cell = cells[key];
          if (cell && cell.raw.trim() !== "") count++;
        }
      }
      return count.toString();
    }
  }

  // Handle basic arithmetic with cell references (e.g. A1 + B1 or A1 * 1.1)
  try {
    const replaced = expr.replace(/[A-Z]+[0-9]+/g, (ref) => {
      const c = cells[ref.toUpperCase()];
      const val = parseFloat(c?.computed || c?.raw || "0");
      return isNaN(val) ? "0" : val.toString();
    });
    // Sanitize to only math symbols and numbers
    if (/^[0-9+\-*/().\s^%]+$/.test(replaced)) {
      // Safe math evaluation
      const result = Function(`"use strict"; return (${replaced})`)();
      return typeof result === "number" ? result.toString() : "#VALUE!";
    }
  } catch (e) {
    return "#ERROR!";
  }

  return formula;
}

export const SheetsWorkspace: React.FC<SheetsWorkspaceProps> = ({
  workbook,
  onChange,
  zoom,
}) => {
  const currentSheet = workbook.sheets[workbook.activeSheetIndex] || workbook.sheets[0];
  const [activeCellCoord, setActiveCellCoord] = useState("A1");
  const [editingFormula, setEditingFormula] = useState("");
  const [isEditingInCell, setIsEditingInCell] = useState(false);

  // Sync active cell raw text into the formula bar
  useEffect(() => {
    const cell = currentSheet.cells[activeCellCoord];
    setEditingFormula(cell ? cell.raw : "");
  }, [activeCellCoord, currentSheet]);

  const ROWS = currentSheet.rowCount || 30;
  const COLS = currentSheet.colCount || 15;

  const updateCell = (coord: string, rawVal: string) => {
    const computedVal = evaluateFormula(rawVal, currentSheet.cells);
    const cellType: CellValueType = rawVal.startsWith("=")
      ? "formula"
      : isNaN(Number(rawVal))
      ? "string"
      : "number";

    const updatedCells: Record<string, SheetCell> = {
      ...currentSheet.cells,
      [coord]: {
        ...(currentSheet.cells[coord] || { raw: "", computed: "", type: "string" }),
        raw: rawVal,
        computed: computedVal,
        type: cellType,
      },
    };

    // Recompute all dependent formulas
    Object.keys(updatedCells).forEach((k) => {
      if (updatedCells[k].raw.startsWith("=")) {
        updatedCells[k].computed = evaluateFormula(updatedCells[k].raw, updatedCells);
      }
    });

    const updatedSheets = workbook.sheets.map((s, idx) =>
      idx === workbook.activeSheetIndex ? { ...s, cells: updatedCells } : s
    );

    onChange({ ...workbook, sheets: updatedSheets });
  };

  const handleFormulaBarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateCell(activeCellCoord, editingFormula);
      // Move down one cell
      const parsed = parseCoord(activeCellCoord);
      if (parsed) {
        setActiveCellCoord(`${colIndexToLetters(parsed.col)}${parsed.row + 2}`);
      }
    }
  };

  const applyFormatting = (format: { bold?: boolean; italic?: boolean; align?: "left" | "center" | "right"; format?: "currency" | "percent" | "general" }) => {
    const current = currentSheet.cells[activeCellCoord] || { raw: "", computed: "", type: "string" };
    const updated = {
      ...current,
      ...format,
    };
    const updatedCells = {
      ...currentSheet.cells,
      [activeCellCoord]: updated,
    };
    const updatedSheets = workbook.sheets.map((s, idx) =>
      idx === workbook.activeSheetIndex ? { ...s, cells: updatedCells } : s
    );
    onChange({ ...workbook, sheets: updatedSheets });
  };

  const insertAutoSum = (func: "SUM" | "AVERAGE" | "COUNT") => {
    const parsed = parseCoord(activeCellCoord);
    if (!parsed) return;
    const colLetter = colIndexToLetters(parsed.col);
    const aboveRow = parsed.row;
    if (aboveRow > 0) {
      const formula = `=${func}(${colLetter}1:${colLetter}${aboveRow})`;
      setEditingFormula(formula);
      updateCell(activeCellCoord, formula);
    }
  };

  const addSheet = () => {
    const newSheet: WorksheetModel = {
      id: "sheet-" + Date.now(),
      name: `Sheet${workbook.sheets.length + 1}`,
      cells: {},
      rowCount: 30,
      colCount: 15,
    };
    onChange({
      ...workbook,
      sheets: [...workbook.sheets, newSheet],
      activeSheetIndex: workbook.sheets.length,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden select-none">
      {/* Sheets Ribbon Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10 text-xs">
        <div className="h-12 px-4 flex items-center gap-3 overflow-x-auto">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
            <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Font & Styles */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
            <button
              onClick={() => {
                const isB = currentSheet.cells[activeCellCoord]?.bold;
                applyFormatting({ bold: !isB });
              }}
              className={`p-1.5 rounded ${
                currentSheet.cells[activeCellCoord]?.bold
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const isI = currentSheet.cells[activeCellCoord]?.italic;
                applyFormatting({ italic: !isI });
              }}
              className={`p-1.5 rounded ${
                currentSheet.cells[activeCellCoord]?.italic
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 italic"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
            <button
              onClick={() => applyFormatting({ align: "left" })}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormatting({ align: "center" })}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormatting({ align: "right" })}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Number Formats */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
            <button
              onClick={() => applyFormatting({ format: "currency" })}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold"
              title="Format as Currency ($)"
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={() => applyFormatting({ format: "percent" })}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold"
              title="Format as Percentage (%)"
            >
              <Percent className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* Quick Functions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => insertAutoSum("SUM")}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold hover:bg-emerald-100"
              title="AutoSum"
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>AutoSum</span>
            </button>
            <button
              onClick={() => insertAutoSum("AVERAGE")}
              className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              Average
            </button>
          </div>
        </div>

        {/* Formula Bar & Name Box */}
        <div className="h-9 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
          {/* Name Box */}
          <div className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center font-mono font-bold text-slate-700 dark:text-slate-200 text-xs">
            {activeCellCoord}
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Function icon */}
          <span className="font-serif italic font-bold text-slate-500 text-xs select-none">
            fx
          </span>

          {/* Formula Input */}
          <input
            type="text"
            value={editingFormula}
            onChange={(e) => setEditingFormula(e.target.value)}
            onKeyDown={handleFormulaBarKeyDown}
            placeholder="Enter formula or value (e.g. =SUM(A1:A5) or =A1*B1)"
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-3 py-1 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Spreadsheet Virtualized Grid */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 p-2">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
          className="inline-block bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm"
        >
          <table className="border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold sticky top-0 z-10 shadow-xs">
                {/* Top-left corner */}
                <th className="w-10 h-7 border border-slate-300 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-800 text-center font-mono text-[10px]">
                  #
                </th>
                {Array.from({ length: COLS }).map((_, cIdx) => (
                  <th
                    key={cIdx}
                    className="w-24 h-7 border border-slate-300 dark:border-slate-700 text-center font-mono font-semibold"
                  >
                    {colIndexToLetters(cIdx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, rIdx) => {
                const rowNum = rIdx + 1;
                return (
                  <tr key={rIdx}>
                    {/* Row Header */}
                    <td className="w-10 h-6 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px] text-center font-medium select-none sticky left-0 z-10">
                      {rowNum}
                    </td>

                    {/* Data Cells */}
                    {Array.from({ length: COLS }).map((_, cIdx) => {
                      const coord = `${colIndexToLetters(cIdx)}${rowNum}`;
                      const cell = currentSheet.cells[coord];
                      const isActive = activeCellCoord === coord;

                      let displayVal = cell ? cell.computed || cell.raw : "";
                      if (cell?.format === "currency" && displayVal !== "") {
                        const num = parseFloat(displayVal);
                        if (!isNaN(num)) displayVal = `$${num.toFixed(2)}`;
                      } else if (cell?.format === "percent" && displayVal !== "") {
                        const num = parseFloat(displayVal);
                        if (!isNaN(num)) displayVal = `${(num * 100).toFixed(1)}%`;
                      }

                      return (
                        <td
                          key={cIdx}
                          onClick={() => {
                            setActiveCellCoord(coord);
                            setIsEditingInCell(false);
                          }}
                          onDoubleClick={() => setIsEditingInCell(true)}
                          className={`w-24 h-6 border border-slate-300 dark:border-slate-700 px-2 py-0.5 font-mono text-xs relative ${
                            isActive
                              ? "ring-2 ring-emerald-500 z-20 bg-emerald-50/20 dark:bg-emerald-950/30"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                          style={{
                            textAlign: cell?.align || (isNaN(Number(cell?.computed)) ? "left" : "right"),
                            fontWeight: cell?.bold ? "bold" : "normal",
                            fontStyle: cell?.italic ? "italic" : "normal",
                            textDecoration: cell?.underline ? "underline" : "none",
                            backgroundColor: cell?.bgColor,
                            color: cell?.color,
                          }}
                        >
                          {isActive && isEditingInCell ? (
                            <input
                              autoFocus
                              type="text"
                              value={editingFormula}
                              onChange={(e) => setEditingFormula(e.target.value)}
                              onBlur={() => {
                                updateCell(coord, editingFormula);
                                setIsEditingInCell(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateCell(coord, editingFormula);
                                  setIsEditingInCell(false);
                                }
                              }}
                              className="w-full h-full bg-white dark:bg-slate-900 outline-none text-slate-900 dark:text-slate-100 font-mono text-xs"
                            />
                          ) : (
                            <span className="truncate block">{displayVal}</span>
                          )}

                          {/* Active cell handle */}
                          {isActive && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-emerald-600 border border-white dark:border-slate-900 cursor-crosshair" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worksheet Tab Bar */}
      <div className="h-8 bg-slate-200 dark:bg-slate-900 border-t border-slate-300 dark:border-slate-800 flex items-center px-3 gap-1 text-xs select-none">
        {workbook.sheets.map((sheet, idx) => (
          <button
            key={sheet.id}
            onClick={() => onChange({ ...workbook, activeSheetIndex: idx })}
            className={`px-4 py-1 rounded-t-md font-medium transition-all ${
              idx === workbook.activeSheetIndex
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-t-2 border-emerald-500 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {sheet.name}
          </button>
        ))}

        <button
          onClick={addSheet}
          className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Add New Worksheet"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
