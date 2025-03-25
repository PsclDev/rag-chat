import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import * as zlib from 'zlib';

import { Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { ConfigService } from '@config';
import {
  DrizzleDb,
  File,
  FileEntity,
  DocumentQueue,
  DocumentQueueEntity,
  DocumentEntity,
} from '@database';
import { DocumentStatusStep } from '@documents/dto/document.dto';
import { IngestionStatusService } from '@ingestion/ingestion-status.service';
import { UnstructuredService } from '@ingestion/unstructured.service';
import {
  DocumentIngestionVo,
  UnstructuredOrigElement,
} from '@ingestion/vo/ingestion.vo';
import { generateFilePath, generateId } from '@shared';
import {
  EmbeddingService,
  ImageEmbeddingVo,
} from 'shared/embedding/embedding.service';

export abstract class BaseProcessor {
  protected readonly logger = new Logger('BaseProcessor');
  protected queuedDocument: DocumentQueueEntity;
  protected document: DocumentEntity;
  protected abortSignal: AbortSignal;

  abstract specificProcess(): Promise<void>;

  constructor(
    public readonly configService: ConfigService,
    public readonly db: DrizzleDb,
    public readonly ingestionStatusService: IngestionStatusService,
    public readonly unstructuredService: UnstructuredService,
    public readonly embeddingService: EmbeddingService,
    ingestionDocument: DocumentIngestionVo,
    abortSignal: AbortSignal,
  ) {
    this.queuedDocument = ingestionDocument.queue;
    this.document = ingestionDocument.document;
    this.abortSignal = abortSignal;
  }

  async process(): Promise<void> {
    this.logger.debug(`Starting processing document: ${this.document.id}`);
    try {
      await this.ingestionStatusService.setNewStatus(
        this.document.id,
        DocumentStatusStep.PROCESSING,
      );

      await this.specificProcess();

      await this.ingestionStatusService.setNewStatus(
        this.document.id,
        DocumentStatusStep.COMPLETED,
      );
      await this.db
        .update(DocumentQueue)
        .set({
          isCompleted: true,
          isProcessing: false,
          completedAt: new Date(),
        })
        .where(eq(DocumentQueue.id, this.queuedDocument.id));
      this.logger.debug(`Finished processing document: ${this.document.id}`);
    } catch (error) {
      this.ingestionStatusService.setNewStatus(
        this.document.id,
        DocumentStatusStep.FAILED,
      );

      this.logger.error(
        `Error processing document: ${this.document.id}`,
        error,
      );
      throw error;
    }
  }

  preprocessText(text: string): string {
    return (
      text
        // Remove standalone numbers (likely page numbers)
        .replace(/^\d+$|(?<=\n)\d+(?=\n)/gm, '')
        // Fix hyphenated words (like "An- bindung" -> "Anbindung")
        .replace(/(\w+)-\s+(\w+)/g, (_, p1, p2) => {
          // Only join if both parts are purely alphabetical
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (/^[a-zA-Z]+$/.test(p1) && /^[a-zA-Z]+$/.test(p2)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return p1 + p2;
          }
          // Otherwise keep the hyphen
          return `${p1}-${p2}`;
        })
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\r\n]+/g, ' ') // Replace newlines with space
        .trim() // Remove leading/trailing whitespace
        .replace(/\s+/g, ' ') // Clean up any double spaces that might have been created
    );
  }

  private async deflateOrigElements(
    origElements: string[],
  ): Promise<UnstructuredOrigElement[]> {
    const inflateAsync = promisify(zlib.inflate);
    const deflatedOrigElements = await Promise.all(
      origElements.map(async (element) => {
        const deflated = await inflateAsync(Buffer.from(element, 'base64'));
        return JSON.parse(
          deflated.toString('utf8'),
        ) as UnstructuredOrigElement[];
      }),
    );

    return deflatedOrigElements.flat();
  }

  async extractImages(origElements: string[]): Promise<ImageEmbeddingVo[]> {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/tiff': 'tif',
    };

    const deflatedOrigElements = await this.deflateOrigElements(origElements);
    const imageBlocks = deflatedOrigElements.filter(
      (element) => element.type === 'Image',
    );
    this.logger.log(`Found ${imageBlocks.length} image blocks`);

    const files: Partial<FileEntity>[] = [];
    const images: ImageEmbeddingVo[] = [];
    for (const imageBlock of imageBlocks) {
      const id = generateId();
      const extension = mimeMap[imageBlock.metadata.image_mime_type];
      const mimeType = imageBlock.metadata.image_mime_type;
      const base64 = imageBlock.metadata.image_base64;

      const filePath = generateFilePath(
        this.configService.fileStorage.path,
        this.document.id,
        extension,
        id,
      );
      const imageBuffer = Buffer.from(base64, 'base64');

      await writeFile(filePath, imageBuffer);
      files.push({
        id,
        originalname: `${id}.${extension}`,
        mimetype: mimeType,
        path: filePath,
        size: imageBuffer.length,
        type: 'attachment',
      });
      images.push({
        fileId: id,
        mimeType,
        base64Image: base64,
      });
    }

    await this.db.insert(File).values(files as FileEntity[]);
    return images;
  }
}
