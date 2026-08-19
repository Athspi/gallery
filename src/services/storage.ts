import { AppSettings, ChatMessage, McpServer, ModelItem, SkillDefinition, BenchmarkResult } from '../types';
import { INITIAL_MODELS } from '../data/defaultModels';
import { INITIAL_SKILLS } from '../data/defaultSkills';
import { INITIAL_MCP_SERVERS } from '../data/defaultMcpServers';

const SETTINGS_KEY = 'ai_edge_gallery_settings';
const MODELS_KEY = 'ai_edge_gallery_models';
const SKILLS_KEY = 'ai_edge_gallery_skills';
const MCP_KEY = 'ai_edge_gallery_mcp';
const CHAT_KEY = 'ai_edge_gallery_chat_history';
const BENCHMARK_KEY = 'ai_edge_gallery_benchmarks';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  geminiApiKey: '',
  useServerGemini: true,
  enableSoundEffects: true,
  defaultModelId: 'gemma-3n-e2b-it-int4',
  showDevLogs: true,
  temperature: 0.8,
  topP: 0.95,
  maxTokens: 2048,
};

export const storage = {
  getSettings(): AppSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  },
  saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getModels(): ModelItem[] {
    const raw = localStorage.getItem(MODELS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MODELS;
  },
  saveModels(models: ModelItem[]) {
    localStorage.setItem(MODELS_KEY, JSON.stringify(models));
  },

  getSkills(): SkillDefinition[] {
    const raw = localStorage.getItem(SKILLS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_SKILLS;
  },
  saveSkills(skills: SkillDefinition[]) {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  },

  getMcpServers(): McpServer[] {
    const raw = localStorage.getItem(MCP_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MCP_SERVERS;
  },
  saveMcpServers(servers: McpServer[]) {
    localStorage.setItem(MCP_KEY, JSON.stringify(servers));
  },

  getChatHistory(): ChatMessage[] {
    const raw = localStorage.getItem(CHAT_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'msg-welcome',
        sender: 'model',
        text: "Hello! I'm running on-device with the **Google AI Edge Gallery** engine. I can execute local skills, query Wikipedia, create interactive maps, synthesize music, play the virtual piano, track moods, generate QR codes, and trigger mobile actions. How can I assist you?",
        timestamp: Date.now(),
      }
    ];
  },
  saveChatHistory(history: ChatMessage[]) {
    localStorage.setItem(CHAT_KEY, JSON.stringify(history));
  },

  getBenchmarks(): BenchmarkResult[] {
    const raw = localStorage.getItem(BENCHMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  saveBenchmarks(results: BenchmarkResult[]) {
    localStorage.setItem(BENCHMARK_KEY, JSON.stringify(results));
  }
};
