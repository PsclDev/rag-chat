import { Controller, Param, Patch } from '@nestjs/common';

import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Patch('reingest/:id')
  reprocessFile(@Param('id') id: string) {
    this.ingestionService.reingestFile(id);
  }
}
