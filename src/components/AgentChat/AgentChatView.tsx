import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ModelItem, SkillDefinition, AppSettings } from '../../types';
import { Send, Mic, MicOff, Sparkles, Terminal, Wrench, RefreshCw, Trash2, Zap, ArrowDown, Cpu, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { generateEdgeResponse } from '../../services/geminiService';
import { localAiPipeline, ModelLoadingProgress } from '../../services/realLocalTransformer';
import { VirtualPianoView } from '../SkillsInteractive/VirtualPianoView';
import { TinyGardenView } from '../SkillsInteractive/TinyGardenView';
import { MoodTrackerView } from '../SkillsInteractive/MoodTrackerView';
import { LearnSomethingNewView } from '../SkillsInteractive/LearnSomethingNewView';
import { QrCodeView } from '../SkillsInteractive/QrCodeView';
import { TextSpinnerView } from '../SkillsInteractive/TextSpinnerView';
import { InteractiveMapView } from '../SkillsInteractive/InteractiveMapView';
import { WikipediaView } from '../SkillsInteractive/WikipediaView';
import { MoodMusicView } from '../SkillsInteractive/MoodMusicView';

interface AgentChatViewProps {
  chatHistory: ChatMessage[];
  onUpdateChatHistory: (history: ChatMessage[]) => void;
  selectedModel: ModelItem;
  skills: SkillDefinition[];
  settings: AppSettings;
}

const AVAILABLE_NEURAL_MODELS = [
  { id: 'Xenova/LaMini-Flan-T5-783M', name: 'LaMini Flan-T5 (783M)', task: 'text2text-generation', desc: 'Best for reasoning, Q&A, and coding' },
  { id: 'Xenova/distilgpt2', name: 'DistilGPT-2 (82M)', task: 'text-generation', desc: 'Ultra-fast lightweight (~82MB)' },
  { id: 'Xenova/Qwen1.5-0.5B-Chat', name: 'Qwen1.5 Chat (0.5B)', task: 'text-generation', desc: 'Conversational agent' },
];

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  chatHistory,
  onUpdateChatHistory,
  selectedModel,
  skills,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streamChunk, setStreamChunk] = useState<string>('');
  const [modelProgress, setModelProgress] = useState<ModelLoadingProgress>(localAiPipeline.lastProgress);
  const [activeNeuralModel, setActiveNeuralModel] = useState<string>('Xenova/LaMini-Flan-T5-783M');
  const [isLoadingWeights, setIsLoadingWeights] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsub = localAiPipeline.subscribe((p) => {
      setModelProgress(p);
      setIsLoadingWeights(p.status === 'downloading' || p.status === 'loading');
    });
    return unsub;
  }, []);

  const handleSwitchModel = async (modelId: string, task: string) => {
    setActiveNeuralModel(modelId);
    setIsLoadingWeights(true);
    await localAiPipeline.loadModel(modelId, task);
    setIsLoadingWeights(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamChunk]);

  // Web Speech API Voice Dictation
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedHistory = [...chatHistory, userMsg];
    onUpdateChatHistory(updatedHistory);
    setInputText('');
    setIsGenerating(true);
    setStreamChunk('');

    try {
      const result = await generateEdgeResponse(updatedHistory, {
        model: selectedModel,
        skills,
        onTokenChunk: (chunk) => setStreamChunk(chunk),
      });

      const modelMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        sender: 'model',
        text: result.text,
        timestamp: Date.now(),
        toolCalls: result.toolCalls,
        latency: result.latency,
      };

      onUpdateChatHistory([...updatedHistory, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'model',
        text: `Error during on-device execution: ${err.message}`,
        timestamp: Date.now(),
      };
      onUpdateChatHistory([...updatedHistory, errorMsg]);
    } finally {
      setIsGenerating(false);
      setStreamChunk('');
    }
  };

  const renderInteractivePayload = (toolCall: any) => {
    const type = toolCall.interactiveType;
    const payload = toolCall.result?.payload || toolCall.parameters;

    switch (type) {
      case 'virtual-piano':
        return <VirtualPianoView payload={payload} />;
      case 'tiny-garden':
        return <TinyGardenView payload={payload} />;
      case 'mood-tracker':
        return <MoodTrackerView payload={payload} />;
      case 'learn-something-new':
        return <LearnSomethingNewView payload={payload} />;
      case 'qr-code':
        return <QrCodeView payload={payload} />;
      case 'text-spinner':
        return <TextSpinnerView payload={payload} />;
      case 'interactive-map':
        return <InteractiveMapView payload={payload} />;
      case 'wikipedia':
        return <WikipediaView payload={payload} />;
      case 'mood-music':
        return <MoodMusicView payload={payload} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Real In-Browser Neural Engine Control Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">Real Local Neural Engine (ONNX/WASM)</span>
                {modelProgress.status === 'ready' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active in Memory
                  </span>
                ) : isLoadingWeights ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" /> {modelProgress.message || 'Loading Weights...'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                    Standby
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                {modelProgress.message || '100% on-device forward-pass execution running on client hardware'}
              </p>
            </div>
          </div>

          {/* Model Switcher / Preload Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {AVAILABLE_NEURAL_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSwitchModel(m.id, m.task)}
                disabled={isLoadingWeights}
                className={`text-xs px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeNeuralModel === m.id
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title={m.desc}
              >
                {activeNeuralModel === m.id && isLoadingWeights ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 opacity-70" />
                )}
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Weight Download Progress Bar */}
        {isLoadingWeights && (
          <div className="max-w-4xl mx-auto mt-2">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{modelProgress.file || 'Downloading ONNX Model Weights & Tensors'}</span>
              <span>{modelProgress.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${Math.max(5, modelProgress.progress)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl w-full mx-auto">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Real On-Device AI Gallery Ready</h3>
              <p className="text-xs text-slate-400 max-w-md">
                Type a prompt to run real local neural forward passes. You can also trigger interactive on-device skills like Virtual Piano, Tiny Garden, or TIL flashcards.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left pt-2">
              <button
                onClick={() => handleSendMessage('play piano')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>🎹 Play Virtual Piano</span>
                <span className="text-[10px] text-indigo-400 font-mono">Skill</span>
              </button>
              <button
                onClick={() => handleSendMessage('plant a sunflower in the garden')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>🌱 Plant Tiny Garden</span>
                <span className="text-[10px] text-emerald-400 font-mono">Skill</span>
              </button>
              <button
                onClick={() => handleSendMessage('What are on-device neural accelerators and quantization?')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>⚡ Explain On-Device AI</span>
                <span className="text-[10px] text-amber-400 font-mono">Neural</span>
              </button>
              <button
                onClick={() => handleSendMessage('Write a quicksort algorithm in TypeScript')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>💻 Generate Code Solution</span>
                <span className="text-[10px] text-sky-400 font-mono">Code</span>
              </button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                {/* Tool Invocations */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-3">
                    {msg.toolCalls.map((tool, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px]">
                          <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Tool Called: {tool.skillName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {tool.durationMs}ms
                          </span>
                        </div>
                        {renderInteractivePayload(tool)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* On-Device Latency Badge */}
                {msg.latency && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Zap className="w-3 h-3" />
                      TTFT: {msg.latency.ttftMs}ms
                    </span>
                    <span>Speed: {msg.latency.decodeSpeedTokPerSec} tok/s</span>
                    <span>Total: {msg.latency.totalMs}ms</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Live Streaming Indicator */}
        {isGenerating && streamChunk && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl p-4 text-xs bg-slate-900 border border-slate-800 text-slate-200 shadow-md space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-mono animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Decoding on local hardware...</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{streamChunk}</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice dictation'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type prompt or command (e.g. 'play piano', 'plant sunflower', 'explain edge AI')..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            disabled={isGenerating}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
