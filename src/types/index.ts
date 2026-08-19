export type TaskType = 'llm_chat' | 'llm_prompt_lab' | 'llm_ask_image' | 'llm_benchmark' | 'agent_chat';

export interface ModelConfig {
  topK: number;
  topP: number;
  temperature: number;
  maxTokens: number;
  accelerators?: string;
  seed?: number;
}

export interface ModelItem {
  id: string;
  name: string;
  modelId: string;
  modelFile: string;
  description: string;
  sizeInBytes: number;
  estimatedPeakMemoryInBytes: number;
  version: string;
  llmSupportImage?: boolean;
  defaultConfig: ModelConfig;
  taskTypes: TaskType[];
  status: 'not_downloaded' | 'downloading' | 'downloaded' | 'loaded' | 'ready';
  downloadProgress?: number; // 0-100
  downloadSpeedMb?: number;
  isCustom?: boolean;
  benchmarkStats?: {
    prefillTokensPerSec: number;
    decodeTokensPerSec: number;
    timeToFirstTokenMs: number;
    peakMemoryMb: number;
  };
}

export interface SkillParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: any;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Utility' | 'Interactive' | 'System' | 'Media' | 'Education' | 'Gaming';
  icon: string;
  version: string;
  author: string;
  enabled: boolean;
  isFeatured?: boolean;
  systemPromptAddition?: string;
  toolDefinition: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required: string[];
    };
  };
  scriptJs: string;
  interactiveComponent?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  toolCalls?: {
    skillId: string;
    skillName: string;
    actionName: string;
    parameters: any;
    result?: any;
    error?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    durationMs?: number;
    webviewUrl?: string;
    interactiveType?: string;
  }[];
  latency?: {
    ttftMs: number;
    decodeSpeedTokPerSec: number;
    totalMs: number;
    tokenCount: number;
  };
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  isThinking?: boolean;
}

export interface McpServer {
  id: string;
  name: string;
  url: string;
  type: 'sse' | 'stdio' | 'websocket';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  apiKey?: string;
  description?: string;
  tools: {
    name: string;
    description: string;
    inputSchema: any;
    enabled: boolean;
    requireConfirmation: boolean;
  }[];
}

export interface MobileAction {
  id: string;
  name: string;
  category: 'Calendar' | 'Email' | 'Notification' | 'Device' | 'Contacts';
  description: string;
  parameters: Record<string, any>;
  lastRun?: number;
  status?: 'success' | 'failed';
  result?: string;
}

export interface BenchmarkResult {
  id: string;
  timestamp: number;
  modelName: string;
  promptTokens: number;
  outputTokens: number;
  ttftMs: number;
  prefillTokPerSec: number;
  decodeTokPerSec: number;
  totalLatencyMs: number;
  peakMemoryMb: number;
  steadinessScore: number; // 0-100
}

export interface AppSettings {
  theme: 'dark' | 'light';
  geminiApiKey: string;
  useServerGemini: boolean;
  enableSoundEffects: boolean;
  defaultModelId: string;
  showDevLogs: boolean;
  temperature: number;
  topP: number;
  maxTokens: number;
}
