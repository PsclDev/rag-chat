import { Controller, Get } from '@nestjs/common';

import { FileDto } from './dto/file.dto';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  async getFiles(): Promise<FileDto[]> {
    const result = await this.fileService.getFiles();
    return result;
  }
}
