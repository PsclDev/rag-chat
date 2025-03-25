import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import pLimit from 'p-limit';

import { ConfigService } from '@config';
import { DocumentQueue, DrizzleDb, InjectDrizzle, Document } from '@database';
import { EmbeddingService } from '@shared/embedding/embedding.service';

import { IngestionQueueService } from './ingestion-queue.service';
import { IngestionStatusService } from './ingestion-status.service';
import { ProcessorFactory } from './processors';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger('IngestionService');
  private isProcessing = false;
  private isShuttingDown = false;
  private readonly documentAbortControllers = new Map<string, AbortController>();
  constructor(
    private readonly configService: ConfigService,
    @InjectDrizzle() private readonly db: DrizzleDb,
    private readonly queue: IngestionQueueService,
    private readonly statusService: IngestionStatusService,
    private readonly embeddingService: EmbeddingService,
    private readonly processorFactory: ProcessorFactory,
  ) { }

  async startIngestion(): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn('Ingestion already in progress');
      return;
    }

    this.isProcessing = true;
    this.logger.log('Starting ingestion service...');

    try {
      while (!this.isShuttingDown) {
        const documentsToIngest = await this.queue.getDocumentsToIngest();
        if (documentsToIngest.length === 0) {
          this.logger.verbose('No documents to process, waiting 15 seconds...');
          await this.sleep(15000);
          continue;
        }

        const limit = pLimit(this.configService.ingestion.batchSize);
        await Promise.all(
          documentsToIngest.map((queuedDocument) =>
            limit(async () => {
              if (this.isShuttingDown) return;

              try {
                const document = await this.db.query.Document.findFirst({
                  where: eq(Document.id, queuedDocument.documentId),
                  with: {
                    file: true,
                    status: true,
                    attachments: true,
                  },
                });
                if (!document) {
                  this.logger.warn(`Document ${queuedDocument.documentId} not found`);
                  return;
                }

                const processable = this.processorFactory.canFileBeProcessed(
                  document.file.mimetype,
                );
                if (!processable) {
                  this.logger.warn(
                    `Document ${document.id} is not processable, mimetype: ${document.file.mimetype}`,
                  );
                  return;
                }

                const documentAbortController = new AbortController();
                this.documentAbortControllers.set(
                  queuedDocument.documentId,
                  documentAbortController,
                );

                const processor = this.processorFactory.create(
                  {
                    queue: queuedDocument,
                    document,
                  },
                  documentAbortController.signal,
                );
                if (!processor) {
                  this.logger.warn(`No processor found for document ${document.id}`);
                  return;
                }

                await processor.process();
              } catch (error: unknown) {
                if (error instanceof Error) {
                  if (error.name === 'AbortIngestion') {
                    this.logger.warn(
                      `Processing of document ${queuedDocument.documentId} was aborted`,
                    );
                  } else {
                    this.logger.error(
                      `Error processing document ${queuedDocument.documentId}: ${error.message}`,
                      error.stack,
                    );
                  }

                  await this.db
                    .update(DocumentQueue)
                    .set({
                      isProcessing: false,
                      isCompleted: true,
                      completedAt: new Date(),
                    })
                    .where(eq(DocumentQueue.id, queuedDocument.id));
                }
              } finally {
                this.documentAbortControllers.delete(queuedDocument.id);
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

    for (const controller of this.documentAbortControllers.values()) {
      controller.abort();
    }
    this.documentAbortControllers.clear();
  }

  async reingestDocument(documentId: string): Promise<void> {
    this.abortDocument(documentId);

    await this.statusService.resetStatusForDocument(documentId);
    await this.embeddingService.deleteAllEmbeddings(documentId);
    await this.db
      .update(DocumentQueue)
      .set({
        nodeId: null,
        isProcessing: false,
        isCompleted: false,
        completedAt: null,
      })
      .where(eq(DocumentQueue.documentId, documentId));
  }

  abortDocument(documentId: string): boolean {
    const controller = this.documentAbortControllers.get(documentId);
    if (!controller) {
      this.logger.warn(`No active processing found for document ${documentId}`);
      return false;
    }

    this.logger.log(`Sending abort signal for document ${documentId}`);
    controller.abort('AbortIngestion');
    this.documentAbortControllers.delete(documentId);
    return true;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
