import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import pLimit from 'p-limit';

import { ConfigService } from '@config';
import { DrizzleDb, File, InjectDrizzle } from '@database';

import { IngestionQueueService } from './ingestion-queue.service';
import { ProcessorFactory } from './processors';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger('IngestionService');
  private isProcessing = false;
  private isShuttingDown = false;
  private readonly fileAbortControllers = new Map<string, AbortController>();

  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly queue: IngestionQueueService,
    private readonly processorFactory: ProcessorFactory,
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
          this.logger.debug('No files to process, waiting 15 seconds...');
          await this.sleep(15000);
          continue;
        }

        const limit = pLimit(this.configService.ingestion.batchSize);
        await Promise.all(
          filesToIngest.map((queuedFile) =>
            limit(async () => {
              if (this.isShuttingDown) return;

              // Create a new abort controller for this file
              const fileAbortController = new AbortController();
              this.fileAbortControllers.set(queuedFile.id, fileAbortController);

              try {
                const file = await this.db.query.File.findFirst({
                  where: eq(File.id, queuedFile.fileId),
                });
                if (!file) {
                  this.logger.warn(`File ${queuedFile.fileId} not found`);
                  return;
                }

                const processable = this.processorFactory.canFileBeProcessed(
                  file.mimetype,
                );
                if (!processable) {
                  this.logger.warn(
                    `File ${file.id} is not processable, mimetype: ${file.mimetype}`,
                  );
                  return;
                }

                const processor = this.processorFactory.create(file.mimetype);
                if (!processor) {
                  this.logger.warn(`No processor found for file ${file.id}`);
                  return;
                }

                await processor.process(
                  { queue: queuedFile, file },
                  fileAbortController.signal,
                );
              } catch (error: unknown) {
                if (error instanceof Error) {
                  if (error.name === 'AbortError') {
                    this.logger.warn(
                      `Processing of file ${queuedFile.fileId} was aborted`,
                    );
                  } else {
                    this.logger.error(
                      `Error processing file ${queuedFile.fileId}: ${error.message}`,
                      error.stack,
                    );
                  }
                }
              } finally {
                // Clean up the abort controller
                this.fileAbortControllers.delete(queuedFile.id);
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

  onApplicationShutdown(): void {
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
  abortFile(fileId: string): boolean {
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
}
