import React, { useState } from 'react';
import { AppSettings, ModelItem } from '../../types';
import { Settings, ShieldCheck, Volume2, Check, Cpu, Zap, HardDrive } from 'lucide-react';

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
              <p className="text-xs text-slate-400">100% Local On-Device Neural Execution</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm font-bold">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Local On-Device Status Banner */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-300">100% On-Device Local AI Active</div>
              <div className="text-[11px] text-slate-400">
                All inference, token generation, and interactive skills execute completely on your device hardware with zero data transmission.
              </div>
            </div>
          </div>

          {/* Default Model */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Default Active Model
            </label>
            <select
              value={localSettings.defaultModelId}
              onChange={(e) => setLocalSettings({ ...localSettings, defaultModelId: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
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
                <Volume2 className="w-4 h-4 text-indigo-400" />
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
