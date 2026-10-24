import React, { useState, useRef } from "react";
import {
  Square,
  Circle,
  Type,
  Play,
  Copy,
  Trash2,
  Plus,
  Star,
  X,
} from "lucide-react";
import { PresentationModel, SlideModel, SlideObject, ShapeKind } from "../../types";

interface SlidesWorkspaceProps {
  presentation: PresentationModel;
  onChange: (pres: PresentationModel) => void;
  zoom: number;
}

export const SlidesWorkspace: React.FC<SlidesWorkspaceProps> = ({
  presentation,
  onChange,
  zoom,
}) => {
  const currentSlide = presentation.slides[presentation.activeSlideIndex] || presentation.slides[0];
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentingSlideIndex, setPresentingSlideIndex] = useState(0);

  // Dragging state
  const [draggingObjId, setDraggingObjId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedObject = currentSlide?.objects.find((o) => o.id === selectedObjectId);

  const updateCurrentSlide = (updater: (slide: SlideModel) => SlideModel) => {
    const updatedSlides = presentation.slides.map((s, idx) =>
      idx === presentation.activeSlideIndex ? updater(s) : s
    );
    onChange({ ...presentation, slides: updatedSlides });
  };

  const updateSelectedObject = (updater: (obj: SlideObject) => SlideObject) => {
    if (!selectedObjectId) return;
    updateCurrentSlide((slide) => ({
      ...slide,
      objects: slide.objects.map((o) => (o.id === selectedObjectId ? updater(o) : o)),
    }));
  };

  const addSlide = () => {
    const newSlide: SlideModel = {
      id: "slide-" + Date.now(),
      title: `Slide ${presentation.slides.length + 1}`,
      bgColor: "#ffffff",
      objects: [
        {
          id: "obj-" + Date.now() + "-title",
          kind: "textbox",
          x: 10,
          y: 15,
          width: 80,
          height: 15,
          text: "Double click to edit title",
          fontSize: 28,
          bold: true,
          align: "center",
          textColor: "#0f172a",
        },
        {
          id: "obj-" + Date.now() + "-sub",
          kind: "textbox",
          x: 15,
          y: 35,
          width: 70,
          height: 12,
          text: "Add subtitle or description here",
          fontSize: 16,
          align: "center",
          textColor: "#64748b",
        },
      ],
    };
    onChange({
      ...presentation,
      slides: [...presentation.slides, newSlide],
      activeSlideIndex: presentation.slides.length,
    });
  };

  const duplicateSlide = () => {
    const clone: SlideModel = {
      ...currentSlide,
      id: "slide-" + Date.now(),
      title: `${currentSlide.title} (Copy)`,
      objects: currentSlide.objects.map((o) => ({ ...o, id: "obj-" + Math.random() })),
    };
    const updated = [...presentation.slides];
    updated.splice(presentation.activeSlideIndex + 1, 0, clone);
    onChange({
      ...presentation,
      slides: updated,
      activeSlideIndex: presentation.activeSlideIndex + 1,
    });
  };

  const deleteSlide = () => {
    if (presentation.slides.length <= 1) return;
    const updated = presentation.slides.filter((_, idx) => idx !== presentation.activeSlideIndex);
    onChange({
      ...presentation,
      slides: updated,
      activeSlideIndex: Math.max(0, presentation.activeSlideIndex - 1),
    });
  };

  const addObject = (kind: ShapeKind) => {
    const newObj: SlideObject = {
      id: "obj-" + Date.now(),
      kind,
      x: 30,
      y: 30,
      width: kind === "textbox" ? 40 : 25,
      height: kind === "textbox" ? 15 : 25,
      fillColor: kind === "textbox" ? "transparent" : "#3b82f6",
      borderColor: kind === "textbox" ? "transparent" : "#1d4ed8",
      borderWidth: 2,
      text: kind === "textbox" ? "Click to edit text" : "",
      fontSize: 16,
      textColor: "#0f172a",
      align: "center",
    };
    updateCurrentSlide((slide) => ({
      ...slide,
      objects: [...slide.objects, newObj],
    }));
    setSelectedObjectId(newObj.id);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedObjectId(null);
    }
  };

  // Object drag start
  const handleObjectMouseDown = (e: React.MouseEvent, objId: string) => {
    e.stopPropagation();
    setSelectedObjectId(objId);
    setDraggingObjId(objId);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  // Object drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingObjId || !dragStartPos || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartPos.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartPos.y) / rect.height) * 100;

    updateSelectedObject((o) => ({
      ...o,
      x: Math.max(0, Math.min(100 - o.width, o.x + deltaX)),
      y: Math.max(0, Math.min(100 - o.height, o.y + deltaY)),
    }));

    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDraggingObjId(null);
    setDragStartPos(null);
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Slides Ribbon Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs z-10 text-xs">
        <div className="h-12 px-4 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-3">
            {/* Slide Actions */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
              <button
                onClick={addSlide}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold hover:bg-amber-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Slide</span>
              </button>
              <button
                onClick={duplicateSlide}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Duplicate Slide"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={deleteSlide}
                disabled={presentation.slides.length <= 1}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40"
                title="Delete Slide"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Shape Insertion */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3">
              <button
                onClick={() => addObject("textbox")}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Add Text Box"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => addObject("rectangle")}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Add Rectangle"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => addObject("ellipse")}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Add Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => addObject("star")}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Add Star"
              >
                <Star className="w-4 h-4" />
              </button>
            </div>

            {/* Formatting (when object is selected) */}
            {selectedObject && (
              <div className="flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-3">
                {selectedObject.kind !== "textbox" && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Fill:</span>
                    <input
                      type="color"
                      value={selectedObject.fillColor || "#3b82f6"}
                      onChange={(e) => updateSelectedObject((o) => ({ ...o, fillColor: e.target.value }))}
                      className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Border:</span>
                  <input
                    type="color"
                    value={selectedObject.borderColor || "#1d4ed8"}
                    onChange={(e) => updateSelectedObject((o) => ({ ...o, borderColor: e.target.value }))}
                    className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Presentation Mode Trigger */}
          <button
            onClick={() => {
              setPresentingSlideIndex(presentation.activeSlideIndex);
              setIsPresenting(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Present</span>
          </button>
        </div>
      </div>

      {/* Workspace Body: Left Thumbnails + Center Slide Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Slide Thumbnail Sidebar */}
        <div className="w-52 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Slides ({presentation.slides.length})
          </p>

          {presentation.slides.map((slide, idx) => {
            const isActive = idx === presentation.activeSlideIndex;
            return (
              <div
                key={slide.id}
                onClick={() => onChange({ ...presentation, activeSlideIndex: idx })}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span className="text-[11px] font-mono text-slate-400 w-4 text-right">
                  {idx + 1}
                </span>

                <div
                  className={`flex-1 aspect-video rounded-md border-2 p-1 relative transition-all overflow-hidden ${
                    isActive
                      ? "border-amber-500 shadow-sm ring-1 ring-amber-400/50"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-950"
                  }`}
                  style={{ backgroundColor: slide.bgColor }}
                >
                  {/* Miniature objects */}
                  {slide.objects.map((obj) => (
                    <div
                      key={obj.id}
                      style={{
                        position: "absolute",
                        left: `${obj.x}%`,
                        top: `${obj.y}%`,
                        width: `${obj.width}%`,
                        height: `${obj.height}%`,
                        backgroundColor: obj.fillColor || "#cbd5e1",
                      }}
                      className="rounded-xs pointer-events-none opacity-80"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Canvas */}
        <div
          className="flex-1 overflow-auto p-12 flex items-center justify-center bg-slate-200 dark:bg-slate-950/70"
          onMouseDown={handleCanvasMouseDown}
        >
          <div
            ref={canvasRef}
            style={{
              width: "800px",
              height: "450px", // 16:9 aspect ratio
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
              backgroundColor: currentSlide?.bgColor || "#ffffff",
            }}
            className="relative shadow-2xl rounded-sm border border-slate-300 dark:border-slate-700 transition-transform overflow-hidden"
          >
            {/* Render Slide Objects */}
            {currentSlide?.objects.map((obj) => {
              const isSelected = selectedObjectId === obj.id;

              return (
                <div
                  key={obj.id}
                  onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
                  style={{
                    position: "absolute",
                    left: `${obj.x}%`,
                    top: `${obj.y}%`,
                    width: `${obj.width}%`,
                    height: `${obj.height}%`,
                    backgroundColor: obj.fillColor,
                    borderColor: obj.borderColor,
                    borderWidth: obj.borderWidth ? `${obj.borderWidth}px` : undefined,
                    borderStyle: obj.borderColor ? "solid" : "none",
                    borderRadius: obj.kind === "ellipse" ? "50%" : obj.kind === "rounded-rect" ? "12px" : undefined,
                  }}
                  className={`cursor-move flex items-center justify-center p-2 text-center select-none ${
                    isSelected ? "ring-2 ring-amber-500 z-30" : "hover:ring-1 hover:ring-amber-300/60"
                  }`}
                >
                  {obj.kind === "textbox" || obj.text ? (
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newText = e.currentTarget.textContent || "";
                        updateSelectedObject((o) => ({ ...o, text: newText }));
                      }}
                      style={{
                        fontSize: obj.fontSize ? `${obj.fontSize}px` : "14px",
                        fontWeight: obj.bold ? "bold" : "normal",
                        fontStyle: obj.italic ? "italic" : "normal",
                        color: obj.textColor || "#0f172a",
                      }}
                      className="outline-none w-full h-full cursor-text"
                    >
                      {obj.text}
                    </p>
                  ) : null}

                  {/* Selection resize handles */}
                  {isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-500 border border-white rounded-xs" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 border border-white rounded-xs" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-500 border border-white rounded-xs" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-500 border border-white rounded-xs" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Presentation Mode Modal */}
      {isPresenting && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none">
          {/* Close presentation button */}
          <button
            onClick={() => setIsPresenting(false)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white bg-white/10 rounded-full"
            title="Exit Presentation (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Slide Stage */}
          <div
            style={{
              width: "1024px",
              height: "576px",
              backgroundColor: presentation.slides[presentingSlideIndex]?.bgColor || "#ffffff",
            }}
            className="relative shadow-2xl rounded overflow-hidden"
          >
            {presentation.slides[presentingSlideIndex]?.objects.map((obj) => (
              <div
                key={obj.id}
                style={{
                  position: "absolute",
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${obj.width}%`,
                  height: `${obj.height}%`,
                  backgroundColor: obj.fillColor,
                  borderColor: obj.borderColor,
                  borderWidth: obj.borderWidth ? `${obj.borderWidth}px` : undefined,
                  borderStyle: obj.borderColor ? "solid" : "none",
                  borderRadius: obj.kind === "ellipse" ? "50%" : obj.kind === "rounded-rect" ? "12px" : undefined,
                }}
                className="flex items-center justify-center p-2"
              >
                {obj.text && (
                  <p
                    style={{
                      fontSize: obj.fontSize ? `${obj.fontSize * 1.3}px` : "18px",
                      fontWeight: obj.bold ? "bold" : "normal",
                      color: obj.textColor || "#0f172a",
                    }}
                  >
                    {obj.text}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-6 flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-white/20 text-white text-xs">
            <button
              onClick={() => setPresentingSlideIndex(Math.max(0, presentingSlideIndex - 1))}
              disabled={presentingSlideIndex === 0}
              className="px-2 py-1 hover:bg-white/20 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Slide {presentingSlideIndex + 1} of {presentation.slides.length}
            </span>
            <button
              onClick={() =>
                setPresentingSlideIndex(
                  Math.min(presentation.slides.length - 1, presentingSlideIndex + 1)
                )
              }
              disabled={presentingSlideIndex === presentation.slides.length - 1}
              className="px-2 py-1 hover:bg-white/20 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
