import { Module } from '@nestjs/common';

import { AnthropicService } from './models/anthropic.service';

const provideAndExport = [AnthropicService];

@Module({
  providers: [...provideAndExport],
  exports: [...provideAndExport],
})
export class LlmModule {}
