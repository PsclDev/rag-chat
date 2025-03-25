import { createReadStream } from 'fs';

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { FileUploadResultDto } from './dto/upload.dto';
import { FileUploadService } from './file-upload.service';
import { FileService } from './file.service';

import type { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<FileUploadResultDto> {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const result = await this.fileUploadService.handleUpload(files);
    return result;
  }

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.fileService.getFile(id);
    const stream = createReadStream(file.path);
    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.originalname)}`,
      'Content-Length': file.size.toString(),
    });
    return new StreamableFile(stream);
  }
}
