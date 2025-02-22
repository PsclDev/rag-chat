import { Module } from '@nestjs/common';

import { AnthropicService } from './models/anthropic.service';

@Module({
  providers: [AnthropicService],
  exports: [],
})
export class LlmModule {}
