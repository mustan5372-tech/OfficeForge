import React from "react";
import { X, ShieldCheck } from "lucide-react";
import { SuiteSettings } from "../../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SuiteSettings;
  onSaveSettings: (settings: SuiteSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = React.useState<SuiteSettings>(settings);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="OfficeForge"
              className="w-5 h-5 object-contain"
            />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              OfficeForge Suite Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 overflow-y-auto max-h-[70vh]">
          {/* General Information */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              User Preferences
            </h3>

            <div>
              <label className="block font-semibold mb-1">Author / Organization Name</label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Autosave Frequency</label>
                <select
                  value={formData.autosaveMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, autosaveMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value={1}>Every 1 minute</option>
                  <option value={2}>Every 2 minutes</option>
                  <option value={5}>Every 5 minutes</option>
                  <option value={10}>Every 10 minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Measurement Unit</label>
                <select
                  value={formData.measurementUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      measurementUnit: e.target.value as SuiteSettings["measurementUnit"],
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="inches">Inches (in)</option>
                  <option value="points">Points (pt)</option>
                  <option value="millimeters">Millimeters (mm)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Local-First & Private</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
              OfficeForge runs completely locally on your system. Your documents are never uploaded to
              remote clouds without explicit instruction, no telemetry is gathered, and no untrusted
              macros are executed.
            </p>
          </div>

          {/* About Suite */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">OfficeForge Suite</span>
              <span className="font-mono">v0.1.0-alpha</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Core Language</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Rust (Memory Safe)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Supported Standards</span>
              <span>ECMA-376 / ISO/IEC 29500 (OOXML)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSaveSettings(formData);
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
