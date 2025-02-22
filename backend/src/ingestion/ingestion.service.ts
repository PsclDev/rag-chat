import { ConfigService } from '@config';
import {
  DrizzleDb,
  FileQueue,
  InjectDrizzle,
  FileQueueEntity,
} from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import pLimit from 'p-limit';

import { IngestionQueueService } from './ingestion-queue.service';

interface FileQueueItem extends FileQueueEntity {
  file: {
    size: number;
  };
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger('IngestionService');
  private isFirstRun = true;
  private isProcessing = false;
  private isShuttingDown = false;
  private readonly fileAbortControllers = new Map<string, AbortController>();

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly queue: IngestionQueueService,
  ) {}

  async startIngestion(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Ingestion already in progress');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting ingestion service...');

    try {
      while (!this.isShuttingDown) {
        const filesToIngest = await this.queue.getFilesToIngest();
        if (filesToIngest.length === 0) {
          this.logger.debug('No files to process, waiting 5 seconds...');
          await this.sleep(5000);
          continue;
        }

        const limit = pLimit(this.configService.ingestion.batchSize);
        await Promise.all(
          filesToIngest.map((file) =>
            limit(async () => {
              if (this.isShuttingDown) return;

              // Create a new abort controller for this file
              const fileAbortController = new AbortController();
              this.fileAbortControllers.set(file.id, fileAbortController);

              try {
                await this.processFile(file, fileAbortController.signal);
              } catch (error: unknown) {
                if (error instanceof Error) {
                  if (error.name === 'AbortError') {
                    this.logger.warn(
                      `Processing of file ${file.id} was aborted`,
                    );
                  } else {
                    this.logger.error(
                      `Error processing file ${file.id}: ${error.message}`,
                      error.stack,
                    );
                  }
                }
              } finally {
                // Clean up the abort controller
                this.fileAbortControllers.delete(file.id);
              }
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error('Fatal error in ingestion service:', error);
    } finally {
      this.isProcessing = false;
      this.logger.log('Ingestion service stopped.');
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.logger.warn('Application is shutting down. Stopping ingestion...');
    this.isShuttingDown = true;

    // Abort all ongoing file processing
    for (const controller of this.fileAbortControllers.values()) {
      controller.abort();
    }
    this.fileAbortControllers.clear();
  }

  /**
   * Abort processing of a specific file
   * @param fileId The ID of the file to abort processing for
   * @returns true if the file was being processed and was aborted, false otherwise
   */
  async abortFile(fileId: string): Promise<boolean> {
    const controller = this.fileAbortControllers.get(fileId);
    if (!controller) {
      this.logger.warn(`No active processing found for file ${fileId}`);
      return false;
    }

    controller.abort();
    this.fileAbortControllers.delete(fileId);
    this.logger.log(`Aborted processing for file ${fileId}`);
    return true;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async processFile(
    file: FileQueueItem,
    signal: AbortSignal,
  ): Promise<void> {
    if (signal.aborted) throw new Error('AbortError');

    this.logger.log(`Processing file: ${file.id}`);
    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, 4500); // Simulate processing
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('AbortError'));
        });
      });

      // Update file status after successful processing
      await this.db
        .update(FileQueue)
        .set({
          isCompleted: true,
          isProcessing: false,
          completedAt: new Date(),
        })
        .where(inArray(FileQueue.id, [file.id]));
    } catch (error) {
      throw error;
    }
  }
}
