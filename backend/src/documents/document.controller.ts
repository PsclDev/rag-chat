import { Controller, Delete, Get, Param } from '@nestjs/common';

import { DocumentService } from './document.service';
import { DocumentDto } from './dto/document.dto';
import { toDocumentDto } from './schema/document.schema';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  async getDocuments(): Promise<DocumentDto[]> {
    const documents = await this.documentService.getDocuments();
    return documents.map(toDocumentDto);
  }

  @Get(':id')
  async getDocument(@Param('id') id: string): Promise<DocumentDto> {
    const document = await this.documentService.getDocument(id);
    return toDocumentDto(document);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string): Promise<void> {
    return await this.documentService.deleteDocument(id);
  }
}
