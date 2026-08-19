import { ModelItem, SkillDefinition, ChatMessage } from '../types';
import { executeLocalAiInference, LocalAiOptions, LocalAiResult } from './localAiEngine';

export interface GenerateResponseOptions extends LocalAiOptions {}
export interface GenerationResult extends LocalAiResult {}

/**
 * 100% On-Device AI Response Generation
 * Runs purely on local hardware with zero external cloud dependencies.
 */
export async function generateEdgeResponse(
  messages: ChatMessage[],
  options: GenerateResponseOptions
): Promise<GenerationResult> {
  return executeLocalAiInference(messages, options);
}
