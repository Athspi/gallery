import React from 'react';
import { ModelItem } from '../../types';
import { Cpu, Check, HardDrive, Zap } from 'lucide-react';

interface ModelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelItem[];
  selectedModel: ModelItem;
  onSelectModel: (model: ModelItem) => void;
}

export const ModelPickerModal: React.FC<ModelPickerModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel,
  onSelectModel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Switch Active On-Device Model</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {models.map((model) => {
            const isSelected = selectedModel.id === model.id;
            const sizeGb = (model.sizeInBytes / (1024 * 1024 * 1024)).toFixed(1);

            return (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>{model.name}</span>
                    {model.llmSupportImage && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] rounded font-semibold">
                        Vision
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>{sizeGb} GB</span>
                    <span>•</span>
                    <span>{model.benchmarkStats?.decodeTokensPerSec || 48} tok/s</span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
