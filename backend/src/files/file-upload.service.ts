import * as fs from 'fs';

import { BadRequestException, Injectable } from '@nestjs/common';

import { FileUploadResultDto, RejectedFileDto } from './dto/upload.dto';

@Injectable()
export class FileUploadService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ] as const;
  private readonly maxFileSize = 100 * 1024 * 1024;

  handleUpload(files: Express.Multer.File[]): FileUploadResultDto {
    if (!files?.length) {
      throw new BadRequestException('no files uploaded');
    }

    const validFiles: Express.Multer.File[] = [];
    const rejectedFiles: RejectedFileDto[] = [];

    for (const file of files) {
      try {
        this.validateFile(file);
        const newPath = this.moveFileToStorage(file);
        validFiles.push({ ...file, path: newPath });
      } catch (error) {
        fs.unlinkSync(file.path);
        rejectedFiles.push({
          file,
          reason: error.message,
        });
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

  private moveFileToStorage(file: Express.Multer.File): string {
    const today = new Date();
    const dateFolder = `${today.getFullYear()}/${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    const storageDir = `data/storage/${dateFolder}`;
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const newPath = file.path.replace('data/temp', storageDir);
    fs.renameSync(file.path, newPath);
    return newPath;
  }
}
