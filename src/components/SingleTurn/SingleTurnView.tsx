import React, { useState } from 'react';
import { ModelItem, AppSettings } from '../../types';
import { PROMPT_TEMPLATES, PromptTemplate } from '../../data/promptTemplates';
import { Play, Sparkles, Sliders, RefreshCw, Copy, Check, Wand2, Terminal, Zap, BookOpen } from 'lucide-react';
import { generateEdgeResponse } from '../../services/geminiService';

interface SingleTurnViewProps {
  selectedModel: ModelItem;
  settings: AppSettings;
}

export const SingleTurnView: React.FC<SingleTurnViewProps> = ({ selectedModel, settings }) => {
  const [prompt, setPrompt] = useState<string>(
    'Explain how quantized INT4 on-device LLMs reduce memory bandwidth bottlenecks during the autoregressive token decoding phase.'
  );
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are an expert low-level compiler and AI inference performance engineer.'
  );
  const [temperature, setTemperature] = useState<number>(selectedModel.defaultConfig.temperature || 0.8);
  const [topP, setTopP] = useState<number>(selectedModel.defaultConfig.topP || 0.95);
  const [topK, setTopK] = useState<number>(selectedModel.defaultConfig.topK || 40);
  const [maxTokens, setMaxTokens] = useState<number>(selectedModel.defaultConfig.maxTokens || 2048);

  const [responseOutput, setResponseOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [latencyMetrics, setLatencyMetrics] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleApplyTemplate = (tmpl: PromptTemplate) => {
    setPrompt(tmpl.prompt);
    if (tmpl.systemPrompt) setSystemPrompt(tmpl.systemPrompt);
    if (tmpl.recommendedConfig?.temperature !== undefined)
      setTemperature(tmpl.recommendedConfig.temperature);
    if (tmpl.recommendedConfig?.topP !== undefined)
      setTopP(tmpl.recommendedConfig.topP);
    if (tmpl.recommendedConfig?.maxTokens !== undefined)
      setMaxTokens(tmpl.recommendedConfig.maxTokens);
  };

  const handleExpandPrompt = () => {
    setPrompt((prev) => `${prev}\n\n[Expanded Instruction]: Provide a clear breakdown with architectural pros/cons, memory throughput equations, and concrete actionable takeaways.`);
  };

  const handleRunInference = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setResponseOutput('');
    setLatencyMetrics(null);

    try {
      const result = await generateEdgeResponse(
        [
          {
            id: 'single-turn-prompt',
            sender: 'user',
            text: prompt,
            timestamp: Date.now(),
          },
        ],
        {
          model: selectedModel,
          systemPrompt,
          temperature,
          topP,
          maxTokens,
          apiKey: settings.geminiApiKey,
          onTokenChunk: (chunk) => setResponseOutput(chunk),
        }
      );

      setResponseOutput(result.text);
      setLatencyMetrics(result.latency);
    } catch (err: any) {
      setResponseOutput(`Inference Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Single-Turn Prompt Lab</span>
            <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs rounded-full font-mono">
              {selectedModel.name}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test prompt engineering, sampling hyperparameters, prefill latencies, and token generation speeds.
          </p>
        </div>

        {/* Template Quick Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PROMPT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleApplyTemplate(tmpl)}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors"
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Input & Configurations (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Prompt Box */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                User Prompt
              </label>
              <button
                onClick={handleExpandPrompt}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Wand2 className="w-3 h-3" />
                Expand Prompt
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="Enter your prompt here..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono resize-y"
            />

            {/* System Prompt Collapsible */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">System Instruction</label>
              <input
                type="text"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Optional system context..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Hyperparameters Sliders */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Sampling Parameters
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Temperature:</span>
                  <span className="font-mono text-slate-200">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Top-P Nucleus:</span>
                  <span className="font-mono text-slate-200">{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Top-K:</span>
                  <span className="font-mono text-slate-200">{topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Max Tokens:</span>
                  <span className="font-mono text-slate-200">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="4096"
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleRunInference}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating On-Device Tokens...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Single-Turn Inference</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Latency (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full min-h-[420px] justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Inference Response</span>
                </div>

                {responseOutput && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy Text'}
                  </button>
                )}
              </div>

              {/* Output Content Area */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 min-h-[300px] text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                {responseOutput || (
                  <span className="text-slate-600 font-sans italic">
                    Output will appear here once inference is triggered...
                  </span>
                )}
              </div>
            </div>

            {/* Latency Dashboard */}
            {latencyMetrics && (
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">TTFT</div>
                  <div className="font-bold text-indigo-400 font-mono mt-0.5">
                    {latencyMetrics.ttftMs} ms
                  </div>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">Decode Speed</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {latencyMetrics.decodeSpeedTokPerSec} tok/s
                  </div>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">Generated</div>
                  <div className="font-bold text-amber-400 font-mono mt-0.5">
                    {latencyMetrics.tokenCount} tokens
                  </div>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">Total Latency</div>
                  <div className="font-bold text-sky-400 font-mono mt-0.5">
                    {latencyMetrics.totalMs} ms
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
