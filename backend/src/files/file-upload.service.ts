import * as fs from 'fs';

import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import pLimit from 'p-limit';

import { ConfigService } from '@config';
import {
  DocumentQueue,
  DocumentStatus,
  DrizzleDb,
  File,
  InjectDrizzle,
} from '@database';
import { Document } from '@documents/schema/document.schema';
import { generateFilePath, generateId } from 'shared';

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './definition';
import { FileDto } from './dto/file.dto';
import { FileUploadResultDto, RejectedFileDto } from './dto/upload.dto';
import { FileEntity, toFileDto } from './schema/file.schema';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger('FileUploadService');
  private readonly limit = pLimit(3);

  constructor(
    private readonly config: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async handleUpload(
    files: Express.Multer.File[],
  ): Promise<FileUploadResultDto> {
    const processedFiles = await Promise.all(
      files.map((file) => this.limit(() => this.processFile(file))),
    );

    return processedFiles.reduce<FileUploadResultDto>(
      (acc, result) => {
        if ('reason' in result) {
          acc.rejectedFiles.push(result);
        } else {
          acc.validFiles.push(result);
        }
        return acc;
      },
      { validFiles: [], rejectedFiles: [] },
    );
  }

  private async processFile(
    file: Express.Multer.File,
  ): Promise<FileDto | RejectedFileDto> {
    const fileId = generateId();
    const extension = file.path.split('.').pop()!;
    const filePath = generateFilePath(
      this.config.fileStorage.path,
      fileId,
      extension,
    );

    try {
      this.validateFile(file);
      await this.moveFileToStorage(file.path, filePath);

      return await this.insertToDb(fileId, filePath, file);
    } catch (error: unknown) {
      await this.cleanupOnFailure(file.path, filePath);
      this.logger.error(`File ${file.originalname} failed to upload `);

      return {
        file,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type. Allowed types are: ${ALLOWED_MIME_TYPES.join(
          ', ',
        )}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
      );
    }
  }

  private async moveFileToStorage(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const dirPath = newPath.substring(0, newPath.lastIndexOf('/'));
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.rename(oldPath, newPath);
  }

  private async insertToDb(
    id: string,
    path: string,
    meta: Express.Multer.File,
  ): Promise<FileDto> {
    const [result]: FileEntity[] = await this.db.transaction(async (tx) => {
      await tx.insert(File).values({
        id,
        path,
        size: meta.size,
        mimetype: meta.mimetype,
        originalname: meta.originalname,
        type: 'document',
      });

      const document = await tx
        .insert(Document)
        .values({
          fileId: id,
        })
        .returning();

      await tx.insert(DocumentQueue).values({
        documentId: document[0].id,
      });

      await tx.insert(DocumentStatus).values({
        documentId: document[0].id,
      });

      return await tx.query.File.findMany({
        where: eq(File.id, id),
      });
    });

    return toFileDto(result);
  }

  private async cleanupOnFailure(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const tryRemove = async (path: string) => {
      try {
        await fs.promises.unlink(path);
      } catch (unlinkError: unknown) {
        const errorMessage =
          unlinkError instanceof Error ? unlinkError.message : 'Unknown error';
        this.logger.warn(`Failed to delete file ${path}: ${errorMessage}`);
      }
    };

    await Promise.all([tryRemove(oldPath), tryRemove(newPath)]);
  }
}
