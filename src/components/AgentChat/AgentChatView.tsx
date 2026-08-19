import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ModelItem, SkillDefinition, AppSettings } from '../../types';
import { Send, Mic, MicOff, Sparkles, Terminal, Wrench, RefreshCw, Trash2, Zap, ArrowDown } from 'lucide-react';
import { generateEdgeResponse } from '../../services/geminiService';
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

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
        apiKey: settings.geminiApiKey,
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
      case 'wikipedia-query':
        return <WikipediaView payload={payload} />;
      case 'mood-music':
        return <MoodMusicView payload={payload} />;
      default:
        return null;
    }
  };

  const suggestionChips = [
    { label: '🎹 Play Virtual Piano', prompt: 'Play a melody on the 88-key virtual piano' },
    { label: '🌱 Water Tiny Garden', prompt: 'Water the plants in my tiny garden' },
    { label: '😊 Log Mood (9/10)', prompt: 'Log my mood as 9 because we launched on-device AI' },
    { label: '💡 TIL Flashcard', prompt: 'Generate a Today I Learned card about edge AI' },
    { label: '🗺️ Map Tokyo', prompt: 'Show Tokyo Shibuya on interactive map' },
    { label: '📱 Generate QR Code', prompt: 'Generate a QR code for https://ai.google.dev' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Chat Sub-Header */}
      <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-200">
              Agent Chat Sandbox ({selectedModel.name})
            </h3>
            <p className="text-[10px] text-slate-400">
              {skills.filter((s) => s.enabled).length} active skills ready for autonomous dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            onUpdateChatHistory([
              {
                id: 'msg-welcome',
                sender: 'model',
                text: 'Chat history cleared. On-device agent is ready.',
                timestamp: Date.now(),
              },
            ])
          }
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              <div
                className={`flex gap-3 max-w-2xl ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Sender Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none shadow-md ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white'
                  }`}
                >
                  {isUser ? 'U' : '✨'}
                </div>

                {/* Message Bubble */}
                <div className="space-y-3 w-full">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Tool Calls Accordion & Interactive Webviews */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-3 w-full">
                      {msg.toolCalls.map((tc, idx) => (
                        <div key={idx} className="space-y-2">
                          {/* Tool Header Card */}
                          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                <Wrench className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-200">
                                Executed Skill: {tc.skillName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {tc.durationMs}ms
                            </span>
                          </div>

                          {/* Render Rich Interactive Embed (Piano, Garden, etc.) */}
                          {renderInteractivePayload(tc)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* On-Device Latency Metrics */}
                  {msg.latency && (
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 px-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        TTFT: {msg.latency.ttftMs}ms
                      </span>
                      <span>Decode: {msg.latency.decodeSpeedTokPerSec} tok/s</span>
                      <span>Total: {msg.latency.totalMs}ms</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Assistant Placeholder */}
        {isGenerating && (
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
              ✨
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 text-slate-200 text-xs sm:text-sm leading-relaxed rounded-tl-sm w-full space-y-2">
              {streamChunk ? (
                <span>{streamChunk}</span>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Generating on-device response...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Try Skill:</span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isListening ? 'Stop Listening' : 'Hold / Click to Dictate'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask agent, execute skills, search Wiki, play piano, track mood..."
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
