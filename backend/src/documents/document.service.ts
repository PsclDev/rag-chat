import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleDb, InjectDrizzle } from '@database';
import { DocumentEntity, Document } from '@documents/schema/document.schema';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger('DocumentService');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getDocuments(): Promise<DocumentEntity[]> {
    return await this.db.query.Document.findMany({
      with: {
        file: true,
        attachments: true,
        status: true,
      },
    });
  }

  async getDocument(id: string): Promise<DocumentEntity> {
    const document = await this.db.query.Document.findFirst({
      where: eq(Document.id, id),
      with: {
        file: true,
        attachments: true,
        status: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.db.delete(Document).where(eq(Document.id, id));
  }
}
