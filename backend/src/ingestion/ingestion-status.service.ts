import { Injectable, Logger } from '@nestjs/common';
import { eq, desc, not, and } from 'drizzle-orm';

import {
  DrizzleDb,
  InjectDrizzle,
  DocumentStatus,
  DocumentStatusEntity,
} from '@database';
import { generateId, NotificationService } from '@shared';
import { DocumentStatusStep } from '@documents/dto/document.dto';

@Injectable()
export class IngestionStatusService {
  private readonly logger = new Logger('IngestionStatusService');

  constructor(
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly notificationService: NotificationService,
  ) { }

  async getLastStatusForDocument(documentId: string): Promise<DocumentStatusEntity> {
    const res = await this.db
      .select()
      .from(DocumentStatus)
      .where(eq(DocumentStatus.documentId, documentId))
      .orderBy(desc(DocumentStatus.createdAt))
      .limit(1);

    if (res.length === 0) {
      throw new Error(`No status found for document ${documentId}`);
    }

    return res[0];
  }

  async setNewStatus(
    documentId: string,
    step: DocumentStatusStep,
    setCompletedAt = true,
  ): Promise<void> {
    const lastStep = await this.getLastStatusForDocument(documentId);
    if (lastStep.step === step) {
      return;
    }

    await this.db
      .update(DocumentStatus)
      .set({
        completedAt: new Date(),
        failed: step === DocumentStatusStep.FAILED,
      })
      .where(eq(DocumentStatus.id, lastStep.id));

    await this.db
      .insert(DocumentStatus)
      .values({
        id: generateId(),
        documentId,
        step,
        completedAt: setCompletedAt ? new Date() : null,
      })
      .returning();

    const all = await this.db
      .select()
      .from(DocumentStatus)
      .where(eq(DocumentStatus.documentId, documentId));
    this.notificationService.emitDocumentStatusUpdate(documentId, all);
  }

  async resetStatusForDocument(documentId: string): Promise<void> {
    await this.db
      .delete(DocumentStatus)
      .where(
        and(
          eq(DocumentStatus.documentId, documentId),
          not(eq(DocumentStatus.step, DocumentStatusStep.QUEUED)),
        ),
      );

    const all = await this.db
      .select()
      .from(DocumentStatus)
      .where(eq(DocumentStatus.documentId, documentId));
    this.notificationService.emitDocumentStatusUpdate(documentId, all);
  }
}
