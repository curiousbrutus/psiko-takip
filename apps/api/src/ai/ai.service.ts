import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type OllamaTagsResponse = {
  models?: Array<{
    name?: string;
  }>;
};

type OllamaGenerateResponse = {
  response?: string;
};

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string; code?: number };
};

@Injectable()
export class AiService {
  private readonly baseUrl: string;
  private readonly primaryModel: string;
  private readonly fallbackModel: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  private readonly provider: string;
  private readonly openRouterKey?: string;
  private readonly openRouterBase: string;
  private readonly openRouterModels: string[];

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.cfg('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434';
    this.primaryModel = this.cfg('OLLAMA_PRIMARY_MODEL') || 'qwen3.5:latest';
    this.fallbackModel = this.cfg('OLLAMA_FALLBACK_MODEL') || 'qwen2.5:3b';
    this.timeoutMs = Number(this.cfg('OLLAMA_TIMEOUT_MS') || 45000);
    this.maxRetries = Number(this.cfg('OLLAMA_MAX_RETRIES') || 1);

    this.provider = (this.cfg('AI_PROVIDER') || 'ollama').toLowerCase();
    this.openRouterKey = this.cfg('OPENROUTER_API_KEY');
    this.openRouterBase =
      this.cfg('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1';
    const primary = this.cfg('OPENROUTER_MODEL') || 'google/gemma-4-31b-it:free';
    const fallbacks = (this.cfg('OPENROUTER_FALLBACK_MODELS') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    this.openRouterModels = [primary, ...fallbacks];
  }

  private cfg(key: string): string | undefined {
    return this.configService.get<string>(key) ?? process.env[key];
  }

  /**
   * Provider-agnostic chat. Prefers OpenRouter (quality) with model rotation +
   * retry on rate limits, and falls back to local Ollama (always-on, private).
   */
  async chat(
    messages: ChatMessage[],
    opts: { temperature?: number } = {}
  ): Promise<{ provider: string; model: string; response: string }> {
    if (this.provider === 'openrouter' && this.openRouterKey) {
      for (const model of this.openRouterModels) {
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const response = await this.openRouterChat(model, messages, opts);
            return { provider: 'openrouter', model, response };
          } catch (error) {
            const status = (error as { status?: number }).status ?? 0;
            // 429/5xx → rotate/retry; otherwise stop trying this model.
            if (status !== 429 && status < 500) break;
            await new Promise(r => setTimeout(r, 400));
          }
        }
      }
      // fall through to Ollama if every OpenRouter model was unavailable
    }

    const system = messages
      .filter(m => m.role === 'system')
      .map(m => m.content)
      .join('\n\n');
    const conversation = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'assistant' ? 'Yoldaş' : 'Danışan'}: ${m.content}`)
      .join('\n');
    const generated = await this.generate({
      prompt: `${conversation}\nYoldaş:`,
      system,
      temperature: opts.temperature,
    });
    return {
      provider: 'ollama',
      model: generated.model,
      response: generated.response,
    };
  }

  private async openRouterChat(
    model: string,
    messages: ChatMessage[],
    opts: { temperature?: number }
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.openRouterBase}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://psikotakip.app',
          'X-Title': 'Psikotakip',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: opts.temperature ?? 0.7,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as OpenRouterChatResponse;
      if (!res.ok || data.error) {
        const err = new Error(
          data.error?.message || `OpenRouter ${res.status}`
        ) as Error & { status?: number };
        err.status = res.status || data.error?.code || 0;
        throw err;
      }
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        const err = new Error('OpenRouter empty response') as Error & {
          status?: number;
        };
        err.status = 502;
        throw err;
      }
      return content;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getModels() {
    const tags = await this.fetchWithTimeout<OllamaTagsResponse>(
      `${this.baseUrl}/api/tags`
    );

    const models = (tags.models || [])
      .map(model => model.name)
      .filter((name): name is string => Boolean(name));

    return {
      baseUrl: this.baseUrl,
      configuredPrimary: this.primaryModel,
      configuredFallback: this.fallbackModel,
      availableModels: models,
    };
  }

  async getHealth() {
    try {
      const modelInfo = await this.getModels();
      const availableSet = new Set(modelInfo.availableModels);

      return {
        provider: 'ollama',
        baseUrl: modelInfo.baseUrl,
        status: 'ok',
        primaryModel: this.primaryModel,
        fallbackModel: this.fallbackModel,
        primaryAvailable: availableSet.has(this.primaryModel),
        fallbackAvailable: availableSet.has(this.fallbackModel),
        availableCount: modelInfo.availableModels.length,
      };
    } catch (error) {
      return {
        provider: 'ollama',
        baseUrl: this.baseUrl,
        status: 'down',
        primaryModel: this.primaryModel,
        fallbackModel: this.fallbackModel,
        error:
          error instanceof Error
            ? error.message
            : 'Ollama health check failed',
      };
    }
  }

  async generate(input: {
    prompt: string;
    system?: string;
    temperature?: number;
  }) {
    const modelsToTry =
      this.primaryModel === this.fallbackModel
        ? [this.primaryModel]
        : [this.primaryModel, this.fallbackModel];

    let lastError: unknown;

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
        try {
          const generated = await this.generateWithModel(model, input);
          return {
            model,
            response: generated,
            fallbackUsed: model !== this.primaryModel,
          };
        } catch (error) {
          lastError = error;
        }
      }
    }

    throw new ServiceUnavailableException(
      `AI generation failed for models [${modelsToTry.join(', ')}]: ${
        lastError instanceof Error ? lastError.message : 'unknown error'
      }`
    );
  }

  private async generateWithModel(
    model: string,
    input: { prompt: string; system?: string; temperature?: number }
  ) {
    const payload = {
      model,
      prompt: input.prompt,
      system: input.system,
      stream: false,
      options:
        input.temperature !== undefined
          ? { temperature: input.temperature }
          : undefined,
    };

    const result = await this.fetchWithTimeout<OllamaGenerateResponse>(
      `${this.baseUrl}/api/generate`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!result.response) {
      throw new InternalServerErrorException(
        `No response generated by model ${model}`
      );
    }

    return result.response;
  }

  private async fetchWithTimeout<T>(url: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await response.text();
        throw new ServiceUnavailableException(
          `Ollama request failed (${response.status}): ${details}`
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
