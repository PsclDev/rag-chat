import * as fs from 'fs';

import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import * as schema from '@database';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { generateId } from 'shared';

import { FileDto } from './dto/file.dto';
import { FileUploadResultDto, RejectedFileDto } from './dto/upload.dto';
import { FileEntity, toFileDto } from './schema/file.schema';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger('FileUploadService');
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ] as const;
  private readonly maxFileSize = 100 * 1024 * 1024;

  constructor(
    private readonly config: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async handleUpload(
    files: Express.Multer.File[],
  ): Promise<FileUploadResultDto> {
    if (!files?.length) {
      throw new BadRequestException('no files uploaded');
    }

    const validFiles: FileDto[] = [];
    const rejectedFiles: RejectedFileDto[] = [];

    for (const file of files) {
      const fileId = generateId();
      const filePath = this.generateFilePath(fileId, file);

      try {
        this.validateFile(file);
        this.moveFileToStorage(file.path, filePath);
        const createdFile = await this.insertToDb(fileId, filePath, file);
        validFiles.push(createdFile);
      } catch (error: unknown) {
        this.cleanupOnFailure(file.path, filePath);

        rejectedFiles.push({
          file,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error(error);
      }
    }

    return { validFiles, rejectedFiles };
  }

  private validateFile(file: Express.Multer.File): void {
    if (!this.allowedMimeTypes.includes(file.mimetype as any)) {
      throw new Error(
        `Invalid file type. Allowed types are: ${this.allowedMimeTypes.join(
          ', ',
        )}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.maxFileSize} bytes`,
      );
    }
  }

  private generateFilePath(fileId: string, file: Express.Multer.File): string {
    const today = new Date();
    const dateFolder = `${today.getFullYear()}/${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    const extension = file.path.split('.').pop();

    return `${this.config.fileStorage.path}/${dateFolder}/${fileId}.${extension}`;
  }

  private moveFileToStorage(oldPath: string, newPath: string): void {
    const dirPath = newPath.substring(0, newPath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.renameSync(oldPath, newPath);
  }

  private async insertToDb(
    id: string,
    path: string,
    meta: Express.Multer.File,
  ): Promise<FileDto> {
    const [result]: FileEntity[] = await this.db.transaction(async (tx) => {
      await tx.insert(schema.File).values({
        id,
        path,
        size: meta.size,
        mimetype: meta.mimetype,
        originalname: meta.originalname,
        filename: meta.filename,
      });

      await tx.insert(schema.FileQueue).values({
        id: generateId(),
        fileId: id,
      });

      await tx.insert(schema.FileStatus).values({
        id: generateId(),
        fileId: id,
      });

      return await tx.query.File.findMany({
        where: eq(schema.File.id, id),
        with: {
          status: true,
        },
      });
    });

    return toFileDto(result);
  }

  private cleanupOnFailure(oldPath: string, newPath: string): void {
    try {
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    } catch (unlinkError: unknown) {
      const errorMessage =
        unlinkError instanceof Error ? unlinkError.message : 'Unknown error';
      this.logger.warn(
        `Failed to delete temporary file ${oldPath}: ${errorMessage}`,
      );
    }

    try {
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }
    } catch (unlinkError: unknown) {
      const errorMessage =
        unlinkError instanceof Error ? unlinkError.message : 'Unknown error';
      this.logger.warn(`Failed to delete file ${newPath}: ${errorMessage}`);
    }
  }
}
