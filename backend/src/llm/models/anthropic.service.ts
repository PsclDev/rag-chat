import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@config';
import { MessageEntity } from '@database';

@Injectable()
export class AnthropicService {
  private readonly anthropic: Anthropic;
  private readonly logger: Logger = new Logger('Anthropic Service');

  constructor(private readonly config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.llm.anthropic.apiKey,
    });
  }

  async generateThreadTitle(messages: MessageEntity[]): Promise<string> {
    const prompt = `
    You are a helpful assistant that generates titles for chat threads.
    The title should be a single sentence that captures the essence of the conversation.
    The title should be no more than 20 words.
    The title should be in the form of a question.
    `;

    const msg = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      system: prompt,
      messages: [
        ...messages.map((m) => ({
          role: m.author === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ].filter(Boolean) as MessageParam[],
    });

    return msg.content[0]['text'];
  }

  async sendMessage(
    context: string,
    history: MessageEntity[],
  ): Promise<string> {
    const msg = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      messages: [
        context ? { role: 'assistant', content: context } : undefined,
        ...history.map((h) => ({
          role: h.author === 'user' ? 'user' : 'assistant',
          content: h.content,
        })),
      ].filter(Boolean) as MessageParam[],
    });

    this.logger.verbose(
      `=== Claude's Response ===\n${JSON.stringify(msg, null, 2)}\n`,
    );

    return msg.content[0]['text'];
  }
}
