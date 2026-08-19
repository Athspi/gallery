import { GoogleGenAI } from '@google/genai';
import { ModelItem, SkillDefinition, ChatMessage } from '../types';
import { executeSkillScript } from './skillExecutor';

export interface GenerateResponseOptions {
  model: ModelItem;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  skills?: SkillDefinition[];
  onTokenChunk?: (chunk: string) => void;
  apiKey?: string;
}

export interface GenerationResult {
  text: string;
  toolCalls?: ChatMessage['toolCalls'];
  latency: {
    ttftMs: number;
    decodeSpeedTokPerSec: number;
    totalMs: number;
    tokenCount: number;
  };
}

export async function generateEdgeResponse(
  messages: ChatMessage[],
  options: GenerateResponseOptions
): Promise<GenerationResult> {
  const startOverall = performance.now();
  const activeSkills = options.skills?.filter((s) => s.enabled) || [];
  const latestMessage = messages[messages.length - 1];
  const userText = latestMessage?.text || '';

  // 1. Check for Skill Tool Trigger based on intents
  let toolCallRequest: { skill: SkillDefinition; actionName: string; parameters: any } | null = null;

  for (const skill of activeSkills) {
    const tool = skill.toolDefinition;
    const lower = userText.toLowerCase();

    if (skill.id === 'mood-tracker' && (lower.includes('mood') || lower.includes('feeling') || lower.includes('happy') || lower.includes('sad') || lower.includes('log') || lower.includes('track'))) {
      const scoreMatch = userText.match(/\b([1-9]|10)\b/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 8;
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { action: 'log_mood', score, comment: userText },
      };
      break;
    }

    if (skill.id === 'virtual-piano' && (lower.includes('piano') || lower.includes('play music') || lower.includes('chords') || lower.includes('song') || lower.includes('melody') || lower.includes('notes'))) {
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { songTitle: 'Edge Serenade', notes: 'C4, E4, G4, B4, C5, G4, E4, C4', tempo: 120 },
      };
      break;
    }

    if (skill.id === 'learn-something-new' && (lower.includes('learn') || lower.includes('til') || lower.includes('today i learned') || lower.includes('fact') || lower.includes('card') || lower.includes('flashcard'))) {
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: {
          topic: userText.replace(/generate|create|card|til|learn|about|flashcard/gi, '').trim() || 'Edge AI On Mobile Silicons',
          description: 'On-device neural accelerators execute billions of operations per second using sub-4-bit weights while preserving complete offline user privacy.',
          sourceUrl: 'https://ai.google.dev/edge'
        },
      };
      break;
    }

    if (skill.id === 'qr-code' && (lower.includes('qr') || lower.includes('barcode') || lower.includes('scan code'))) {
      const urlMatch = userText.match(/https?:\/\/[^\s]+/i);
      const url = urlMatch ? urlMatch[0] : 'https://github.com/google-ai-edge/gallery';
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { url, shape: lower.includes('circle') ? 'circle' : 'square', color: '#2563eb' },
      };
      break;
    }

    if (skill.id === 'query-wikipedia' && (lower.includes('wiki') || lower.includes('who is') || lower.includes('what is') || lower.includes('tell me about') || lower.includes('lookup') || lower.includes('search for'))) {
      const topic = userText.replace(/who is|what is|tell me about|lookup|search for|wikipedia|wiki/gi, '').trim() || 'Google Gemma';
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { topic, lang: 'en' },
      };
      break;
    }

    if (skill.id === 'interactive-map' && (lower.includes('map') || lower.includes('where is') || lower.includes('locate') || lower.includes('directions') || lower.includes('city') || lower.includes('show on map'))) {
      const loc = userText.replace(/show on map|where is|locate|map of|map/gi, '').trim() || 'Tokyo, Japan';
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { location: loc, zoom: 14 },
      };
      break;
    }

    if (skill.id === 'tinygarden' && (lower.includes('garden') || lower.includes('plant') || lower.includes('water') || lower.includes('flower') || lower.includes('seed') || lower.includes('harvest'))) {
      const action = lower.includes('water') ? 'water' : lower.includes('harvest') ? 'harvest' : 'plant';
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { action, seedType: lower.includes('rose') ? 'rose' : lower.includes('tulip') ? 'tulip' : 'sunflower', plotIndex: 0 },
      };
      break;
    }

    if (skill.id === 'calculate-hash' && (lower.includes('hash') || lower.includes('sha') || lower.includes('md5') || lower.includes('checksum'))) {
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { text: userText, algorithm: lower.includes('sha512') ? 'SHA-512' : 'SHA-256' },
      };
      break;
    }

    if (skill.id === 'text-spinner' && (lower.includes('spin') || lower.includes('wheel') || lower.includes('decide') || lower.includes('roulette') || lower.includes('random pick'))) {
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { label: 'Option Alpha, Option Beta, Option Gamma, Option Delta' },
      };
      break;
    }

    if (skill.id === 'mood-music' && (lower.includes('music') || lower.includes('soundtrack') || lower.includes('beat') || lower.includes('track') || lower.includes('lofi') || lower.includes('ambient'))) {
      toolCallRequest = {
        skill,
        actionName: tool.name,
        parameters: { genre: lower.includes('synth') ? 'Synthwave' : lower.includes('ambient') ? 'Ambient' : 'Lo-Fi', energy: 'medium', duration: 120 },
      };
      break;
    }
  }

  // 2. If Tool Call is present, execute it
  const toolCallsResult: ChatMessage['toolCalls'] = [];
  let toolResponseContext = '';

  if (toolCallRequest) {
    const execResult = await executeSkillScript(toolCallRequest.skill, toolCallRequest.parameters);
    toolCallsResult.push({
      skillId: toolCallRequest.skill.id,
      skillName: toolCallRequest.skill.name,
      actionName: toolCallRequest.actionName,
      parameters: toolCallRequest.parameters,
      result: execResult.result,
      error: execResult.error,
      status: execResult.success ? 'completed' : 'failed',
      durationMs: execResult.durationMs,
      interactiveType: execResult.interactiveType,
    });
    toolResponseContext = `[Tool Result from ${toolCallRequest.skill.name}]: ${JSON.stringify(execResult.result || execResult.error)}`;
  }

  // 3. Generate response text with simulated edge latency or Real Gemini if key is provided
  const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') || '';
  let responseText = '';
  const ttftTarget = options.model.benchmarkStats?.timeToFirstTokenMs || 75;
  const decodeSpeed = options.model.benchmarkStats?.decodeTokensPerSec || 50;

  if (apiKey && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptWithContext = `${options.systemPrompt ? options.systemPrompt + '\n\n' : ''}${toolResponseContext ? toolResponseContext + '\n\n' : ''}User: ${userText}`;
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptWithContext,
      });
      responseText = res.text || 'Completed.';
    } catch (err: any) {
      console.warn('Gemini API fallback to local simulated engine:', err.message);
      responseText = generateSimulatedResponse(userText, options.model, toolCallRequest, toolCallsResult[0]?.result);
    }
  } else {
    responseText = generateSimulatedResponse(userText, options.model, toolCallRequest, toolCallsResult[0]?.result);
  }

  // Simulate on-device token streaming for realistic UI feel
  const words = responseText.split(' ');
  let accumulated = '';
  
  // Wait TTFT
  await new Promise((r) => setTimeout(r, Math.min(ttftTarget, 120)));

  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    accumulated += chunk;
    if (options.onTokenChunk) {
      options.onTokenChunk(accumulated);
    }
    // Stream delay based on decode tokens/sec
    const delayPerWord = Math.max(10, Math.floor(1000 / (decodeSpeed * 1.3)));
    if (i < 30) {
      await new Promise((r) => setTimeout(r, delayPerWord));
    }
  }

  const totalTime = Math.round(performance.now() - startOverall);
  const tokenCount = Math.max(12, Math.round(responseText.length / 3.8));

  return {
    text: responseText,
    toolCalls: toolCallsResult.length > 0 ? toolCallsResult : undefined,
    latency: {
      ttftMs: ttftTarget,
      decodeSpeedTokPerSec: decodeSpeed,
      totalMs: totalTime,
      tokenCount,
    },
  };
}

