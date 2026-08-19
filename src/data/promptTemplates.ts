export interface PromptTemplate {
  id: string;
  name: string;
  category: 'Coding' | 'Summarization' | 'Reasoning' | 'Creative' | 'System';
  prompt: string;
  systemPrompt?: string;
  recommendedConfig?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  };
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: 'Kotlin/TypeScript Code Auditor',
    category: 'Coding',
    systemPrompt: 'You are an expert static analysis compiler assistant. Review code for memory leaks, performance bottlenecks, edge-case nullability, and thread safety.',
    prompt: `Review the following algorithm for latency and edge cases:\n\nfun calculateMovingAverage(window: Int, stream: List<Double>): List<Double> {\n  return stream.windowed(window) { it.average() }\n}`,
    recommendedConfig: { temperature: 0.2, topP: 0.9, maxTokens: 1024 }
  },
  {
    id: 'tldr-summarize',
    name: 'Executive TL;DR Bullet Summarizer',
    category: 'Summarization',
    systemPrompt: 'You are an executive summarizer. Condense text into exactly 3 key bullet points followed by 1 actionable conclusion.',
    prompt: `Summarize the on-device AI evolution: On-device models like Gemma 3n and LiteRT enable sub-100ms time to first token without sending user prompts to external cloud servers. By executing quantized INT4 weights directly on the device NPU and GPU, mobile apps maintain full privacy, eliminate cloud API egress costs, and continue functioning smoothly even without internet connectivity.`,
    recommendedConfig: { temperature: 0.4, topP: 0.95, maxTokens: 512 }
  },
  {
    id: 'chain-of-thought',
    name: 'Step-by-Step Chain of Thought',
    category: 'Reasoning',
    systemPrompt: 'You are a meticulous logical reasoning engine. Break every puzzle into numbered steps before stating your final answer.',
    prompt: `A small battery powers a 2W edge accelerator. If the battery capacity is 18.5 Wh and conversion efficiency is 90%, how many continuous minutes of on-device LLM decoding can it sustain?`,
    recommendedConfig: { temperature: 0.1, topP: 0.8, maxTokens: 1024 }
  },
  {
    id: 'creative-adventure',
    name: 'Interactive Sci-Fi Narrative',
    category: 'Creative',
    systemPrompt: 'You are an interactive storyteller crafting deep cyberpunk exploration narratives with branching player choices.',
    prompt: `Set the opening scene of a lone technician booting up an orphaned android satellite orbiting a silent Jupiter station. Provide 3 numbered action choices at the end.`,
    recommendedConfig: { temperature: 0.95, topP: 0.98, maxTokens: 2048 }
  }
];

export const BENCHMARK_PRESETS = [
  {
    id: 'short-prefill',
    name: 'Short Prefill (64 Tokens)',
    prompt: 'Explain the fundamental difference between on-device LiteRT INT4 quantization and server FP16 models in two short sentences.'
  },
  {
    id: 'medium-reasoning',
    name: 'Medium Reasoning (256 Tokens)',
    prompt: 'Write a comprehensive comparison of memory bandwidth vs compute utilization on edge mobile GPUs for LLM decoding phases. Include a table with arithmetic intensity estimates.'
  },
  {
    id: 'long-context',
    name: 'Long Context Prefill (1024 Tokens)',
    prompt: 'Analyze this sample project architecture and suggest five modular refactorings with concrete code examples for separating UI rendering, StateFlow management, and SQLite LiteRT persistence.'
  }
];
