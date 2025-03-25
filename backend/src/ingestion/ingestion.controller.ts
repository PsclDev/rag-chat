import { Controller, Param, Patch } from '@nestjs/common';

import { IngestionService } from './ingestion.service';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) { }

  @Patch('reingest/:id')
  reprocessDocument(@Param('id') id: string) {
    this.ingestionService.reingestDocument(id);
  }
}
