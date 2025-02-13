import { Module } from '@nestjs/common';

import { AnthropicService } from './providers/anthropic.service';

@Module({
  providers: [AnthropicService],
  exports: [AnthropicService],
})
export class LlmModule {}
