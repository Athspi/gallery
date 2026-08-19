import { SkillDefinition } from '../types';

export interface SkillExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  interactiveType?: string;
  payload?: any;
  durationMs: number;
}

export async function executeSkillScript(
  skill: SkillDefinition,
  inputArgs: any
): Promise<SkillExecutionResult> {
  const startTime = performance.now();
  try {
    // Build an async function runner
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const runner = new AsyncFunction('input', skill.scriptJs);
    const output = await runner(inputArgs);

    const durationMs = Math.round(performance.now() - startTime);

    if (output && typeof output === 'object') {
      return {
        success: !output.error,
        result: output.result || output,
        error: output.error,
        interactiveType: output.interactiveType || skill.interactiveComponent,
        payload: output.payload || inputArgs,
        durationMs,
      };
    }

    return {
      success: true,
      result: output,
      interactiveType: skill.interactiveComponent,
      payload: inputArgs,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      error: err.message || 'Execution error in skill script',
      durationMs,
    };
  }
}
