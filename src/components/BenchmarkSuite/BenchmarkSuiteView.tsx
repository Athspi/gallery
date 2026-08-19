import React, { useState } from 'react';
import { ModelItem, BenchmarkResult } from '../../types';
import { BENCHMARK_PRESETS } from '../../data/promptTemplates';
import { Play, Zap, HardDrive, Cpu, ShieldCheck, Download, RefreshCw, BarChart2, TrendingUp } from 'lucide-react';

interface BenchmarkSuiteViewProps {
  models: ModelItem[];
  selectedModel: ModelItem;
  benchmarks: BenchmarkResult[];
  onAddBenchmarkResult: (result: BenchmarkResult) => void;
}

export const BenchmarkSuiteView: React.FC<BenchmarkSuiteViewProps> = ({
  models,
  selectedModel,
  benchmarks,
  onAddBenchmarkResult,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(BENCHMARK_PRESETS[0].id);
  const [iterations, setIterations] = useState<number>(3);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);

  const activePreset = BENCHMARK_PRESETS.find((p) => p.id === selectedPreset) || BENCHMARK_PRESETS[0];

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setCurrentProgress(0);
    setLiveMetrics(null);

    const baseStats = selectedModel.benchmarkStats || {
      prefillTokensPerSec: 320,
      decodeTokensPerSec: 48,
      timeToFirstTokenMs: 80,
      peakMemoryMb: 2400,
    };

    for (let i = 1; i <= iterations; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setCurrentProgress(Math.round((i / iterations) * 100));

      // Calculate slight run-to-run variance for realistic thermal simulation
      const variance = (Math.random() - 0.5) * 0.08;
      setLiveMetrics({
        iteration: i,
        ttft: Math.round(baseStats.timeToFirstTokenMs * (1 + variance)),
        decodeSpeed: (baseStats.decodeTokensPerSec * (1 - variance)).toFixed(1),
        prefillSpeed: (baseStats.prefillTokensPerSec * (1 - variance)).toFixed(1),
        memory: Math.round(baseStats.peakMemoryMb * (1 + variance * 0.2)),
      });
    }

    const finalResult: BenchmarkResult = {
      id: `bench-${Date.now()}`,
      timestamp: Date.now(),
      modelName: selectedModel.name,
      promptTokens: 128,
      outputTokens: 256,
      ttftMs: baseStats.timeToFirstTokenMs,
      prefillTokPerSec: baseStats.prefillTokensPerSec,
      decodeTokPerSec: baseStats.decodeTokensPerSec,
      totalLatencyMs: Math.round((256 / baseStats.decodeTokensPerSec) * 1000 + baseStats.timeToFirstTokenMs),
      peakMemoryMb: baseStats.peakMemoryMb,
      steadinessScore: 94,
    };

    onAddBenchmarkResult(finalResult);
    setIsRunning(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(benchmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ai-edge-benchmarks-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>On-Device Silicon Benchmark Suite</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-mono">
              LiteRT Profiler v2
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Evaluate time-to-first-token (TTFT), prefill throughput, decode tokens/sec, and steadiness under thermal load.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Benchmark Data</span>
        </button>
      </div>

      {/* Benchmark Controls Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Target Model</label>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200">
              {selectedModel.name}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Workload Preset</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {BENCHMARK_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Passes (Iterations)</label>
            <div className="flex items-center gap-2">
              {[1, 3, 5].map((it) => (
                <button
                  key={it}
                  onClick={() => setIterations(it)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    iterations === it
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {it} Runs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preset Prompt preview */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 font-mono">
          <span className="text-indigo-400 font-bold">Prompt: </span>
          {activePreset.prompt}
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Profiling Hardware Silicon ({currentProgress}%)...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Automated Benchmark</span>
            </>
          )}
        </button>

        {/* Live Metrics During Execution */}
        {liveMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-medium">TTFT Latency</div>
              <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">
                {liveMetrics.ttft} ms
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-medium">Decode Throughput</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {liveMetrics.decodeSpeed} tok/s
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-medium">Prefill Speed</div>
              <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                {liveMetrics.prefillSpeed} tok/s
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-medium">Memory Allocation</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {liveMetrics.memory} MB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Catalog Comparative Chart */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span>Model Architecture Throughput Comparison (Decode Tokens/Sec)</span>
        </h3>

        <div className="space-y-3 pt-2">
          {models.map((m) => {
            const decodeTok = m.benchmarkStats?.decodeTokensPerSec || 40;
            const maxTok = 80;
            const widthPct = Math.min(100, Math.round((decodeTok / maxTok) * 100));

            return (
              <div key={m.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{m.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{decodeTok} tok/s</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
