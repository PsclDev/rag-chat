import { Controller, Delete, Get, Param } from '@nestjs/common';

import { DocumentService } from './document.service';
import { DocumentEntity } from './schema/document.schema';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async getDocuments(): Promise<DocumentEntity[]> {
    return await this.documentService.getDocuments();
  }

  @Get(':id')
  async getDocument(@Param('id') id: string): Promise<DocumentEntity> {
    return await this.documentService.getDocument(id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string): Promise<void> {
    return await this.documentService.deleteDocument(id);
  }
}
