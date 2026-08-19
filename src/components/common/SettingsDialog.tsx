import React, { useState } from 'react';
import { AppSettings, ModelItem } from '../../types';
import { Settings, Shield, Volume2, Key, RefreshCw, Check } from 'lucide-react';

interface SettingsDialogProps {
  settings: AppSettings;
  models: ModelItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  settings,
  models,
  isOpen,
  onClose,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Gallery Engine Configuration</h3>
              <p className="text-xs text-slate-400">Manage on-device runtimes & Cloud Gemini acceleration</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              Optional Cloud Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy... (Leave empty for pure on-device simulated engine)"
              value={localSettings.geminiApiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              When empty, AI Edge Gallery runs in standalone local mode with high-precision LiteRT simulation.
            </p>
          </div>

          {/* Default Model */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Default Active Model</label>
            <select
              value={localSettings.defaultModelId}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultModelId: e.target.value })}
              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200">Synthesizer & Audio SFX</div>
                  <div className="text-[11px] text-slate-400">Play piano notes and botanical clicks</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.enableSoundEffects}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, enableSoundEffects: e.target.checked })
                }
                className="w-4 h-4 accent-indigo-500 rounded"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg flex items-center gap-1.5"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
