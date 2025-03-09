import Anthropic from '@anthropic-ai/sdk';
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

  async sendMessage(context: string, question: string) {
    const msg = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1024,
      messages: [
        { role: 'assistant', content: context },
        { role: 'user', content: question },
      ],
    });

    console.log(JSON.stringify(msg, null, 2));

    this.logger.log(
      `\n=== User Question ===\n${question}\n\n=== Claude's Response ===\n${msg.content[0]['text']}\n`,
    );
  }
}
