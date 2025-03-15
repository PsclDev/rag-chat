import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@config';

@Injectable()
export class AnthropicService {
  private readonly anthropic: Anthropic;
  private readonly logger: Logger = new Logger('Anthropic Service');

  constructor(private readonly config: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.config.llm.anthropic.apiKey,
    });
  }

  async sendMessage(context: string, question: string): Promise<string> {
    console.log('context', context);
    console.log('question', question);

    const msg = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      messages: [
        context ? { role: 'assistant', content: context } : undefined,
        { role: 'user', content: question },
      ].filter(Boolean) as MessageParam[],
    });

    console.log(JSON.stringify(msg, null, 2));

    this.logger.log(
      `\n=== User Question ===\n${question}\n\n=== Claude's Response ===\n${msg.content[0]['text']}\n`,
    );

    return msg.content[0]['text'];
  }
}
