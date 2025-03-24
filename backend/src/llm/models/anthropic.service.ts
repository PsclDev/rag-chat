import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { Injectable, Logger } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { fromZodError } from 'zod-validation-error';

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

  async structuredResponse<T>(
    task: string,
    schema: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny>,
    obj: object,
    errorLogs: string | undefined = undefined,
  ): Promise<T> {
    this.logger.debug(
      `Generating structured response is retry? ${!!errorLogs}`,
    );

    const prompt = `
    You are a helpful assistant that generates structured responses.
    The response should be in the form of a JSON object.
    Do not include any other text in your response.
    Do use and only use the following JSON schema:
    ${JSON.stringify(zodToJsonSchema(schema))}

    ---

    Your task is: ${task}
    `;

    const messages = [
      { role: 'user' as const, content: JSON.stringify(obj) },
      ...(errorLogs
        ? [
            {
              role: 'user' as const,
              content:
                'The previous response was invalid. Please fix the errors and return the corrected JSON object.',
            },
            { role: 'user' as const, content: errorLogs },
          ]
        : []),
    ];
    const answer = await this.doRequest(messages, prompt);

    try {
      this.logger.debug('Parsing response from Anthropic');
      const content = JSON.parse(answer) as object;
      const parsed = schema.parse(content);
      return parsed as T;
    } catch (err) {
      this.logger.warn('Failed to parse structured response, retrying', {
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      const errors = fromZodError(err as ZodError)
        .toString()
        .replace(/;/g, '\n');

      return this.structuredResponse(task, schema, obj, errors);
    }
  }

  async generateImageDescription(
    mimeType: string,
    base64Image: string,
  ): Promise<string> {
    const prompt = `
    You are a helpful assistant that generates a description for a given image.
    The description should captures the essence of the image.
    `;

    const answer = await this.doRequest(
      [
        {
          role: 'user' as const,
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: base64Image,
              },
            },
          ],
        },
      ],
      prompt,
    );

    return answer;
  }

  async generateEmbeddingKeywords(text: string): Promise<string[]> {
    const keywordsSchema = z.object({
      keywords: z.array(z.string()),
    });
    type Keywords = z.infer<typeof keywordsSchema>;

    const prompt = `
    You are a helpful assistant that generates keywords for a given text.
    The keywords should be a list of words that are relevant to the text.
    The keywords should be no more than 10 words.
    `;

    const answer = await this.structuredResponse<Keywords>(
      prompt,
      keywordsSchema,
      {
        text,
      },
    );

    return answer.keywords;
  }

  async generateThreadTitle(messages: MessageEntity[]): Promise<string> {
    const prompt = `
    You are a helpful assistant that generates titles for chat threads.
    The title should be a single sentence that captures the essence of the conversation.
    The title should be no more than 20 words.
    The title should be in the form of a question.
    `;

    const answer = await this.doRequest(
      [
        ...messages.map((m) => ({
          role: m.author === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      ].filter(Boolean) as MessageParam[],
      prompt,
    );

    return answer;
  }

  async sendMessage(
    context: string,
    history: MessageEntity[],
  ): Promise<string> {
    const answer = await this.doRequest(
      [
        context ? { role: 'assistant', content: context } : undefined,
        ...history.map((h) => ({
          role: h.author === 'user' ? 'user' : 'assistant',
          content: h.content,
        })),
      ].filter(Boolean) as MessageParam[],
    );

    return answer;
  }

  private async doRequest(
    messages: MessageParam[],
    systemPrompt: string | undefined = undefined,
    model: string = 'claude-3-5-sonnet-latest',
    maxTokens: number = 1024,
  ): Promise<string> {
    const msg = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages,
      system: systemPrompt,
    });

    return msg.content[0]['text'] as string;
  }
}
