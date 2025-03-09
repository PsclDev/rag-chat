import { Injectable, Logger } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';

import {
  DrizzleDb,
  InjectDrizzle,
  FileStatus,
  FileStatusEntity,
  FileStatusStep,
} from '@database';
import { generateId, NotificationService } from '@shared';

@Injectable()
export class IngestionStatusService {
  private readonly logger = new Logger('IngestionStatusService');

  constructor(
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly notificationService: NotificationService,
  ) {}

  async getLastStatusForFile(fileId: string): Promise<FileStatusEntity> {
    const res = await this.db
      .select()
      .from(FileStatus)
      .where(eq(FileStatus.fileId, fileId))
      .orderBy(desc(FileStatus.createdAt))
      .limit(1);

    if (res.length === 0) {
      throw new Error(`No status found for file ${fileId}`);
    }

    return res[0];
  }

  async setNewStatusForFile(
    fileId: string,
    step: FileStatusStep,
    setCompletedAt = true,
  ): Promise<void> {
    const lastStep = await this.getLastStatusForFile(fileId);
    if (lastStep.step === step) {
      return;
    }

    await this.db
      .update(FileStatus)
      .set({
        completedAt: new Date(),
        failed: step === FileStatusStep.FAILED,
      })
      .where(eq(FileStatus.id, lastStep.id));

    const newStatus = await this.db
      .insert(FileStatus)
      .values({
        id: generateId(),
        fileId,
        step,
        completedAt: setCompletedAt ? new Date() : null,
      })
      .returning();

    this.notificationService.emitFileStatusUpdate(fileId, newStatus[0]);
  }
}
