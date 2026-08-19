import React, { useState } from 'react';
import { ModelItem } from '../../types';
import { Download, Check, Sparkles, Plus, ExternalLink, HardDrive, Cpu, Zap, Search, ShieldCheck } from 'lucide-react';

interface ModelManagerViewProps {
  models: ModelItem[];
  selectedModel: ModelItem;
  onSelectModel: (model: ModelItem) => void;
  onUpdateModelStatus: (modelId: string, status: ModelItem['status']) => void;
  onAddCustomModel: (model: ModelItem) => void;
}

export const ModelManagerView: React.FC<ModelManagerViewProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onUpdateModelStatus,
  onAddCustomModel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hfUrl, setHfUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const handleDownload = (model: ModelItem) => {
    if (model.status === 'downloaded' || model.status === 'ready' || model.status === 'loaded') {
      onSelectModel(model);
      return;
    }

    setDownloadingId(model.id);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);
          onUpdateModelStatus(model.id, 'downloaded');
          return 100;
        }
        return prev + 15;
      });
    }, 200);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hfUrl.trim()) return;

    const name = customName.trim() || hfUrl.split('/').pop() || 'Custom Edge Model';
    const newModel: ModelItem = {
      id: `custom-${Date.now()}`,
      name: `${name} (Imported)`,
      modelId: hfUrl.trim(),
      modelFile: `${name.toLowerCase().replace(/\s+/g, '-')}.task`,
      description: `Custom model imported from Hugging Face: ${hfUrl}. Ready for on-device inference via MediaPipe LiteRT runtime.`,
      sizeInBytes: 2147483648,
      estimatedPeakMemoryInBytes: 3221225472,
      version: '20260101',
      defaultConfig: {
        topK: 40,
        topP: 0.95,
        temperature: 0.7,
        maxTokens: 2048,
        accelerators: 'gpu,cpu',
      },
      taskTypes: ['llm_chat', 'llm_prompt_lab', 'agent_chat', 'llm_benchmark'],
      status: 'downloaded',
      isCustom: true,
      benchmarkStats: {
        prefillTokensPerSec: 320.0,
        decodeTokensPerSec: 54.0,
        timeToFirstTokenMs: 80,
        peakMemoryMb: 2100,
      },
    };

    onAddCustomModel(newModel);
    onSelectModel(newModel);
    setIsImportModalOpen(false);
    setHfUrl('');
    setCustomName('');
  };

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'downloaded')
      return matchesSearch && (m.status === 'downloaded' || m.status === 'loaded' || m.status === 'ready');
    if (filterType === 'vision') return matchesSearch && m.llmSupportImage;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>On-Device Model Catalog</span>
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs rounded-full font-mono">
              Allowlist v1.0.19
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Download and run optimized INT4 quantized LLMs locally via Google LiteRT and MediaPipe Inference APIs with zero data egress.
          </p>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Import Hugging Face Model</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models, architectures, tags..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Models ({models.length})
          </button>
          <button
            onClick={() => setFilterType('downloaded')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'downloaded' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Downloaded ({models.filter((m) => m.status !== 'not_downloaded').length})
          </button>
          <button
            onClick={() => setFilterType('vision')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'vision' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multimodal Vision
          </button>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => {
          const isSelected = selectedModel.id === model.id;
          const isDownloaded = model.status === 'downloaded' || model.status === 'loaded' || model.status === 'ready';
          const isCurrentDownloading = downloadingId === model.id;
          const sizeGb = (model.sizeInBytes / (1024 * 1024 * 1024)).toFixed(2);
          const peakRamGb = (model.estimatedPeakMemoryInBytes / (1024 * 1024 * 1024)).toFixed(1);

          return (
            <div
              key={model.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{model.name}</h3>
                    <p className="text-[11px] font-mono text-indigo-400 mt-0.5">{model.modelId}</p>
                  </div>

                  {model.llmSupportImage && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold rounded-md flex items-center gap-1 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      Vision
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {model.description}
                </p>

                {/* Specs Chips */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Disk: <strong className="text-slate-200">{sizeGb} GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>RAM: <strong className="text-slate-200">~{peakRamGb} GB</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Decode: <strong className="text-slate-200">{model.benchmarkStats?.decodeTokensPerSec || 48} tok/s</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Context: <strong className="text-slate-200">{model.defaultConfig.maxTokens}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons / Download Progress */}
              <div className="mt-5 pt-3 border-t border-slate-800">
                {isCurrentDownloading ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Downloading weights...</span>
                      <span className="font-mono font-bold text-indigo-400">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all duration-200"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isDownloaded ? (
                      <button
                        onClick={() => onSelectModel(model)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Active Runtime</span>
                          </>
                        ) : (
                          <span>Set Active</span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(model)}
                        className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download ({sizeGb} GB)</span>
                      </button>
                    )}

                    <a
                      href={`https://huggingface.co/${model.modelId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
                      title="View on Hugging Face"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Import Custom Model</h3>
            <p className="text-xs text-slate-400">
              Provide a Hugging Face model repository or MediaPipe LiteRT `.task` weight URL to deploy on-device.
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Model Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gemma 2 2B Instruct INT8"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Hugging Face Repo / Task URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. google/gemma-2-2b-it"
                  value={hfUrl}
                  onChange={(e) => setHfUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  Import Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
