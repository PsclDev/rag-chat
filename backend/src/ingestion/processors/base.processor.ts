import { ConfigService } from '@config';
import { DrizzleDb, FileQueue, FileStatusStep, InjectDrizzle } from '@database';
import { IngestionStatusService } from '@ingestion/ingestion-status.service';
import { UnstructuredService } from '@ingestion/unstructured.service';
import { FileIngestionVo } from '@ingestion/vo/ingestion.vo';
import { Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { EmbeddingService } from 'shared/embedding/embedding.service';

export abstract class BaseProcessor {
  protected readonly logger = new Logger('BaseProcessor');
  abstract supportedMimetypes: string[];
  abstract specificProcess(
    ingestion: FileIngestionVo,
    signal: AbortSignal,
  ): Promise<void>;

  constructor(
    public readonly configService: ConfigService,
    @InjectDrizzle() public readonly db: DrizzleDb,
    public readonly ingestionStatusService: IngestionStatusService,
    public readonly unstructuredService: UnstructuredService,
    public readonly embeddingService: EmbeddingService,
  ) {}

  async process(
    ingestion: FileIngestionVo,
    abortSignal: AbortSignal,
  ): Promise<void> {
    this.logger.debug(`Starting processing file: ${ingestion.file.id}`);
    try {
      await this.ingestionStatusService.setNewStatusForFile(
        ingestion.file.id,
        FileStatusStep.PROCESSING,
      );

      await this.specificProcess(ingestion, abortSignal);

      await this.ingestionStatusService.setNewStatusForFile(
        ingestion.file.id,
        FileStatusStep.COMPLETED,
        true,
      );
      await this.db
        .update(FileQueue)
        .set({
          isCompleted: true,
          isProcessing: false,
          completedAt: new Date(),
        })
        .where(eq(FileQueue.id, ingestion.queue.id));
      this.logger.debug(`Finished processing file: ${ingestion.file.id}`);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.warn(`Processing of file ${ingestion.file.id} was aborted`);
        return;
      }

      this.ingestionStatusService.setNewStatusForFile(
        ingestion.file.id,
        FileStatusStep.FAILED,
      );

      this.logger.error(`Error processing file: ${ingestion.file.id}`, error);
      throw error;
    }
  }

  /**
   * Preprocesses text by cleaning and normalizing it for better processing:
   * - Removes standalone numbers (like page numbers)
   * - Joins hyphenated words (e.g. "pre- process" -> "preprocess") if both parts are alphabetical
   * - Normalizes whitespace by replacing multiple spaces and newlines with single spaces
   * - Removes special characters while preserving basic punctuation (.,!?-)
   * - Trims leading/trailing whitespace
   *
   * @param text - The raw text to preprocess
   * @returns The cleaned and normalized text string
   */
  preprocessText(text: string): string {
    return (
      text
        // Remove standalone numbers (likely page numbers)
        .replace(/^\d+$|(?<=\n)\d+(?=\n)/gm, '')
        // Fix hyphenated words (like "An- bindung" -> "Anbindung")
        .replace(/(\w+)-\s+(\w+)/g, (_, p1, p2) => {
          // Only join if both parts are purely alphabetical
          if (/^[a-zA-Z]+$/.test(p1) && /^[a-zA-Z]+$/.test(p2)) {
            return p1 + p2;
          }
          // Otherwise keep the hyphen
          return `${p1}-${p2}`;
        })
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\r\n]+/g, ' ') // Replace newlines with space
        .trim() // Remove leading/trailing whitespace
        .replace(/[^\w\s.,!?-]/g, '') // Remove special characters except basic punctuation
        .replace(/\s+/g, ' ')
    ); // Clean up any double spaces that might have been created
  }
}
