import { ConfigService } from '@config';
import {
  DrizzleDb,
  FileQueue,
  InjectDrizzle,
  FileQueueEntity,
} from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

export interface FileQueueItem extends FileQueueEntity {
  file: {
    size: number;
  };
}

@Injectable()
export class IngestionQueueService {
  private readonly logger = new Logger('IngestionQueueService');
  private isFirstRun = true;

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
  ) {}

  getFilesToIngest(): Promise<FileQueueItem[]> {
    return this.db.transaction(async (trx) => {
      const whereCondition = this.isFirstRun
        ? `fq.is_completed = false AND fq.is_processing = true AND fq.node_id = '${this.configService.nodeId}'`
        : 'fq.is_completed = false AND fq.node_id IS NULL';

      const { rows: files } = await trx.execute(
        `SELECT fq.id, fq.file_id, fq.node_id, fq.is_processing, fq.is_completed, fq.enqueued_at, fq.completed_at, f.size
      FROM file_queue fq
      INNER JOIN file f ON fq.file_id = f.id
      WHERE ${whereCondition}
      ORDER BY fq.enqueued_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${this.configService.ingestion.batchSize}`,
      );

      if (this.isFirstRun) {
        this.isFirstRun = false;
        if (files.length > 0) {
          this.logger.warn(
            `Found ${files.length} stuck files from previous crash`,
          );
          return files;
        }
        // If no stuck files found, immediately try again with isFirstRun = false
        return this.getFilesToIngest();
      }

      if (files.length === 0) return [];

      await trx
        .update(FileQueue)
        .set({
          isProcessing: true,
          nodeId: this.configService.nodeId,
        })
        .where(
          inArray(
            FileQueue.id,
            files.map((f) => f.id),
          ),
        );

      return files;
    });
  }
}
