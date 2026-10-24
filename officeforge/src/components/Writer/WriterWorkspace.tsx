import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Table as TableIcon,
  Minus,
} from "lucide-react";
import { WriterDocumentModel } from "../../types";

interface WriterWorkspaceProps {
  document: WriterDocumentModel;
  onChange: (doc: WriterDocumentModel) => void;
  zoom: number;
}

export const WriterWorkspace: React.FC<WriterWorkspaceProps> = ({
  document,
  onChange,
  zoom,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "insert" | "layout">("home");
  const [selectedParagraphId, setSelectedParagraphId] = useState<string>(
    document.paragraphs[0]?.id || ""
  );
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [fontSize, setFontSize] = useState(11);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textColor, setTextColor] = useState("#0f172a");
  const [highlightColor, setHighlightColor] = useState("");

  const pageRef = useRef<HTMLDivElement>(null);

  // Apply formatting to selected paragraph
  const updateSelectedParagraph = (
    updater: (p: typeof document.paragraphs[0]) => typeof document.paragraphs[0]
  ) => {
    const updatedParagraphs = document.paragraphs.map((p) => {
      if (p.id === selectedParagraphId) {
        return updater(p);
      }
      return p;
    });
    onChange({ ...document, paragraphs: updatedParagraphs });
  };

  const handleTextChange = (pId: string, newText: string) => {
    const updatedParagraphs = document.paragraphs.map((p) => {
      if (p.id === pId) {
        return {
          ...p,
          runs: [
            {
              id: p.runs[0]?.id || "run-1",
              text: newText,
              bold: isBold,
              italic: isItalic,
              underline: isUnderline,
              strikethrough: isStrikethrough,
              fontFamily,
              fontSize,
              color: textColor,
              highlight: highlightColor,
            },
          ],
        };
      }
      return p;
    });
    onChange({ ...document, paragraphs: updatedParagraphs });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Insert new paragraph below
      const newParagraph = {
        id: "p-" + Date.now(),
        runs: [{ id: "r-" + Date.now(), text: "" }],
        alignment: document.paragraphs[index]?.alignment || "left",
        style: document.paragraphs[index]?.style || "normal",
      };
      const updated = [...document.paragraphs];
      updated.splice(index + 1, 0, newParagraph);
      onChange({ ...document, paragraphs: updated });
      setSelectedParagraphId(newParagraph.id);
    } else if (e.key === "Backspace" && e.currentTarget.textContent === "" && document.paragraphs.length > 1) {
      e.preventDefault();
      const updated = document.paragraphs.filter((_, i) => i !== index);
      onChange({ ...document, paragraphs: updated });
      setSelectedParagraphId(document.paragraphs[Math.max(0, index - 1)].id);
    }
  };

  const toggleStyle = (style: "bold" | "italic" | "underline" | "strikethrough") => {
    if (style === "bold") setIsBold(!isBold);
    if (style === "italic") setIsItalic(!isItalic);
    if (style === "underline") setIsUnderline(!isUnderline);
    if (style === "strikethrough") setIsStrikethrough(!isStrikethrough);

    updateSelectedParagraph((p) => ({
      ...p,
      runs: p.runs.map((r) => ({
        ...r,
        bold: style === "bold" ? !isBold : r.bold,
        italic: style === "italic" ? !isItalic : r.italic,
        underline: style === "underline" ? !isUnderline : r.underline,
        strikethrough: style === "strikethrough" ? !isStrikethrough : r.strikethrough,
      })),
    }));
  };

  const setAlignment = (alignment: "left" | "center" | "right" | "justify") => {
    updateSelectedParagraph((p) => ({ ...p, alignment }));
  };

  const setHeadingStyle = (style: "normal" | "h1" | "h2" | "h3" | "quote" | "bullet" | "number") => {
    updateSelectedParagraph((p) => ({ ...p, style }));
  };

  const insertTable = () => {
    const newTable = {
      id: "table-" + Date.now(),
      rows: 3,
      cols: 3,
      data: [
        ["Header 1", "Header 2", "Header 3"],
        ["Data 1", "Data 2", "Data 3"],
        ["Data 4", "Data 5", "Data 6"],
      ],
    };
    onChange({ ...document, tables: [...document.tables, newTable] });
  };

  const insertHorizontalLine = () => {
    const p = {
      id: "hr-" + Date.now(),
      runs: [{ id: "r-" + Date.now(), text: "—".repeat(40) }],
      alignment: "center" as const,
      style: "normal" as const,
    };
    onChange({ ...document, paragraphs: [...document.paragraphs, p] });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Ribbon Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10">
        {/* Ribbon Tab Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
              activeTab === "home"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("insert")}
            className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
              activeTab === "insert"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab("layout")}
            className={`px-3 py-1.5 border-b-2 font-semibold transition-colors ${
              activeTab === "layout"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Layout
          </button>
        </div>

        {/* Ribbon Controls Container */}
        <div className="h-14 px-4 flex items-center gap-4 overflow-x-auto text-xs">
          {activeTab === "home" && (
            <>
              {/* Undo / Redo */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
                <button
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>

              {/* Typography Group */}
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Calibri, sans-serif">Calibri</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>

                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 w-14"
                >
                  <option value={9}>9</option>
                  <option value={10}>10</option>
                  <option value={11}>11</option>
                  <option value={12}>12</option>
                  <option value={14}>14</option>
                  <option value={16}>16</option>
                  <option value={18}>18</option>
                  <option value={24}>24</option>
                  <option value={32}>32</option>
                </select>

                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={() => toggleStyle("bold")}
                    className={`p-1.5 rounded font-bold ${
                      isBold
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStyle("italic")}
                    className={`p-1.5 rounded italic ${
                      isItalic
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStyle("underline")}
                    className={`p-1.5 rounded underline ${
                      isUnderline
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStyle("strikethrough")}
                    className={`p-1.5 rounded line-through ${
                      isStrikethrough
                        ? "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 ml-1.5 border-l border-slate-200 dark:border-slate-800 pl-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        updateSelectedParagraph((p) => ({
                          ...p,
                          runs: p.runs.map((r) => ({ ...r, color: e.target.value })),
                        }));
                      }}
                      className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Font Color"
                    />
                    <input
                      type="color"
                      value={highlightColor || "#ffffaa"}
                      onChange={(e) => {
                        setHighlightColor(e.target.value);
                        updateSelectedParagraph((p) => ({
                          ...p,
                          runs: p.runs.map((r) => ({ ...r, highlight: e.target.value })),
                        }));
                      }}
                      className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                      title="Text Highlight Color"
                    />
                  </div>
                </div>
              </div>

              {/* Paragraph Formatting */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
                <button
                  onClick={() => setAlignment("left")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlignment("center")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlignment("right")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlignment("justify")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Justify"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHeadingStyle("bullet")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHeadingStyle("number")}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Styles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHeadingStyle("normal")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-medium"
                >
                  Normal
                </button>
                <button
                  onClick={() => setHeadingStyle("h1")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold"
                >
                  Heading 1
                </button>
                <button
                  onClick={() => setHeadingStyle("h2")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs font-semibold"
                >
                  Heading 2
                </button>
                <button
                  onClick={() => setHeadingStyle("quote")}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 text-xs italic"
                >
                  Quote
                </button>
              </div>
            </>
          )}

          {activeTab === "insert" && (
            <div className="flex items-center gap-3">
              <button
                onClick={insertTable}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-800 dark:text-slate-200"
              >
                <TableIcon className="w-4 h-4 text-blue-600" />
                <span>Table (3x3)</span>
              </button>
              <button
                onClick={insertHorizontalLine}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 text-slate-800 dark:text-slate-200"
              >
                <Minus className="w-4 h-4" />
                <span>Horizontal Divider</span>
              </button>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Margins:</span>
                <button
                  onClick={() =>
                    onChange({
                      ...document,
                      pageSettings: {
                        ...document.pageSettings,
                        margins: { top: 1, right: 1, bottom: 1, left: 1 },
                      },
                    })
                  }
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200"
                >
                  Normal (1")
                </button>
                <button
                  onClick={() =>
                    onChange({
                      ...document,
                      pageSettings: {
                        ...document.pageSettings,
                        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
                      },
                    })
                  }
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-medium hover:bg-slate-200"
                >
                  Narrow (0.5")
                </button>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-slate-500">Orientation:</span>
                <button
                  onClick={() =>
                    onChange({
                      ...document,
                      pageSettings: {
                        ...document.pageSettings,
                        orientation: "portrait",
                      },
                    })
                  }
                  className={`px-2 py-1 rounded font-medium ${
                    document.pageSettings.orientation === "portrait"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                  }`}
                >
                  Portrait
                </button>
                <button
                  onClick={() =>
                    onChange({
                      ...document,
                      pageSettings: {
                        ...document.pageSettings,
                        orientation: "landscape",
                      },
                    })
                  }
                  className={`px-2 py-1 rounded font-medium ${
                    document.pageSettings.orientation === "landscape"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Editing Canvas Area */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
        <div
          ref={pageRef}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            width: document.pageSettings.orientation === "portrait" ? "8.5in" : "11in",
            minHeight: document.pageSettings.orientation === "portrait" ? "11in" : "8.5in",
            paddingTop: `${document.pageSettings.margins.top}in`,
            paddingRight: `${document.pageSettings.margins.right}in`,
            paddingBottom: `${document.pageSettings.margins.bottom}in`,
            paddingLeft: `${document.pageSettings.margins.left}in`,
          }}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl rounded-sm transition-transform duration-75 text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          {/* Paragraphs */}
          <div className="space-y-3">
            {document.paragraphs.map((p, idx) => {
              const combinedText = p.runs.map((r) => r.text).join("");
              const firstRun = p.runs[0] || {};

              let styleClasses = "text-sm leading-relaxed";
              if (p.style === "h1") styleClasses = "text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100";
              if (p.style === "h2") styleClasses = "text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-200";
              if (p.style === "h3") styleClasses = "text-base font-semibold text-slate-800 dark:text-slate-200";
              if (p.style === "quote") styleClasses = "text-sm italic pl-4 border-l-2 border-blue-500 text-slate-600 dark:text-slate-400";
              if (p.style === "bullet") styleClasses = "text-sm list-disc pl-5";
              if (p.style === "number") styleClasses = "text-sm list-decimal pl-5";

              let alignStyle: React.CSSProperties["textAlign"] = p.alignment;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedParagraphId(p.id)}
                  className={`relative group rounded px-1 transition-all ${
                    selectedParagraphId === p.id
                      ? "ring-1 ring-blue-400/40 bg-blue-50/20 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleTextChange(p.id, e.currentTarget.textContent || "")}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    style={{
                      textAlign: alignStyle,
                      fontWeight: firstRun.bold ? "bold" : undefined,
                      fontStyle: firstRun.italic ? "italic" : undefined,
                      textDecoration: [
                        firstRun.underline ? "underline" : "",
                        firstRun.strikethrough ? "line-through" : "",
                      ]
                        .filter(Boolean)
                        .join(" "),
                      fontFamily: firstRun.fontFamily,
                      fontSize: firstRun.fontSize ? `${firstRun.fontSize}pt` : undefined,
                      color: firstRun.color,
                      backgroundColor: firstRun.highlight,
                    }}
                    className={`${styleClasses} outline-none cursor-text min-h-[1.5em]`}
                  >
                    {combinedText}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tables */}
          {document.tables.length > 0 && (
            <div className="mt-6 space-y-4">
              {document.tables.map((table) => (
                <div key={table.id} className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-xs">
                    <tbody>
                      {table.data.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? "bg-slate-100 dark:bg-slate-800 font-bold" : ""}>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const val = e.currentTarget.textContent || "";
                                const updatedTables = document.tables.map((t) => {
                                  if (t.id === table.id) {
                                    const newData = t.data.map((r, ri) =>
                                      ri === rIdx
                                        ? r.map((c, ci) => (ci === cIdx ? val : c))
                                        : r
                                    );
                                    return { ...t, data: newData };
                                  }
                                  return t;
                                });
                                onChange({ ...document, tables: updatedTables });
                              }}
                              className="border border-slate-300 dark:border-slate-700 p-2 outline-none focus:bg-blue-50/30"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
