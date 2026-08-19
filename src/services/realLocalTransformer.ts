import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js to cache model weights in IndexedDB/CacheStorage in the browser
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  // Use WebAssembly / WebGPU
  if ((env as any).backends?.onnx?.wasm) {
    (env as any).backends.onnx.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency || 2);
  }
}

export interface ModelLoadingProgress {
  status: 'init' | 'downloading' | 'loading' | 'ready' | 'error';
  progress: number;
  file?: string;
  loaded?: number;
  total?: number;
  message?: string;
}

type ProgressCallback = (progress: ModelLoadingProgress) => void;

class RealLocalAiPipeline {
  private generator: any = null;
  private currentModelId: string = '';
  private isLoading: boolean = false;
  private subscribers: Set<ProgressCallback> = new Set();
  public lastProgress: ModelLoadingProgress = { status: 'init', progress: 0, message: 'Not loaded yet' };

  public subscribe(cb: ProgressCallback) {
    this.subscribers.add(cb);
    cb(this.lastProgress);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify(progress: ModelLoadingProgress) {
    this.lastProgress = progress;
    this.subscribers.forEach((cb) => cb(progress));
  }

  public isModelReady(): boolean {
    return this.generator !== null;
  }

  public getCurrentModelId(): string {
    return this.currentModelId;
  }

  public async loadModel(
    modelId: string = 'Xenova/LaMini-Flan-T5-783M',
    task: string = 'text2text-generation'
  ): Promise<boolean> {
    if (this.generator && this.currentModelId === modelId) {
      return true;
    }

    if (this.isLoading) {
      return false;
    }

    this.isLoading = true;
    this.notify({ status: 'downloading', progress: 5, message: `Fetching ONNX weights for ${modelId}...` });

    try {
      this.generator = await pipeline(task as any, modelId, {
        progress_callback: (p: any) => {
          if (p.status === 'progress') {
            const percent = Math.round(p.progress || 0);
            this.notify({
              status: 'downloading',
              progress: Math.min(95, Math.max(5, percent)),
              file: p.file,
              loaded: p.loaded,
              total: p.total,
              message: `Downloading ${p.file || 'weights'} (${percent}%)...`,
            });
          } else if (p.status === 'init' || p.status === 'loading') {
            this.notify({
              status: 'loading',
              progress: 95,
              message: `Compiling neural tensors & WebAssembly execution graph...`,
            });
          } else if (p.status === 'ready') {
            this.notify({
              status: 'ready',
              progress: 100,
              message: `Model weights active in browser memory`,
            });
          }
        },
      });

      this.currentModelId = modelId;
      this.isLoading = false;
      this.notify({
        status: 'ready',
        progress: 100,
        message: `${modelId} loaded successfully in WebAssembly/WebGPU memory!`,
      });
      return true;
    } catch (err: any) {
      console.error('Failed to load local ONNX model via Transformers.js:', err);
      this.isLoading = false;
      this.notify({
        status: 'error',
        progress: 0,
        message: `Failed to load ${modelId}: ${err.message || err}`,
      });
      return false;
    }
  }

  public async generate(
    prompt: string,
    options: {
      maxNewTokens?: number;
      temperature?: number;
      topP?: number;
      onToken?: (token: string) => void;
    } = {}
  ): Promise<{ text: string; tokensGenerated: number; durationMs: number }> {
    const startTime = performance.now();

    if (!this.generator) {
      // Auto-load default model if not loaded yet
      const loaded = await this.loadModel('Xenova/LaMini-Flan-T5-783M', 'text2text-generation');
      if (!loaded || !this.generator) {
        throw new Error('Local neural model is not ready. Please initialize the model weights.');
      }
    }

    try {
      const maxNewTokens = options.maxNewTokens || 256;
      const temperature = options.temperature || 0.7;

      // Real Neural Network Forward-Pass Generation
      const output = await this.generator(prompt, {
        max_new_tokens: maxNewTokens,
        temperature: Math.max(0.1, temperature),
        do_sample: temperature > 0.2,
        top_k: 40,
      });

      let generatedText = '';
      if (Array.isArray(output) && output.length > 0) {
        generatedText = output[0].generated_text || output[0].summary_text || output[0].translation_text || JSON.stringify(output[0]);
      } else if (typeof output === 'object' && output !== null) {
        generatedText = (output as any).generated_text || JSON.stringify(output);
      } else {
        generatedText = String(output);
      }

      // Stream generated output to callback
      if (options.onToken) {
        const words = generatedText.split(' ');
        let acc = '';
        for (let i = 0; i < words.length; i++) {
          acc += (i === 0 ? '' : ' ') + words[i];
          options.onToken(acc);
          await new Promise((r) => setTimeout(r, 12));
        }
      }

      const durationMs = Math.round(performance.now() - startTime);
      const tokensGenerated = Math.max(1, Math.round(generatedText.length / 3.8));

      return {
        text: generatedText.trim(),
        tokensGenerated,
        durationMs,
      };
    } catch (err: any) {
      console.error('Error during on-device model inference execution:', err);
      throw err;
    }
  }
}

export const localAiPipeline = new RealLocalAiPipeline();
