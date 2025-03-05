import {
  DrizzleDb,
  InjectDrizzle,
  FileStatus,
  FileStatusEntity,
  FileStatusStep,
} from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { generateId } from 'shared';

@Injectable()
export class IngestionStatusService {
  private readonly logger = new Logger('IngestionStatusService');

  constructor(@InjectDrizzle() private readonly db: DrizzleDb) {}

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

    await this.db.insert(FileStatus).values({
      id: generateId(),
      fileId,
      step,
      completedAt: setCompletedAt ? new Date() : null,
    });
  }
}
