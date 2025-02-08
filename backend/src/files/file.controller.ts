import { createReadStream } from 'fs';

import { toDto } from '@database';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';

import { FileDto } from './dto/file.dto';
import { FileService } from './file.service';

import type { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  async getFiles(): Promise<FileDto[]> {
    const result = await this.fileService.getFiles();
    return result.map(toDto);
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
      'Content-Disposition': `attachment; filename="${file.originalname}"`,
      'Content-Length': file.size.toString(),
    });
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Param('id') id: string): Promise<void> {
    await this.fileService.deleteFile(id);
  }
}
