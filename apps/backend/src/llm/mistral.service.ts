import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  /** Use the smaller/cheaper model for lightweight tasks. */
  small?: boolean;
  temperature?: number;
  /** Force the model to return a JSON object. */
  json?: boolean;
  maxTokens?: number;
}

/**
 * Thin wrapper over the Mistral Chat Completions API (OpenAI-compatible shape).
 * No SDK dependency — uses native fetch so it works everywhere on Node >= 20.
 */
@Injectable()
export class MistralService {
  private readonly logger = new Logger(MistralService.name);
  private readonly endpoint = 'https://api.mistral.ai/v1/chat/completions';

  private get apiKey(): string {
    const key = process.env.MISTRAL_API_KEY;
    if (!key) {
      throw new Error('MISTRAL_API_KEY is not configured');
    }
    return key;
  }

  private model(small = false): string {
    return small
      ? process.env.MISTRAL_SMALL_MODEL ?? 'mistral-small-latest'
      : process.env.MISTRAL_MODEL ?? 'mistral-large-latest';
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model(options.small),
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 2048,
    };
    if (options.json) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Mistral API error ${res.status}: ${text}`);
      if (res.status === 429) {
        throw new HttpException(
          'AI generation is temporarily rate-limited. Please wait a minute and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new Error(`Mistral API error ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? '';
  }

  /**
   * Convenience helper that requests and safely parses a JSON response.
   * Falls back to `fallback` if parsing fails.
   */
  async chatJson<T>(messages: ChatMessage[], fallback: T, options: ChatOptions = {}): Promise<T> {
    try {
      const raw = await this.chat(messages, { ...options, json: true });
      return this.safeParse<T>(raw, fallback);
    } catch (err) {
      this.logger.warn(`chatJson failed, using fallback: ${(err as Error).message}`);
      return fallback;
    }
  }

  private safeParse<T>(raw: string, fallback: T): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Attempt to extract the first {...} or [...] block.
      const match = raw.match(/[[{][\s\S]*[\]}]/);
      if (match) {
        try {
          return JSON.parse(match[0]) as T;
        } catch {
          /* ignore */
        }
      }
      return fallback;
    }
  }
}