function generateSimulatedResponse(
  userPrompt: string,
  model: ModelItem,
  toolCall: any,
  toolResult: any
): string {
  const p = userPrompt.toLowerCase();

  if (toolCall) {
    if (toolCall.skill.id === 'mood-tracker') {
      return `I've logged your mood entry with score ${toolCall.parameters.score}/10 into your on-device SQLite database. You can view your historical emotional trends and score distribution in the interactive dashboard above.`;
    }
    if (toolCall.skill.id === 'virtual-piano') {
      return `I've opened the 88-key Virtual Piano synthesizer! You can play notes directly on your keyboard or touch screen, change octaves, or play chords in real-time.`;
    }
    if (toolCall.skill.id === 'learn-something-new') {
      return `Here is your freshly minted "Today I Learned" flashcard! I've rendered a custom typography card with an embedded QR code link.`;
    }
    if (toolCall.skill.id === 'qr-code') {
      return `I've generated the high-resolution QR code for "${toolCall.parameters.url}". You can scan it directly with your mobile camera or download the asset.`;
    }
    if (toolCall.skill.id === 'query-wikipedia') {
      return `Here is the Wikipedia information for "${toolCall.parameters.topic}":\n\n${typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)}`;
    }
    if (toolCall.skill.id === 'interactive-map') {
      return `I've located "${toolCall.parameters.location}" on the interactive map widget above. You can pan, zoom, and explore points of interest.`;
    }
    if (toolCall.skill.id === 'tinygarden') {
      return `The Tiny Garden has executed your action (${toolCall.parameters.action})! Watch your plot blossom with pixel animations and gentle botanical sounds.`;
    }
    if (toolCall.skill.id === 'calculate-hash') {
      return `Calculated cryptographic checksum using on-device WebCrypto. The hash is ready for payload verification.`;
    }
    if (toolCall.skill.id === 'mood-music') {
      return `Generated ambient soundtrack session in the ${toolCall.parameters.genre} genre. Hit play on the waveform below to listen!`;
    }
    if (toolCall.skill.id === 'text-spinner') {
      return `The decision roulette has spun! Check the wheel outcome in the interactive widget above.`;
    }
  }

  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return `Hello! I am running via **${model.name}** directly on your local hardware. I have instant access to on-device tools including Wikipedia search, 88-key Virtual Piano, Mood Logging, Tiny Garden mini-game, QR generation, and Mobile Actions. What would you like to build or explore today?`;
  }

  if (p.includes('gemma') || p.includes('model') || p.includes('spec') || p.includes('quant')) {
    return `**${model.name}** is configured with INT4 quantization and a context window of ${model.defaultConfig.maxTokens} tokens. Peak memory footprint is approximately ${(model.estimatedPeakMemoryInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB, executing on ${model.defaultConfig.accelerators || 'NPU/GPU'} accelerators for privacy-first, low-latency edge inference.`;
  }

  return `I have processed your request using **${model.name}**. On-device inference guarantees zero external data egress, sub-100ms first token latency, and seamless skill dispatching. Let me know if you want to execute tools, run benchmarks, or adjust sampling hyperparameters!`;
}
